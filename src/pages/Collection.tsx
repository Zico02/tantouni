import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import DeepSea from '../components/DeepSea';
import FishCard from '../components/FishCard';
import FishModal from '../components/FishModal';
import { useReveal } from '../lib/motion';
import { fishName, useFish } from '../lib/useFish';
import { currentLang } from '../i18n';
import type { Rarity } from '../lib/types';
import './Collection.css';

type Filter = 'all' | 'caught' | 'todo';
type Zone = 'all' | 'maroc' | 'monde';

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function Collection() {
  const { t, i18n } = useTranslation();
  const lang = currentLang();
  const { fish, error } = useFish();
  const { slug } = useParams();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [zone, setZone] = useState<Zone>('all');
  const [q, setQ] = useState('');
  useReveal(ref, [i18n.resolvedLanguage]);

  const all = fish ?? [];
  const caught = all.filter((f) => f.caught).length;
  const pct = all.length ? caught / all.length : 0;

  const list = useMemo(() => {
    const nq = norm(q.trim());
    return all.filter((f) =>
      (filter === 'all' || (filter === 'caught' ? f.caught : !f.caught)) &&
      (zone === 'all' || f.zone === zone) &&
      (!nq || [...Object.values(f.names), f.scientific, f.nickname || ''].some((n) => norm(n).includes(nq))));
  }, [all, filter, zone, q]);

  // The modal browses the list currently on screen (or everything when deep-linked).
  const browse = slug && !list.some((f) => f.slug === slug) ? all : list;
  const openIndex = slug ? browse.findIndex((f) => f.slug === slug) : -1;

  const byRarity = (r: Rarity) => {
    const of = all.filter((f) => f.rarity === r);
    return `${of.filter((f) => f.caught).length}/${of.length}`;
  };

  return (
    <div className="collection" ref={ref}>
      <DeepSea />

      <section className="col-hero container">
        <span className="kicker">{t('collection.kicker')}</span>
        <h1 className="col-hero__title display">{t('collection.title')}</h1>
        <p className="lead">{t('collection.sub')}</p>

        <div className="score glass">
          <div className="score__main">
            <b className="display">{String(caught).padStart(2, '0')}</b>
            <span className="display">/{String(all.length).padStart(2, '0')}</span>
            <small>{t('collection.species')} {t('collection.caught')}</small>
          </div>
          <div className="score__bar">
            <motion.div className="score__fill" initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}>
              <span className="score__hook" />
            </motion.div>
          </div>
          <ul className="score__rarity">
            {(['legend', 'prized', 'common'] as const).map((r) => (
              <li key={r}><span className={`rarity rarity--${r}`}>{t(`collection.rarity.${r}`)}</span><b>{byRarity(r)}</b></li>
            ))}
          </ul>
        </div>
      </section>

      <div className="col-bar">
        <div className="container col-bar__inner">
          <div className="seg" role="tablist">
            {(['all', 'caught', 'todo'] as const).map((k) => (
              <button key={k} role="tab" aria-selected={filter === k} className={filter === k ? 'is-on' : ''} onClick={() => setFilter(k)}>
                {filter === k && <motion.span layoutId="seg" className="seg__pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <span>{t(`collection.filters.${k}`)}</span>
              </button>
            ))}
          </div>
          <div className="seg seg--small">
            {(['all', 'maroc', 'monde'] as const).map((k) => (
              <button key={k} aria-pressed={zone === k} className={zone === k ? 'is-on' : ''} onClick={() => setZone(k)}>
                {zone === k && <motion.span layoutId="zone" className="seg__pill" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                <span>{t(`collection.zone.${k}`)}</span>
              </button>
            ))}
          </div>
          <label className="col-search">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('collection.search')} />
          </label>
        </div>
      </div>

      <section className="container col-grid-wrap">
        {error && <p className="col-empty">{t('book.errors.generic')}</p>}
        {!fish && !error && (
          <div className="col-grid">{Array.from({ length: 6 }, (_, i) => <div key={i} className="fcard fcard--skeleton" />)}</div>
        )}
        {fish && (
          <LayoutGroup>
            <motion.div className="col-grid" layout>
              {/* initial={false}: cards are simply there on entry; they only animate when filtering */}
              <AnimatePresence mode="popLayout" initial={false}>
                {list.map((f) => (
                  <FishCard key={f.id} fish={f} index={all.indexOf(f)} onOpen={() => navigate(`/tableau-de-chasse/${f.slug}`)} />
                ))}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        )}
        {fish && list.length === 0 && <p className="col-empty">{t('collection.empty')}</p>}
      </section>

      <AnimatePresence>
        {openIndex >= 0 && (
          <FishModal
            key="modal"
            list={browse}
            index={openIndex}
            onClose={() => navigate('/tableau-de-chasse', { preventScrollReset: true })}
            onNav={(i) => navigate(`/tableau-de-chasse/${browse[i].slug}`, { replace: true, preventScrollReset: true })}
          />
        )}
      </AnimatePresence>
      <title>{openIndex >= 0 ? `${fishName(browse[openIndex], lang)} · TANTOUNI` : `${t('collection.kicker')} · TANTOUNI`}</title>
    </div>
  );
}
