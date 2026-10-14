import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import Calendar, { monthRange } from '../components/Calendar';
import BoatSeats from '../components/BoatSeats';
import CatchScene from '../components/CatchScene';
import { api, ApiError } from '../lib/api';
import { allocate } from '../lib/allocate';
import { useReveal } from '../lib/motion';
import { SITE } from '../lib/site';
import { currentLang } from '../i18n';
import type { DayAvailability } from '../lib/types';
import { Arrow, Bolt, Check } from '../components/icons';
import './Reservation.css';

const CAP = SITE.boats * SITE.seatsPerBoat;

export default function Reservation() {
  const { t, i18n } = useTranslation();
  const lang = currentLang();
  const locale = lang === 'ar' ? 'ar-MA' : lang;
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref, [i18n.resolvedLanguage]);

  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [days, setDays] = useState<Record<string, DayAvailability> | null>(null);
  const [today, setToday] = useState('');
  const [date, setDate] = useState<string | null>(null);
  const [people, setPeople] = useState(2);
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ ref: string; date: string; people: number; total: number } | null>(null);

  const load = useCallback(async () => {
    const { from, to } = monthRange(month);
    try {
      const r = await api.availability(from, to);
      setDays(r.days);
      setToday(r.today);
    } catch {
      setError(t('book.errors.generic'));
    }
  }, [month, t]);
  useEffect(() => { setDays(null); load(); }, [load]);

  const day = date && days ? days[date] : undefined;
  const left = day ? day.left : CAP;
  const maxPeople = Math.max(1, left);
  useEffect(() => { if (people > maxPeople) setPeople(maxPeople); }, [maxPeople, people]);
  const mine = useMemo(() => (day ? allocate(day.boatsLeft, Math.min(people, day.left)) ?? [] : []), [day, people]);

  const fmtDate = (d: string) =>
    new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(d + 'T12:00:00'));
  const money = (n: number) => `${n.toLocaleString(locale)} ${SITE.currency}`;

  const renderDay = (d: string) => {
    const a = days?.[d];
    const past = !today || d <= today;
    if (past) return { className: 'is-past', disabled: true };
    if (!a) return { disabled: true };
    if (a.blocked && a.weather) return { className: 'is-weather', disabled: true, content: <span className="cal__tag cal__tag--weather"><Bolt />{t('book.legend.weather')}</span>, title: t('book.legend.weather') };
    if (a.blocked) return { className: 'is-blocked', disabled: true, content: <span className="cal__tag">{t('book.legend.blocked')}</span>, title: t('book.legend.blocked') };
    if (a.left === 0) return { className: 'is-full', disabled: true, content: <span className="cal__tag">{t('book.legend.full')}</span> };
    return {
      className: a.left <= 3 ? 'is-few' : '',
      title: t('book.seatsLeft', { count: a.left }),
      content: <span className="cal__dots">{Array.from({ length: CAP }, (_, i) => <i key={i} className={i < a.left ? '' : 'off'} />)}</span>,
    };
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!date) return;
    setSending(true);
    setError('');
    try {
      const r = await api.reserve({ ...form, date, people, lang });
      setDone(r);
      setDate(null);
      setForm({ name: '', phone: '', email: '', message: '' });
      load();
      window.scrollTo({ top: 0 });
    } catch (err) {
      const code = err instanceof ApiError ? err.message : 'generic';
      setError(t(`book.errors.${code}`, { defaultValue: t('book.errors.generic') }));
      if (code === 'not_enough_seats' || code === 'day_blocked') load();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="book" ref={ref}>
      <div className="book__bg" aria-hidden />
      <section className="container book__head">
        <span className="kicker" data-reveal>{t('book.kicker')}</span>
        <h1 className="display book__title" data-reveal>{t('book.title')}</h1>
        <p className="lead" data-reveal>{t('book.sub')}</p>
      </section>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.section key="done" className="container" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="book__done glass">
              <CatchScene />
              <h2 className="display book__done-title"><span>TANTOUNI !</span>{t('book.success.title')}</h2>
              <p className="lead">{t('book.success.text')}</p>
              <div className="book__ref">
                <small>{t('book.success.ref')}</small>
                <b className="display">{done.ref}</b>
              </div>
              <p className="book__done-meta">{fmtDate(done.date)} · {done.people} × {money(SITE.pricePerPerson)} = <b>{money(done.total)}</b></p>
              <div className="book__done-cta">
                <button className="btn" onClick={() => setDone(null)}>{t('book.success.again')}</button>
                <Link className="btn ghost" to="/tableau-de-chasse">{t('nav.collection')}</Link>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section key="form" className="container book__grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="book__main">
              <div className="book__card glass" data-reveal>
                <h2 className="book__step"><span>1</span>{t('book.step1')}</h2>
                {!days && <p className="book__loading">{t('book.loading')}</p>}
                <Calendar
                  month={month}
                  onMonth={setMonth}
                  locale={locale}
                  minMonth={new Date()}
                  renderDay={renderDay}
                  selected={date}
                  onSelect={(d) => { setDate(d); setError(''); }}
                />
                <ul className="book__legend">
                  <li><i className="lg lg--ok" />{t('book.legend.available')}</li>
                  <li><i className="lg lg--few" />{t('book.legend.few')}</li>
                  <li><i className="lg lg--full" />{t('book.legend.full')}</li>
                  <li><i className="lg lg--blocked" />{t('book.legend.blocked')}</li>
                  <li><Bolt />{t('book.legend.weather')}</li>
                </ul>
              </div>

              <div className="book__card glass" data-reveal>
                <h2 className="book__step"><span>2</span>{t('book.step2')}</h2>
                <div className="book__people">
                  <button type="button" className="stepper" onClick={() => setPeople((p) => Math.max(1, p - 1))} disabled={people <= 1} aria-label="-">−</button>
                  <motion.b key={people} className="display" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>{people}</motion.b>
                  <button type="button" className="stepper" onClick={() => setPeople((p) => Math.min(maxPeople, p + 1))} disabled={people >= maxPeople} aria-label="+">+</button>
                  <span className="book__people-price">× {money(SITE.pricePerPerson)} <small>{t('book.perPerson')}</small></span>
                </div>
                <h3 className="book__sub">{t('book.boatsPreview')}</h3>
                <BoatSeats boatsLeft={day ? day.boatsLeft : Array(SITE.boats).fill(SITE.seatsPerBoat)} seatsPerBoat={SITE.seatsPerBoat} mine={day ? mine : [Math.min(people, SITE.seatsPerBoat), Math.max(0, people - SITE.seatsPerBoat)]} />
              </div>
            </div>

            <aside className="book__side">
              <form className="book__card glass book__form" onSubmit={submit}>
                <h2 className="book__step"><span>3</span>{t('book.step3')}</h2>
                <div className="field"><label htmlFor="b-name">{t('book.form.name')}</label><input id="b-name" required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="field"><label htmlFor="b-phone">{t('book.form.phone')}</label><input id="b-phone" required type="tel" autoComplete="tel" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+212 6…" /></div>
                <div className="field"><label htmlFor="b-email">{t('book.form.email')} <small>({t('book.form.optional')})</small></label><input id="b-email" type="email" autoComplete="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div className="field"><label htmlFor="b-msg">{t('book.form.message')} <small>({t('book.form.optional')})</small></label><textarea id="b-msg" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>

                <div className="book__summary">
                  <h3>{t('book.summary.title')}</h3>
                  <dl>
                    <div><dt>{t('book.summary.date')}</dt><dd>{date ? fmtDate(date) : <em>{t('book.pickDate')}</em>}</dd></div>
                    <div><dt>{t('book.summary.people')}</dt><dd>{people} × {money(SITE.pricePerPerson)}</dd></div>
                    {date && day && <div><dt>{t('book.boatsPreview')}</dt><dd>{mine.map((n, i) => (n ? t('book.boat', { n: i + 1 }) + ` (${n})` : '')).filter(Boolean).join(' + ')}</dd></div>}
                  </dl>
                  <div className="book__total">
                    <span>{t('book.summary.total')}</span>
                    <motion.b key={people} className="display" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{money(people * SITE.pricePerPerson)}</motion.b>
                  </div>
                  <p className="book__note">{t('book.summary.note')}</p>
                </div>

                <AnimatePresence>
                  {error && <motion.p className="book__error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>{error}</motion.p>}
                </AnimatePresence>

                <button className="btn book__submit" disabled={!date || sending}>
                  {sending ? t('book.form.sending') : <><Check /> {t('book.form.submit')} <Arrow /></>}
                </button>
              </form>
            </aside>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
