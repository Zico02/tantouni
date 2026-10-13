import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import './Calendar.css';

export const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function monthRange(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  return { from: iso(first), to: iso(last), first, last };
}

interface Props {
  month: Date;
  onMonth: (d: Date) => void;
  locale: string;
  /** Returns the class(es) and content for one day cell. */
  renderDay: (date: string, day: number) => { className?: string; disabled?: boolean; content?: ReactNode; title?: string };
  selected?: string | null;
  onSelect?: (date: string) => void;
  minMonth?: Date;
}

export default function Calendar({ month, onMonth, locale, renderDay, selected, onSelect, minMonth }: Props) {
  const { first, last } = monthRange(month);
  const lead = (first.getDay() + 6) % 7; // Monday first
  const days = Array.from({ length: last.getDate() }, (_, i) => i + 1);
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2026, 0, 5 + i)));
  const title = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(first);
  const canPrev = !minMonth || first > new Date(minMonth.getFullYear(), minMonth.getMonth(), 1);
  const go = (n: number) => onMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <div className="cal">
      <div className="cal__head">
        <button className="cal__nav" onClick={() => go(-1)} disabled={!canPrev} aria-label="‹">‹</button>
        <motion.h3 key={title} className="cal__title display" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{title}</motion.h3>
        <button className="cal__nav" onClick={() => go(1)} aria-label="›">›</button>
      </div>
      <div className="cal__grid cal__weekdays">{weekdays.map((w) => <span key={w}>{w}</span>)}</div>
      <motion.div className="cal__grid" key={title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {Array.from({ length: lead }, (_, i) => <span key={`e${i}`} />)}
        {days.map((d) => {
          const date = iso(new Date(month.getFullYear(), month.getMonth(), d));
          const r = renderDay(date, d);
          return (
            <button
              key={date}
              className={`cal__day ${r.className || ''} ${selected === date ? 'is-selected' : ''}`}
              disabled={r.disabled}
              onClick={() => onSelect?.(date)}
              title={r.title}
              aria-pressed={selected === date}
            >
              <span className="cal__num">{d}</span>
              {r.content}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
