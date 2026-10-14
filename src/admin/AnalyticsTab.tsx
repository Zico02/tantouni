import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import { SITE } from '../lib/site';
import type { Reservation } from '../lib/types';
import { dh } from './Admin';

// Revenue = money actually received: bookings marked "Payée", counted on the trip date.
const MONTHS = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
const MONTHS_LONG = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const CAP = SITE.boats * SITE.seatsPerBoat;

// Validated (dataviz validator, dark, surface #051a3f, all pairs): first three reference slots.
const C = { paid: '#199e70', confirmed: '#3987e5', pending: '#d95926' } as const;
const STATUS_LABEL = { paid: 'Payées', confirmed: 'Confirmées', pending: 'En attente' } as const;
type Active = keyof typeof C;

const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Casablanca' }).format(new Date());
const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}k` : String(n));

/** Clean axis: a round step (1, 2, 5 × 10^k) and a max that is a whole number of steps. */
function niceAxis(v: number, target = 4) {
  if (v <= 0) return { max: 4000, ticks: [0, 1000, 2000, 3000, 4000] };
  const raw = v / target;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * p).find((x) => x >= raw)!;
  const max = step * Math.ceil(v / step);
  return { max, ticks: Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step) };
}

/** Width of an element in CSS px, so SVG text renders at a constant size. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

interface Bucket { label: string; long: string; revenue: number; bookings: number; people: number; current?: boolean }

function Tooltip({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return <div className="an-tip" style={{ left: `${x}%`, top: `${y}%` }}>{children}</div>;
}

/** Single-series column chart: 24px columns, 4px rounded tops, hairline grid, hover tooltip. */
function Columns({ data, title, sub }: { data: Bucket[]; title: string; sub: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const [box, measured] = useWidth<HTMLDivElement>();
  const W = measured || 600, H = 240, L = 44, R = 8, T = 22, B = 28;
  const { max, ticks } = niceAxis(Math.max(...data.map((d) => d.revenue)));
  const band = (W - L - R) / data.length;
  const bw = Math.min(24, band * 0.6);
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const peak = data.reduce((best, d, i) => (d.revenue > (data[best]?.revenue ?? -1) ? i : best), 0);
  const allZero = data.every((d) => d.revenue === 0);

  return (
    <figure className="an-card an-chart">
      <figcaption>
        <h3>{title}</h3>
        <p>{sub}</p>
      </figcaption>
      <div className="an-plot" ref={box} onMouseLeave={() => setHover(null)}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className={t === 0 ? 'an-base' : 'an-gridline'} />
              <text x={L - 8} y={y(t) + 4} textAnchor="end" className="an-tick">{compact(t)}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = L + band * i + band / 2;
            const h = Math.max(0, y(0) - y(d.revenue));
            const r = Math.min(4, h);
            const x0 = cx - bw / 2, top = y(d.revenue), base = y(0);
            const path = h > 0
              ? `M${x0} ${base}V${top + r}Q${x0} ${top} ${x0 + r} ${top}H${x0 + bw - r}Q${x0 + bw} ${top} ${x0 + bw} ${top + r}V${base}Z`
              : '';
            return (
              <g key={d.label}>
                {hover === i && <rect x={L + band * i + 2} y={T} width={band - 4} height={H - T - B} className="an-hoverband" />}
                {path && <path d={path} fill={C.confirmed} opacity={hover === null || hover === i ? 1 : 0.55} />}
                <text x={cx} y={H - 10} textAnchor="middle" className={`an-tick ${d.current ? 'is-current' : ''}`}>{d.label}</text>
                {i === peak && d.revenue > 0 && (
                  <text x={cx} y={top - 7} textAnchor="middle" className="an-label">{compact(d.revenue)}</text>
                )}
                <rect x={L + band * i} y={T} width={band} height={H - T - B} fill="transparent"
                  onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0} aria-label={`${d.long} : ${dh(d.revenue)}`} />
              </g>
            );
          })}
        </svg>
        {allZero && <p className="an-empty">Aucun revenu encaissé sur cette période pour l'instant.</p>}
        {hover !== null && (
          <Tooltip x={((L + band * hover + band / 2) / W) * 100} y={(y(data[hover].revenue) / H) * 100}>
            <b>{data[hover].long}</b>
            <span><i style={{ background: C.confirmed }} />{dh(data[hover].revenue)}</span>
            <small>{data[hover].bookings} réservation{data[hover].bookings > 1 ? 's' : ''} payée{data[hover].bookings > 1 ? 's' : ''} · {data[hover].people} pêcheur{data[hover].people > 1 ? 's' : ''}</small>
          </Tooltip>
        )}
      </div>
      <details className="an-table">
        <summary>Voir le tableau</summary>
        <table>
          <thead><tr><th>Période</th><th>Revenu</th><th>Réservations payées</th><th>Pêcheurs</th></tr></thead>
          <tbody>{data.map((d) => <tr key={d.label}><td>{d.long}</td><td>{dh(d.revenue)}</td><td>{d.bookings}</td><td>{d.people}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}

/** Donut of active bookings by status, 2px surface gaps between segments, legend with counts. */
function StatusDonut({ counts, cancelled, title }: { counts: Record<Active, number>; cancelled: number; title: string }) {
  const [hover, setHover] = useState<Active | null>(null);
  const keys: Active[] = ['paid', 'confirmed', 'pending'];
  const total = keys.reduce((a, k) => a + counts[k], 0);
  const R = 80, r = 54, cx = 100, cy = 100;
  let acc = 0;
  const arcs = keys.filter((k) => counts[k] > 0).map((k) => {
    const start = acc / total, end = (acc + counts[k]) / total;
    acc += counts[k];
    return { k, start, end };
  });
  const pt = (f: number, rad: number) => [cx + rad * Math.sin(2 * Math.PI * f), cy - rad * Math.cos(2 * Math.PI * f)];
  const seg = (s: number, e: number) => {
    if (e - s >= 0.9999) return `M${cx} ${cy - R}A${R} ${R} 0 1 1 ${cx - 0.01} ${cy - R}L${cx - 0.01} ${cy - r}A${r} ${r} 0 1 0 ${cx} ${cy - r}Z`;
    const big = e - s > 0.5 ? 1 : 0;
    const [x1, y1] = pt(s, R), [x2, y2] = pt(e, R), [x3, y3] = pt(e, r), [x4, y4] = pt(s, r);
    return `M${x1} ${y1}A${R} ${R} 0 ${big} 1 ${x2} ${y2}L${x3} ${y3}A${r} ${r} 0 ${big} 0 ${x4} ${y4}Z`;
  };
  const shown = hover ? counts[hover] : total;

  return (
    <figure className="an-card an-donut">
      <figcaption><h3>{title}</h3><p>Réservations actives par statut</p></figcaption>
      <div className="an-donut__body">
        <svg viewBox="0 0 200 200" role="img" aria-label={title}>
          {total === 0 && <circle cx={cx} cy={cy} r={(R + r) / 2} fill="none" stroke="rgba(233,246,255,.08)" strokeWidth={R - r} />}
          {arcs.map((a) => (
            <path key={a.k} d={seg(a.start, a.end)} fill={C[a.k]} className="an-arc"
              opacity={hover === null || hover === a.k ? 1 : 0.4}
              onMouseEnter={() => setHover(a.k)} onMouseLeave={() => setHover(null)} />
          ))}
          <text x={cx} y={cy + 4} textAnchor="middle" className="an-donut__num">{shown}</text>
          <text x={cx} y={cy + 24} textAnchor="middle" className="an-donut__lbl">{hover ? STATUS_LABEL[hover].toLowerCase() : 'réservations'}</text>
        </svg>
        <ul className="an-legend">
          {keys.map((k) => (
            <li key={k} onMouseEnter={() => setHover(k)} onMouseLeave={() => setHover(null)} className={hover === k ? 'is-on' : ''}>
              <i style={{ background: C[k] }} />
              <span>{STATUS_LABEL[k]}</span>
              <b>{counts[k]}</b>
              <small>{total ? Math.round((counts[k] / total) * 100) : 0} %</small>
            </li>
          ))}
          <li className="an-legend__muted"><span>Annulées</span><b>{cancelled}</b></li>
        </ul>
      </div>
    </figure>
  );
}

/** Best months of the selected year, ranked: a compact bar list (magnitude, one hue). */
function TopMonths({ data, year }: { data: Bucket[]; year: number }) {
  const top = [...data].filter((d) => d.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const max = top[0]?.revenue || 1;
  return (
    <figure className="an-card an-chart">
      <figcaption><h3>Meilleurs mois · {year}</h3><p>Classés par revenu encaissé</p></figcaption>
      {top.length === 0 ? <p className="adm-muted">Pas encore de revenu encaissé cette année.</p> : (
        <ol className="an-rank">
          {top.map((d) => (
            <li key={d.label}>
              <span className="an-rank__m">{d.long.split(' ')[0]}</span>
              <span className="an-rank__track"><span style={{ width: `${(d.revenue / max) * 100}%` }} /></span>
              <b>{dh(d.revenue)}</b>
            </li>
          ))}
        </ol>
      )}
    </figure>
  );
}

function Delta({ now, before, label }: { now: number; before: number; label: string }) {
  if (!before && !now) return <small className="an-delta">- {label}</small>;
  if (!before) return <small className="an-delta is-up">▲ nouveau {label}</small>;
  const pct = Math.round(((now - before) / before) * 100);
  return <small className={`an-delta ${pct > 0 ? 'is-up' : pct < 0 ? 'is-down' : ''}`}>{pct > 0 ? '▲' : pct < 0 ? '▼' : '='} {Math.abs(pct)} % {label}</small>;
}

export default function AnalyticsTab({ onAuthError }: { onAuthError: (e: unknown) => void }) {
  const [list, setList] = useState<Reservation[] | null>(null);
  const today = todayIso();
  const thisYear = Number(today.slice(0, 4));
  const thisMonth = Number(today.slice(5, 7)) - 1;
  const [year, setYear] = useState(thisYear);

  useEffect(() => { api.reservations().then(setList).catch(onAuthError); }, [onAuthError]);

  const paid = useMemo(() => (list ?? []).filter((r) => r.status === 'paid'), [list]);
  const years = useMemo(() => {
    const ys = new Set([thisYear, ...(list ?? []).map((r) => Number(r.date.slice(0, 4)))]);
    return [...ys].sort((a, b) => a - b);
  }, [list, thisYear]);

  const sumOf = (rs: Reservation[]) => ({ revenue: rs.reduce((a, r) => a + r.total, 0), bookings: rs.length, people: rs.reduce((a, r) => a + r.people, 0) });
  const inMonth = (y: number, m: number) => paid.filter((r) => r.date.startsWith(`${y}-${String(m + 1).padStart(2, '0')}`));

  const prevM = thisMonth === 0 ? { y: thisYear - 1, m: 11 } : { y: thisYear, m: thisMonth - 1 };
  const prev2M = prevM.m === 0 ? { y: prevM.y - 1, m: 11 } : { y: prevM.y, m: prevM.m - 1 };
  const cur = sumOf(inMonth(thisYear, thisMonth));
  const last = sumOf(inMonth(prevM.y, prevM.m));
  const beforeLast = sumOf(inMonth(prev2M.y, prev2M.m));
  const ytd = sumOf(paid.filter((r) => r.date.startsWith(String(thisYear))));
  const lastYear = sumOf(paid.filter((r) => r.date.startsWith(String(thisYear - 1))));
  const avg = ytd.bookings ? Math.round(ytd.revenue / ytd.bookings) : 0;

  // Fill rate: seats taken on trip days already past this year (paid + confirmed), out of 10 per trip day.
  const tripsPast = (list ?? []).filter((r) => r.date.startsWith(String(thisYear)) && r.date < today && (r.status === 'paid' || r.status === 'confirmed'));
  const tripDays = new Set(tripsPast.map((r) => r.date)).size;
  const fill = tripDays ? Math.round((tripsPast.reduce((a, r) => a + r.people, 0) / (tripDays * CAP)) * 100) : 0;

  const monthly: Bucket[] = MONTHS.map((label, m) => ({
    label, long: `${MONTHS_LONG[m]} ${year}`, ...sumOf(inMonth(year, m)), current: year === thisYear && m === thisMonth,
  }));
  const yearly: Bucket[] = years.map((y) => ({ label: String(y), long: String(y), ...sumOf(paid.filter((r) => r.date.startsWith(String(y)))), current: y === thisYear }));

  const ofYear = (list ?? []).filter((r) => r.date.startsWith(String(year)));
  const counts = { paid: ofYear.filter((r) => r.status === 'paid').length, confirmed: ofYear.filter((r) => r.status === 'confirmed').length, pending: ofYear.filter((r) => r.status === 'pending').length };
  const cancelled = ofYear.filter((r) => r.status === 'cancelled').length;

  return (
    <div className="adm-page an">
      <header className="adm-page__head">
        <div>
          <h1 className="display">Statistiques</h1>
          <p>Revenus encaissés : seules les réservations « Payée » comptent, sur la date de la sortie.</p>
        </div>
        <div className="adm-seg">
          {years.map((y) => <button key={y} className={year === y ? 'is-on' : ''} onClick={() => setYear(y)}>{y}</button>)}
        </div>
      </header>

      {!list ? <p className="adm-muted">Chargement…</p> : (
        <>
          <div className="an-tiles">
            <div className="an-card an-tile an-tile--hero">
              <small>Ce mois-ci ({MONTHS_LONG[thisMonth]})</small>
              <b>{dh(cur.revenue)}</b>
              <Delta now={cur.revenue} before={last.revenue} label="vs mois dernier" />
            </div>
            <div className="an-card an-tile">
              <small>Mois dernier ({MONTHS_LONG[prevM.m]})</small>
              <b>{dh(last.revenue)}</b>
              <Delta now={last.revenue} before={beforeLast.revenue} label={`vs ${MONTHS_LONG[prev2M.m]}`} />
            </div>
            <div className="an-card an-tile">
              <small>Année {thisYear}</small>
              <b>{dh(ytd.revenue)}</b>
              <Delta now={ytd.revenue} before={lastYear.revenue} label={`vs ${thisYear - 1}`} />
            </div>
            <div className="an-card an-tile">
              <small>Panier moyen</small>
              <b>{dh(avg)}</b>
              <small className="an-delta">{ytd.people} pêcheurs payés en {thisYear}</small>
            </div>
            <div className="an-card an-tile">
              <small>Remplissage des sorties</small>
              <b>{fill} %</b>
              <div className="an-meter" role="meter" aria-valuenow={fill} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${Math.min(100, fill)}%` }} /></div>
              <small className="an-delta">{tripDays} sortie{tripDays > 1 ? 's' : ''} effectuée{tripDays > 1 ? 's' : ''} en {thisYear}</small>
            </div>
          </div>

          <div className="an-grid">
            <Columns data={monthly} title={`Revenus par mois · ${year}`} sub={`Total ${dh(monthly.reduce((a, d) => a + d.revenue, 0))}`} />
            <StatusDonut counts={counts} cancelled={cancelled} title={`Statut des réservations · ${year}`} />
          </div>
          <div className="an-grid an-grid--half">
            <Columns data={yearly} title="Revenus par année" sub="Tous les revenus encaissés, année par année" />
            <TopMonths data={monthly} year={year} />
          </div>
        </>
      )}
    </div>
  );
}
