import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { api } from '../lib/api';
import { scrollLock, useReveal } from '../lib/motion';
import { youtubeId } from '../lib/site';
import { currentLang } from '../i18n';
import type { Achievement, Lang } from '../lib/types';
import './Achievements.css';

const pick = (o: Partial<Record<Lang, string>>, lang: Lang) => o?.[lang] || o?.fr || o?.en || '';

export function rankLabel(n: number, lang: Lang) {
  switch (lang) {
    case 'fr': return n === 1 ? '1er' : `${n}ᵉ`;
    case 'en': return `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;
    case 'es': return `${n}.º`;
    case 'it': return `${n}°`;
    case 'ar': return `${n}`;
  }
}

function Medal({ place }: { place: number | null }) {
  const tier = place === 1 ? 'gold' : place === 2 ? 'silver' : place === 3 ? 'bronze' : 'blue';
  const lang = currentLang();
  return (
    <div className={`medal medal--${tier}`}>
      <svg viewBox="0 0 120 150" aria-hidden>
        <path d="M30 0h22l14 46H44zM90 0H68L54 46h22z" className="medal__ribbon" />
        <circle cx="60" cy="92" r="52" className="medal__disc" />
        <circle cx="60" cy="92" r="42" className="medal__ring" />
      </svg>
      <b className="display">{place ? rankLabel(place, lang) : '★'}</b>
    </div>
  );
}

function Lightbox({ photos, index, title, onClose, onNav }: { photos: string[]; index: number; title: string; onClose: () => void; onNav: (i: number) => void }) {
  const { t } = useTranslation();
  useEffect(() => {
    scrollLock.lock();
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNav((index + 1) % photos.length);
      if (e.key === 'ArrowLeft') onNav((index - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', k);
    return () => { scrollLock.unlock(); window.removeEventListener('keydown', k); };
  }, [index, photos.length, onClose, onNav]);
  return (
    <motion.div className="lb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <AnimatePresence mode="wait">
        <motion.img
          key={photos[index]}
          src={photos[index]}
          alt={title}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>
      <div className="lb__bar" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => onNav((index - 1 + photos.length) % photos.length)} aria-label="‹">‹</button>
        <span>{index + 1} / {photos.length}</span>
        <button onClick={() => onNav((index + 1) % photos.length)} aria-label="›">›</button>
        <button onClick={onClose} className="lb__close">{t('palmares.close')} ✕</button>
      </div>
    </motion.div>
  );
}

function Entry({ a, i }: { a: Achievement; i: number }) {
  const { t } = useTranslation();
  const lang = currentLang();
  const locale = lang === 'ar' ? 'ar-MA' : lang;
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const title = pick(a.title, lang);
  const date = a.date ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(a.date + 'T12:00:00')) : '';
  const yt = a.video ? youtubeId(a.video) : '';

  return (
    <article className={`ach ${i % 2 ? 'ach--rev' : ''}`} ref={ref}>
      <div className="ach__info" data-reveal>
        <div className="ach__top">
          <Medal place={a.place} />
          <div>
            {pick(a.award, lang) && <p className="ach__award display">{pick(a.award, lang)}</p>}
            <p className="ach__meta">{[a.location, date].filter(Boolean).join(' · ')}</p>
          </div>
        </div>
        <h2 className="ach__title display">{title}</h2>
        {a.organizer && <span className="chip">{a.organizer}</span>}
        {pick(a.description, lang) && <p className="ach__desc">{pick(a.description, lang)}</p>}
        <div className="ach__foot">
          {a.photos.length > 0 && <span className="ach__count">📸 {a.photos.length} {t('palmares.photos')}</span>}
          {yt && <a className="btn ghost sm" href={`https://www.youtube.com/watch?v=${yt}`} target="_blank" rel="noreferrer">▶ {t('palmares.video')}</a>}
        </div>
      </div>

      {a.photos.length > 0 && (
        <motion.div className={`ach__mosaic n${Math.min(a.photos.length, 6)}`} style={{ y }}>
          {a.photos.slice(0, 6).map((p, k) => (
            <button key={p} className="ach__ph" onClick={() => setOpen(k)} data-reveal data-reveal-delay={k * 0.08}>
              <img src={p} alt={title} loading="lazy" />
              {k === 5 && a.photos.length > 6 && <span className="ach__more">+{a.photos.length - 6}</span>}
            </button>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {open !== null && <Lightbox photos={a.photos} index={open} title={title} onClose={() => setOpen(null)} onNav={setOpen} />}
      </AnimatePresence>
    </article>
  );
}

export default function Achievements() {
  const { t, i18n } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<Achievement[] | null>(null);
  useReveal(ref, [i18n.resolvedLanguage]);
  useEffect(() => { api.achievements().then(setList).catch(() => setList([])); }, []);
  const podiums = (list ?? []).filter((a) => a.place && a.place <= 3).length;

  return (
    <div className="palm" ref={ref}>
      <div className="palm__bg" aria-hidden><span className="display">PALMARÈS</span></div>
      <section className="container palm__head">
        <span className="kicker" data-reveal>{t('palmares.kicker')}</span>
        <h1 className="display palm__title" data-reveal>{t('palmares.title')}</h1>
        <p className="lead" data-reveal>{t('palmares.sub')}</p>
        {list && list.length > 0 && (
          <div className="palm__stats" data-reveal>
            <div><b className="display">{podiums}</b><span>{t('palmares.podiums')}</span></div>
            <div><b className="display">{list.length}</b><span>{t('palmares.events')}</span></div>
          </div>
        )}
      </section>
      <section className="container palm__list">
        {list?.length === 0 && <p className="palm__empty">{t('palmares.empty')}</p>}
        {list?.map((a, i) => <Entry key={a.id} a={a} i={i} />)}
      </section>
      <title>{`${t('palmares.kicker')} · TANTOUNI`}</title>
    </div>
  );
}
