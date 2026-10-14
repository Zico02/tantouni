import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { api, ApiError } from '../lib/api';
import { scrollLock } from '../lib/motion';
import { SITE } from '../lib/site';
import type { DayAvailability, Reservation } from '../lib/types';
import { dh, frDate } from './Admin';

type When = 'today' | 'tomorrow' | 'upcoming' | 'past' | 'all';
const WHEN_LABEL: Record<When, string> = { today: "Aujourd'hui", tomorrow: 'Demain', upcoming: 'À venir', past: 'Passées', all: 'Toutes' };
// pending → confirmed (Omar called/messaged them) → paid (trip done, money received)
const STATUS: Record<Reservation['status'], string> = { pending: 'En attente', confirmed: 'Confirmée', paid: 'Payée ✓', cancelled: 'Annulée' };
const CAP = SITE.boats * SITE.seatsPerBoat;
const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Casablanca' }).format(new Date());
const tomorrowIso = () => {
  const d = new Date(todayIso() + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

const ERRORS: Record<string, string> = {
  missing_fields: 'Nom et téléphone obligatoires.',
  bad_date: 'Date invalide.',
  bad_people: 'Nombre de personnes invalide (1 à 10).',
  not_enough_seats: 'Plus assez de places ce jour-là.',
  family_unavailable: 'Family vs Family : les deux bateaux doivent être libres ce jour-là.',
};

// Booking taken by phone, WhatsApp or on the quay, entered by Omar himself.
function NewReservation({ onClose, onCreated, onAuthError }: { onClose: () => void; onCreated: (r: Reservation) => void; onAuthError: (e: unknown) => void }) {
  const [f, setF] = useState({ date: todayIso(), people: 1, name: '', phone: '', email: '', message: '', status: 'confirmed' as Reservation['status'], formula: 'standard' as 'standard' | 'family' });
  const family = f.formula === 'family';
  const [day, setDay] = useState<DayAvailability | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    scrollLock.lock();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => { scrollLock.unlock(); window.removeEventListener('keydown', k); };
  }, [onClose]);
  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) return;
    api.availability(f.date, f.date).then((r) => setDay(r.days[f.date] ?? null)).catch(() => setDay(null));
  }, [f.date]);

  const seatsLeft = day ? day.boatsLeft.reduce((a, b) => a + b, 0) : CAP;
  const familyBlocked = family && seatsLeft < CAP;
  const total = family ? SITE.familyPrice : f.people * SITE.pricePerPerson;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      onCreated(await api.createReservation({ ...f, people: family ? CAP : f.people }));
    } catch (e) {
      onAuthError(e);
      setErr(ERRORS[e instanceof ApiError ? e.message : ''] ?? "Impossible d'enregistrer la réservation.");
    }
    setBusy(false);
  };

  return (
    <motion.div className="adm-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form className="adm-modal__panel adm-modal__panel--sm" onSubmit={submit} onClick={(e) => e.stopPropagation()} initial={{ y: 40 }} animate={{ y: 0 }} data-lenis-prevent>
        <header className="adm-modal__head">
          <h2 className="display">Nouvelle réservation</h2>
          <button type="button" className="adm-icon-btn" onClick={onClose}>✕</button>
        </header>
        <div className="adm-newres">
          <div className="adm-grid3">
            <div className="field"><label>Date *</label><input type="date" required value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
            <div className="field">
              <label>Pêcheurs *</label>
              <select value={family ? CAP : f.people} disabled={family} onChange={(e) => setF({ ...f, people: Number(e.target.value) })}>
                {Array.from({ length: CAP }, (_, i) => <option key={i} value={i + 1} disabled={i + 1 > seatsLeft}>{i + 1}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Statut</label>
              <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as Reservation['status'] })}>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="paid">Payée ✓</option>
              </select>
            </div>
          </div>
          <label className={`adm-caught ${family ? 'is-on adm-caught--family' : ''}`}>
            <input type="checkbox" checked={family} onChange={(e) => setF({ ...f, formula: e.target.checked ? 'family' : 'standard' })} />
            <span>Family vs Family · les 2 bateaux privatisés · {dh(SITE.familyPrice)}</span>
          </label>
          <p className={`adm-newres__info ${(family ? familyBlocked : seatsLeft < f.people) ? 'is-bad' : ''}`}>
            {familyBlocked && <b>Les deux bateaux doivent être entièrement libres. </b>}
            {day?.blocked && <b>{day.weather ? '⚡ Jour marqué « Mauvais temps ». ' : '⛔ Jour bloqué. '}</b>}
            {seatsLeft} place{seatsLeft > 1 ? 's' : ''} libre{seatsLeft > 1 ? 's' : ''} ce jour-là
            {day && ` (Bateau 1 : ${day.boatsLeft[0]} · Bateau 2 : ${day.boatsLeft[1]})`} · Total : <b>{dh(total)}</b>
          </p>
          <div className="adm-grid2">
            <div className="field"><label>Nom complet *</label><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div className="field"><label>Téléphone / WhatsApp *</label><input required type="tel" dir="ltr" placeholder="+212 6…" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          </div>
          <div className="field"><label>E-mail (facultatif)</label><input type="email" dir="ltr" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <div className="field"><label>Note (facultatif)</label><textarea rows={3} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="Réservé par téléphone, acompte reçu…" /></div>
        </div>
        <footer className="adm-modal__foot">
          {err && <p className="adm-err">{err}</p>}
          <button type="button" className="btn ghost" onClick={onClose}>Annuler</button>
          <button className="btn" disabled={busy || (family ? familyBlocked : seatsLeft < f.people)}>{busy ? 'Enregistrement…' : 'Ajouter la réservation'}</button>
        </footer>
      </motion.form>
    </motion.div>
  );
}

export default function ReservationsTab({ onAuthError }: { onAuthError: (e: unknown) => void }) {
  const [list, setList] = useState<Reservation[] | null>(null);
  const [when, setWhen] = useState<When>('upcoming');
  const [status, setStatus] = useState<'all' | Reservation['status']>('all');
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');
  const [adding, setAdding] = useState(false);

  const load = () => api.reservations().then(setList).catch(onAuthError);
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const today = todayIso();
  const tomorrow = tomorrowIso();
  const inRange = (k: When, date: string) =>
    k === 'all' ? true
      : k === 'today' ? date === today
        : k === 'tomorrow' ? date === tomorrow
          : k === 'upcoming' ? date >= today
            : date < today;
  const counts = useMemo(() => {
    const live = (list ?? []).filter((r) => r.status !== 'cancelled');
    return Object.fromEntries((Object.keys(WHEN_LABEL) as When[]).map((k) => [k, live.filter((r) => inRange(k, r.date)).length])) as Record<When, number>;
  }, [list, today, tomorrow]); // eslint-disable-line react-hooks/exhaustive-deps

  // Open on today's trips when there are any, otherwise on everything upcoming.
  const [defaulted, setDefaulted] = useState(false);
  useEffect(() => {
    if (!list || defaulted) return;
    setDefaulted(true);
    if (counts.today > 0) setWhen('today');
  }, [list, counts, defaulted]);
  const filtered = useMemo(() => {
    const nq = q.trim().toLowerCase();
    const out = (list ?? []).filter((r) =>
      inRange(when, r.date) &&
      (status === 'all' || r.status === status) &&
      (!nq || [r.name, r.phone, r.email, r.ref].some((v) => v?.toLowerCase().includes(nq))));
    return when === 'past' ? out.reverse() : out;
  }, [list, when, status, q, today, tomorrow]); // eslint-disable-line react-hooks/exhaustive-deps

  const groups = useMemo(() => {
    const m = new Map<string, Reservation[]>();
    for (const r of filtered) m.set(r.date, [...(m.get(r.date) ?? []), r]);
    return [...m.entries()];
  }, [filtered]);

  const upcoming = (list ?? []).filter((r) => r.date >= today && r.status !== 'cancelled');
  const stats = {
    trips: new Set(upcoming.map((r) => r.date)).size,
    people: upcoming.reduce((a, r) => a + r.people, 0),
    pending: upcoming.filter((r) => r.status === 'pending').length,
    // revenue only counts money Omar actually received
    revenue: (list ?? []).filter((r) => r.status === 'paid').reduce((a, r) => a + r.total, 0),
    paidCount: (list ?? []).filter((r) => r.status === 'paid').length,
  };

  const update = async (r: Reservation, s: Reservation['status']) => {
    try {
      const u = await api.updateReservation(r.id, { status: s });
      setList((l) => l!.map((x) => (x.id === u.id ? u : x)));
      setMsg('');
    } catch (e) {
      onAuthError(e);
      setMsg((e as Error).message === 'not_enough_seats' ? 'Impossible de réactiver : plus assez de places ce jour-là.' : 'Erreur lors de la mise à jour.');
    }
  };
  const remove = async (r: Reservation) => {
    if (!confirm(`Supprimer définitivement la réservation ${r.ref} de ${r.name} ?`)) return;
    try {
      await api.deleteReservation(r.id);
      setList((l) => l!.filter((x) => x.id !== r.id));
    } catch (e) { onAuthError(e); }
  };

  const wa = (phone: string) => {
    let d = phone.replace(/\D/g, '');
    if (d.startsWith('00')) d = d.slice(2);
    else if (d.startsWith('0')) d = '212' + d.slice(1);
    return `https://wa.me/${d}`;
  };

  return (
    <div className="adm-page">
      <header className="adm-page__head">
        <div>
          <h1 className="display">Réservations</h1>
          <p>{SITE.pricePerPerson} DH / personne · {SITE.boats} bateaux × {SITE.seatsPerBoat} places</p>
        </div>
        <div className="adm-head-actions">
          <button className="btn ghost sm" onClick={load}>↻ Actualiser</button>
          <button className="btn sm" onClick={() => setAdding(true)}>+ Nouvelle réservation</button>
        </div>
      </header>

      <div className="adm-stats">
        <div className="adm-stat"><small>Sorties à venir</small><b className="display">{stats.trips}</b></div>
        <div className="adm-stat"><small>Pêcheurs à venir</small><b className="display">{stats.people}</b></div>
        <div className="adm-stat adm-stat--warn"><small>À confirmer</small><b className="display">{stats.pending}</b></div>
        <div className="adm-stat adm-stat--paid"><small>CA encaissé ({stats.paidCount} payée{stats.paidCount > 1 ? 's' : ''})</small><b className="display">{dh(stats.revenue)}</b></div>
      </div>

      <div className="adm-filters">
        <div className="adm-seg">
          {(['today', 'tomorrow', 'upcoming', 'past', 'all'] as const).map((k) => (
            <button key={k} className={when === k ? 'is-on' : ''} onClick={() => setWhen(k)}>
              {WHEN_LABEL[k]} <span className={`adm-count ${counts[k] ? '' : 'is-zero'}`}>{counts[k]}</span>
            </button>
          ))}
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="adm-select">
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input className="adm-input" placeholder="Nom, téléphone, référence…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {msg && <p className="adm-err">{msg}</p>}

      {!list && <p className="adm-muted">Chargement…</p>}
      {list && groups.length === 0 && <div className="adm-empty">Aucune réservation ici pour l'instant. 🎣</div>}

      <div className="adm-days">
        {groups.map(([date, rs]) => {
          const active = rs.filter((r) => r.status !== 'cancelled');
          const all = (list ?? []).filter((r) => r.date === date && r.status !== 'cancelled');
          const boats = Array.from({ length: SITE.boats }, (_, b) => all.reduce((a, r) => a + (r.allocation.find((x) => x.boat === b + 1)?.seats ?? 0), 0));
          const booked = boats.reduce((a, b) => a + b, 0);
          return (
            <section key={date} className="adm-day">
              <header>
                <h2>{frDate(date)}</h2>
                <div className="adm-day__meta">
                  <span className={`adm-pill ${booked >= CAP ? 'is-full' : ''}`}>{booked}/{CAP} places</span>
                  {boats.map((n, i) => <span key={i} className="adm-pill">Bateau {i + 1} : {n}/{SITE.seatsPerBoat}</span>)}
                  <span className="adm-pill adm-pill--gold">{dh(active.reduce((a, r) => a + r.total, 0))}</span>
                </div>
              </header>
              <div className="adm-table">
                {rs.map((r) => (
                  <div key={r.id} className={`adm-row is-${r.status}`}>
                    <div className="adm-row__who">
                      <b>{r.name}</b>
                      <span className="adm-ref">{r.ref}{r.formula === 'family' && <span className="adm-manual adm-family">Family vs Family</span>}{r.source === 'admin' && <span className="adm-manual">Ajoutée par l'admin</span>}</span>
                      {r.message && <p className="adm-row__msg">« {r.message} »</p>}
                    </div>
                    <div className="adm-row__contact">
                      <div className="adm-row__ids">
                        <span className="adm-phone">{r.phone}</span>
                        {r.email && <a href={`mailto:${r.email}`} className="adm-mail">{r.email}</a>}
                      </div>
                      <div className="adm-row__btns">
                        <a href={wa(r.phone)} target="_blank" rel="noreferrer" className="adm-cbtn adm-cbtn--wa" title={`WhatsApp ${r.phone}`} aria-label="WhatsApp">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" /></svg>
                        </a>
                        <a href={`tel:${r.phone.replace(/[^\d+]/g, '')}`} className="adm-cbtn adm-cbtn--call" title={`Appeler ${r.phone}`} aria-label="Appeler">
                          <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z" /></svg>
                        </a>
                      </div>
                    </div>
                    <div className="adm-row__num">
                      <b>{r.people}</b> pers.
                      <small>{r.allocation.map((a) => `B${a.boat}×${a.seats}`).join(' + ')}</small>
                    </div>
                    <div className="adm-row__total">{dh(r.total)}</div>
                    <select className={`adm-status is-${r.status}`} value={r.status} onChange={(e) => update(r, e.target.value as Reservation['status'])}>
                      {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <button className="adm-icon-btn" title="Supprimer" onClick={() => remove(r)}>🗑</button>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <AnimatePresence>
        {adding && (
          <NewReservation
            key="new"
            onClose={() => setAdding(false)}
            onAuthError={onAuthError}
            onCreated={(r) => { setList((l) => [...(l ?? []), r].sort((a, b) => a.date.localeCompare(b.date))); setAdding(false); setMsg(''); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
