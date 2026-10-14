import { lazy, Suspense, useEffect, useState, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import CaughtStamp from './CaughtStamp';
import { ghostWord } from './FishCard';
import { fishVisual } from '../lib/fishArt';
import { fishDescription, fishName } from '../lib/useFish';
import { scrollLock } from '../lib/motion';
import { SITE, youtubeId } from '../lib/site';
import { currentLang } from '../i18n';
import { LANGS } from '../i18n/locales';
import type { Fish } from '../lib/types';

const WaveFish = lazy(() => import('./WaveFish'));

function Video({ url }: { url: string }) {
  const { t } = useTranslation();
  const id = youtubeId(url);
  const [play, setPlay] = useState(false);
  useEffect(() => setPlay(false), [id]);
  if (!id) {
    return (
      <div className="fm__novideo">
        <p>{t('fish.noVideo')}</p>
        <a className="btn ghost sm" href={SITE.socials.youtube} target="_blank" rel="noreferrer">{t('fish.channel')}</a>
      </div>
    );
  }
  return (
    <div className="fm__video">
      {play ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title="YouTube"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button onClick={() => setPlay(true)} aria-label={t('fish.video')}>
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" />
          <span className="video__play"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M8 5v14l11-7z" fill="currentColor" /></svg></span>
        </button>
      )}
      <a className="fm__ytlink" href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer">youtube.com/watch?v={id} ↗</a>
    </div>
  );
}

interface Props {
  list: Fish[];
  index: number;
  onClose: () => void;
  onNav: (i: number) => void;
}

export default function FishModal({ list, index, onClose, onNav }: Props) {
  const { t, i18n } = useTranslation();
  const lang = currentLang();
  const fish = list[index];
  const v = fishVisual(fish);
  const word = ghostWord(fish);
  const prev = () => onNav((index - 1 + list.length) % list.length);
  const next = () => onNav((index + 1) % list.length);

  useEffect(() => {
    scrollLock.lock();
    return () => scrollLock.unlock();
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') (i18n.dir() === 'rtl' ? prev : next)();
      if (e.key === 'ArrowLeft') (i18n.dir() === 'rtl' ? next : prev)();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });

  const months = Array.from({ length: 12 }, (_, m) =>
    new Intl.DateTimeFormat(lang === 'ar' ? 'ar-MA' : lang, { month: 'short' }).format(new Date(2026, m, 1)));
  const record = (['date', 'weight', 'length', 'location', 'notes'] as const).filter((k) => fish.catch?.[k]);
  const fmt = (n: number | null, unit: string) => (n == null ? t('fish.unknown') : `${n.toLocaleString(lang)} ${unit}`);

  return (
    <motion.div className="fm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="fm__panel"
        role="dialog"
        aria-modal="true"
        aria-label={fishName(fish, lang)}
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        <button className="fm__close" onClick={onClose} aria-label={t('fish.close')}>
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>

        <div className={`fm__stage ${fish.caught ? 'is-caught' : ''}`} key={fish.id}>
          <span className="fm__ghost display" style={{ '--len': word.length } as CSSProperties} aria-hidden>{word}</span>
          <div className="fm__canvas">
            <Suspense fallback={<img src={v.src} alt="" className="fm__fallback" />}>
              <WaveFish src={v.src} />
            </Suspense>
          </div>
          {fish.caught && <div className="fm__x"><CaughtStamp /></div>}
          <div className="fm__navs">
            <button onClick={prev} aria-label={t('fish.prev')}>‹</button>
            <span>{index + 1} / {list.length}</span>
            <button onClick={next} aria-label={t('fish.next')}>›</button>
          </div>
        </div>

        <div className="fm__info" key={`i-${fish.id}`}>
          <div className="fm__chips">
            <span className={`rarity rarity--${fish.rarity}`}>{t(`collection.rarity.${fish.rarity}`)}</span>
            <span className="chip">{t(`collection.zone.${fish.zone}`)}</span>
            <span className={`fcard__status ${fish.caught ? 'is-caught' : ''}`}>{fish.caught ? `✓ ${t('collection.badgeCaught')}` : t('collection.badgeTodo')}</span>
          </div>
          <h2 className="fm__name display">{fishName(fish, lang)}</h2>
          <p className="fm__sci">{fish.scientific}{fish.nickname && <> · <b>« {fish.nickname} »</b></>}</p>
          <ul className="fm__langs">
            {LANGS.filter((l) => l.code !== lang && fish.names[l.code]).map((l) => (
              <li key={l.code}><small>{l.short}</small>{fish.names[l.code]}</li>
            ))}
          </ul>

          {fishDescription(fish, lang) && <p className="fm__desc">{fishDescription(fish, lang)}</p>}

          <div className="fm__stats">
            <div><small>{t('fish.maxLength')}</small><b className="display">{fmt(fish.maxLength, 'cm')}</b></div>
            <div><small>{t('fish.maxWeight')}</small><b className="display">{fmt(fish.maxWeight, 'kg')}</b></div>
            <div><small>{t('fish.depth')}</small><b className="display">{fish.depth || t('fish.unknown')}</b></div>
          </div>

          {fish.habitat.length > 0 && (
            <div className="fm__row"><h4>{t('fish.habitat')}</h4><div>{fish.habitat.map((h) => <span key={h} className="chip">{t(`habitat.${h}`)}</span>)}</div></div>
          )}
          {fish.techniques.length > 0 && (
            <div className="fm__row"><h4>{t('fish.techniques')}</h4><div>{fish.techniques.map((h) => <span key={h} className="chip chip--sun">{t(`tech.${h}`)}</span>)}</div></div>
          )}
          {fish.season.length > 0 && (
            <div className="fm__row">
              <h4>{t('fish.season')}</h4>
              <div className="fm__months">
                {months.map((m, i) => <span key={i} className={fish.season.includes(i + 1) ? 'on' : ''}>{m}</span>)}
              </div>
            </div>
          )}

          <div className={`fm__record ${fish.caught ? 'is-caught' : ''}`}>
            <h4 className="display">{t('fish.record')}</h4>
            {fish.caught ? (
              record.length ? (
                <dl>{record.map((k) => <div key={k}><dt>{t(`fish.${k}`)}</dt><dd>{fish.catch[k]}</dd></div>)}</dl>
              ) : <p className="fm__tantoni display">TANTOUNI !</p>
            ) : <p>{t('fish.noRecord')}</p>}
          </div>

          <div className="fm__row">
            <h4>{t('fish.video')}</h4>
            <Video url={fish.youtube} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
