import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { SITE } from '../lib/site';
import type { Reservation } from '../lib/types';
import { dh, frDate } from './Admin';

type When = 'upcoming' | 'past' | 'all';
const STATUS: Record<Reservation['status'], string> = { pending: 'En attente', confirmed: 'Confirmée', cancelled: 'Annulée' };
const CAP = SITE.boats * SITE.seatsPerBoat;
const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Casablanca' }).format(new Date());

export default function ReservationsTab({ onAuthError }: { onAuthError: (e: unknown) => void }) {
  const [list, setList] = useState<Reservation[] | null>(null);
  const [when, setWhen] = useState<When>('upcoming');
  const [status, setStatus] = useState<'all' | Reservation['status']>('all');
  const [q, setQ] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => api.reservations().then(setList).catch(onAuthError);
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const today = todayIso();
  const filtered = useMemo(() => {
    const nq = q.trim().toLowerCase();
    const out = (list ?? []).filter((r) =>
      (when === 'all' || (when === 'upcoming' ? r.date >= today : r.date < today)) &&
      (status === 'all' || r.status === status) &&
      (!nq || [r.name, r.phone, r.email, r.ref].some((v) => v?.toLowerCase().includes(nq))));
    return when === 'past' ? out.reverse() : out;
  }, [list, when, status, q, today]);

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
    revenue: upcoming.filter((r) => r.status === 'confirmed').reduce((a, r) => a + r.total, 0),
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
    if (d.startsWith('0')) d = '212' + d.slice(1);
    return `https://wa.me/${d}`;
  };

  return (
    <div className="adm-page">
      <header className="adm-page__head">
        <div>
          <h1 className="display">Réservations</h1>
          <p>{SITE.pricePerPerson} DH / personne · {SITE.boats} bateaux × {SITE.seatsPerBoat} places</p>
        </div>
        <button className="btn ghost sm" onClick={load}>↻ Actualiser</button>
      </header>

      <div className="adm-stats">
        <div className="adm-stat"><small>Sorties à venir</small><b className="display">{stats.trips}</b></div>
        <div className="adm-stat"><small>Pêcheurs à venir</small><b className="display">{stats.people}</b></div>
        <div className="adm-stat adm-stat--warn"><small>À confirmer</small><b className="display">{stats.pending}</b></div>
        <div className="adm-stat adm-stat--gold"><small>CA confirmé à venir</small><b className="display">{dh(stats.revenue)}</b></div>
      </div>

      <div className="adm-filters">
        <div className="adm-seg">
          {(['upcoming', 'past', 'all'] as const).map((k) => (
            <button key={k} className={when === k ? 'is-on' : ''} onClick={() => setWhen(k)}>{{ upcoming: 'À venir', past: 'Passées', all: 'Toutes' }[k]}</button>
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
                      <span className="adm-ref">{r.ref}</span>
                      {r.message && <p className="adm-row__msg">« {r.message} »</p>}
                    </div>
                    <div className="adm-row__contact">
                      <a href={`tel:${r.phone}`}>{r.phone}</a>
                      <a href={wa(r.phone)} target="_blank" rel="noreferrer" className="adm-wa">WhatsApp</a>
                      {r.email && <a href={`mailto:${r.email}`}>{r.email}</a>}
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
    </div>
  );
}
