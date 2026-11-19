import type { SeaDay } from '../lib/types';
import { frDate } from './Admin';

export type Spot = 'mohammedia' | 'rabat';
export const SPOT_LABEL: Record<Spot, string> = { mohammedia: 'Mohammedia', rabat: 'Rabat' };

// Rough guide for a day trip on a small boat. Omar decides; this only flags the risky days.
export type SeaLevel = 'good' | 'fair' | 'bad';
export function seaVerdict(d: SeaDay): { level: SeaLevel; label: string } {
  const gust = d.gust ?? 0;
  const storm = d.code !== null && d.code >= 95;
  if (storm || d.wave > 2.5 || gust > 45) return { level: 'bad', label: 'Déconseillé' };
  if (d.wave > 1.6 || gust > 32) return { level: 'fair', label: 'Mer agitée' };
  return { level: 'good', label: 'Bonne mer' };
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
const compass = (deg: number | null) => (deg === null ? '' : COMPASS[Math.round(deg / 45) % 8]);

// WMO weather codes -> short French label
function sky(code: number | null) {
  if (code === null) return '';
  if (code === 0) return 'Ensoleillé';
  if (code <= 2) return 'Peu nuageux';
  if (code === 3) return 'Couvert';
  if (code <= 48) return 'Brouillard';
  if (code <= 67) return 'Pluie';
  if (code <= 77) return 'Neige';
  if (code <= 82) return 'Averses';
  return 'Orage';
}

/** Arrow showing where the waves/wind go (the API gives where they come from). */
export const Dir = ({ deg }: { deg: number | null }) =>
  deg === null ? null : (
    <svg className="sea-dir" viewBox="0 0 24 24" width="14" height="14" style={{ transform: `rotate(${deg + 180}deg)` }} aria-hidden>
      <path d="M12 3v18M12 3l-5 6M12 3l5 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

export function SeaLine({ d }: { d: SeaDay }) {
  const v = seaVerdict(d);
  return (
    <div className={`sea-line is-${v.level}`}>
      <span className={`sea-pill is-${v.level}`}>{v.label}</span>
      <span>Vagues <b>{d.wave.toFixed(1)} m</b> · {Math.round(d.period)} s <Dir deg={d.waveDir} />{compass(d.waveDir)}</span>
      {d.wind !== null && <span>Vent <b>{Math.round(d.wind)} km/h</b>{d.gust !== null && <> (rafales {Math.round(d.gust)})</>} {compass(d.windDir)}</span>}
    </div>
  );
}

export default function SeaPanel({ days, spot, onSpot, selected, onSelect, updated, error, stale }: {
  days: SeaDay[] | null; spot: Spot; onSpot: (s: Spot) => void; selected: string | null; onSelect: (d: string) => void;
  updated: number | null; error: boolean; stale: boolean;
}) {
  return (
    <div className="adm-card sea">
      <div className="sea__head">
        <h3 className="sea__title">Conditions en mer</h3>
        <div className="sea__spots">
          {(Object.keys(SPOT_LABEL) as Spot[]).map((s) => (
            <button key={s} className={spot === s ? 'is-on' : ''} onClick={() => onSpot(s)}>{SPOT_LABEL[s]}</button>
          ))}
        </div>
      </div>
      {error && <p className="adm-muted">Prévisions indisponibles pour le moment.</p>}
      {!days && !error && <p className="adm-muted">Chargement…</p>}
      {days && (
        <ul className="sea__strip">
          {days.map((d) => {
            const v = seaVerdict(d);
            const tip = `${frDate(d.date, { weekday: 'long', day: 'numeric', month: 'long' })} - ${v.label}\n`
              + `Vagues ${d.wave.toFixed(1)} m · période ${Math.round(d.period)} s · ${compass(d.waveDir)}\n`
              + `Vent ${d.wind !== null ? Math.round(d.wind) : '-'} km/h · rafales ${d.gust !== null ? Math.round(d.gust) : '-'} km/h · ${compass(d.windDir)}`
              + `${sky(d.code) ? `\n${sky(d.code)}${d.rain ? ` · ${d.rain} mm` : ''}` : ''}`;
            return (
              <li key={d.date}>
                <button className={`sea__tile is-${v.level}${selected === d.date ? ' is-sel' : ''}`} onClick={() => onSelect(d.date)} title={tip} aria-label={tip}>
                  <span className="sea__d">{frDate(d.date, { weekday: 'short' }).replace('.', '')}</span>
                  <b>{d.wave.toFixed(1)}<i>m</i></b>
                  <span className="sea__g">{d.gust !== null ? Math.round(d.gust) : '-'}<i>km/h</i></span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="sea__legend">
        <span className="is-good">Bonne mer</span><span className="is-fair">Agitée</span><span className="is-bad">Déconseillé</span>
        <em>Vagues max · rafales{updated ? ` · ${new Date(updated).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ''}{stale ? ' (ancienne)' : ''}</em>
      </p>
    </div>
  );
}
