import { useEffect, useMemo, useState } from 'react';
import Calendar, { iso } from '../components/Calendar';
import { api } from '../lib/api';
import { SITE } from '../lib/site';
import type { BlockedDay, Reservation } from '../lib/types';
import { frDate } from './Admin';
import { Bolt } from '../components/icons';

type BlockType = 'blocked' | 'weather';


const CAP = SITE.boats * SITE.seatsPerBoat;
const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Casablanca' }).format(new Date());

export default function AvailabilityTab({ onAuthError }: { onAuthError: (e: unknown) => void }) {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [blocked, setBlocked] = useState<BlockedDay[]>([]);
  const [res, setRes] = useState<Reservation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [range, setRange] = useState({ from: '', to: '', reason: '' });
  const [note, setNote] = useState('');

  const load = () => Promise.all([api.blocked(), api.reservations()]).then(([b, r]) => { setBlocked(b); setRes(r); }).catch(onAuthError);
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const blockedMap = useMemo(() => new Map(blocked.map((b) => [b.date, b])), [blocked]);
  const bookedOn = (d: string) => res.filter((r) => r.date === d && r.status !== 'cancelled').reduce((a, r) => a + r.people, 0);
  const today = todayIso();

  const toggle = async (date: string, why = '', type: BlockType = 'blocked') => {
    try {
      if (blockedMap.has(date)) {
        await api.unblock(date);
        setNote(`${frDate(date)} est de nouveau ouvert aux réservations.`);
      } else {
        const r = await api.block(date, why, type);
        const label = type === 'weather' ? 'marqué « Mauvais temps » ⚡' : 'bloqué';
        setNote(r.affected
          ? `⚠️ ${frDate(date)} ${label} - ${r.affected} réservation(s) existent déjà ce jour-là : pensez à prévenir les clients.`
          : `${frDate(date)} ${label}.`);
      }
      setReason('');
      load();
    } catch (e) { onAuthError(e); }
  };

  const blockRange = async (type: BlockType = 'blocked') => {
    if (!range.from || !range.to || range.to < range.from) return;
    const d = new Date(range.from + 'T12:00:00');
    const end = new Date(range.to + 'T12:00:00');
    let n = 0;
    try {
      for (; d <= end && n < 120; d.setDate(d.getDate() + 1), n++) {
        const k = iso(d);
        if (blockedMap.get(k)?.type !== type) await api.block(k, range.reason, type);
      }
      setNote(`${n} jour(s) ${type === 'weather' ? 'marqué(s) « Mauvais temps » ⚡' : 'bloqué(s)'} du ${frDate(range.from, { day: 'numeric', month: 'long' })} au ${frDate(range.to, { day: 'numeric', month: 'long' })}.`);
      setRange({ from: '', to: '', reason: '' });
      load();
    } catch (e) { onAuthError(e); }
  };

  const dayRes = selected ? res.filter((r) => r.date === selected) : [];
  const upcomingBlocked = blocked.filter((b) => b.date >= today).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="adm-page">
      <header className="adm-page__head">
        <div>
          <h1 className="display">Disponibilités</h1>
          <p>Cliquez sur un jour pour le bloquer quand vous n'êtes pas disponible. Les clients ne pourront plus le réserver.</p>
        </div>
      </header>
      {note && <p className="adm-note">{note}</p>}

      <div className="adm-avail">
        <div className="adm-card">
          <Calendar
            month={month}
            onMonth={setMonth}
            locale="fr-FR"
            selected={selected}
            onSelect={setSelected}
            renderDay={(d) => {
              const b = blockedMap.get(d);
              const weather = b?.type === 'weather';
              const n = bookedOn(d);
              const past = d < today;
              return {
                className: `${past ? 'is-past' : ''} ${b ? (weather ? 'is-weather' : 'is-blocked') : ''} ${n >= CAP ? 'is-full' : n > CAP - 4 ? 'is-few' : ''} ${d === today ? 'is-today' : ''}`,
                title: b ? `${weather ? 'Mauvais temps' : 'Bloqué'}${b.reason ? ` : ${b.reason}` : ''}` : `${n}/${CAP} réservés`,
                content: b
                  ? weather ? <span className="cal__tag cal__tag--weather"><Bolt />Mauvais temps</span> : <span className="cal__tag">Bloqué</span>
                  : n ? <span className="cal__tag adm-cal__n">{n}/{CAP}</span> : null,
              };
            }}
          />
        </div>

        <div className="adm-avail__side">
          <div className="adm-card">
            {selected ? (
              <>
                <h3 className="adm-card__title">{frDate(selected)}</h3>
                {blockedMap.has(selected) ? (
                  <>
                    <p className="adm-muted">Ce jour est {blockedMap.get(selected)!.type === 'weather'
                      ? <b style={{ color: '#c4a5ff' }}>en mauvais temps ⚡</b>
                      : <b style={{ color: '#ff8a82' }}>bloqué</b>}{blockedMap.get(selected)!.reason ? ` - ${blockedMap.get(selected)!.reason}` : ''}.</p>
                    <button className="btn blue sm" onClick={() => toggle(selected)}>Rouvrir ce jour</button>
                  </>
                ) : (
                  <>
                    <p className="adm-muted">{bookedOn(selected)}/{CAP} places réservées.</p>
                    <div className="field"><label>Raison (privée, facultatif)</label><input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Tournoi, météo, repos…" /></div>
                    <div className="adm-split">
                      <button className="btn danger sm" onClick={() => toggle(selected, reason)}>Bloquer ce jour</button>
                      <button className="btn weather sm" onClick={() => toggle(selected, reason, 'weather')}><Bolt />Mauvais temps</button>
                    </div>
                  </>
                )}
                {dayRes.length > 0 && (
                  <ul className="adm-mini">
                    {dayRes.map((r) => <li key={r.id} className={`is-${r.status}`}><b>{r.name}</b> · {r.people} pers. · {r.phone}</li>)}
                  </ul>
                )}
              </>
            ) : <p className="adm-muted">Sélectionnez un jour dans le calendrier.</p>}
          </div>

          <div className="adm-card">
            <h3 className="adm-card__title">Bloquer une période</h3>
            <div className="adm-range">
              <div className="field"><label>Du</label><input type="date" min={today} value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} /></div>
              <div className="field"><label>Au</label><input type="date" min={range.from || today} value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /></div>
            </div>
            <div className="field"><label>Raison (facultatif)</label><input value={range.reason} onChange={(e) => setRange({ ...range, reason: e.target.value })} placeholder="Voyage IGFA, vacances…" /></div>
            <div className="adm-split">
              <button className="btn danger sm" disabled={!range.from || !range.to || range.to < range.from} onClick={() => blockRange()}>Bloquer la période</button>
              <button className="btn weather sm" disabled={!range.from || !range.to || range.to < range.from} onClick={() => blockRange('weather')}><Bolt />Mauvais temps</button>
            </div>
          </div>

          <div className="adm-card">
            <h3 className="adm-card__title">Jours indisponibles à venir ({upcomingBlocked.length})</h3>
            {upcomingBlocked.length === 0 && <p className="adm-muted">Aucun jour bloqué.</p>}
            <ul className="adm-blocked">
              {upcomingBlocked.map((b) => (
                <li key={b.date} className={b.type === 'weather' ? 'is-weather' : ''}>
                  <span>{b.type === 'weather' && <Bolt />}<b>{frDate(b.date, { weekday: 'short', day: 'numeric', month: 'short' })}</b>{b.reason && <small> · {b.reason}</small>}</span>
                  <button className="adm-icon-btn" title="Rouvrir" onClick={() => toggle(b.date)}>✕</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
