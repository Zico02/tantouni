import { useRef, type CSSProperties } from 'react';
import { motion, useInView } from 'motion/react';
import { useTranslation } from 'react-i18next';
import SwimmingFish from './SwimmingFish';
import CaughtStamp from './CaughtStamp';
import { fishVisual } from '../lib/fishArt';
import { fishName } from '../lib/useFish';
import { currentLang } from '../i18n';
import type { Fish } from '../lib/types';

export function ghostWord(f: Fish) {
  return (f.nickname || f.names.en || f.names.fr).toUpperCase();
}

export default function FishCard({ fish, index, onOpen }: { fish: Fish; index: number; onOpen: () => void }) {
  const { t } = useTranslation();
  const lang = currentLang();
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  const v = fishVisual(fish);
  const fishRef = useRef<HTMLDivElement>(null);
  // Hover speeds the swim up a little: change playbackRate so the wave keeps its phase (no jump).
  const setSpeed = (rate: number) => fishRef.current?.getAnimations({ subtree: true }).forEach((a) => { a.playbackRate = rate; });
  const word = ghostWord(fish);

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fcard ${fish.caught ? 'is-caught' : 'is-todo'} fcard--${fish.rarity}`}
      onClick={onOpen}
      onMouseEnter={() => setSpeed(1.45)}
      onMouseLeave={() => setSpeed(1)}
      onFocus={() => setSpeed(1.45)}
      onBlur={() => setSpeed(1)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen())}
      tabIndex={0}
      role="button"
      aria-label={`${fishName(fish, lang)} - ${fish.caught ? t('collection.badgeCaught') : t('collection.badgeTodo')}`}
    >
      <header className="fcard__head">
        <span className="fcard__num display">#{String(index + 1).padStart(2, '0')}</span>
        <span className={`rarity rarity--${fish.rarity}`}>{t(`collection.rarity.${fish.rarity}`)}</span>
      </header>
      <div className="fcard__stage">
        <span className="fcard__ghost display" style={{ '--len': word.length } as CSSProperties} aria-hidden>{word}</span>
        <div className="fcard__fish" ref={fishRef}>
          {/* caught fish swim a little slower than the ones still to catch */}
          <SwimmingFish src={v.src} aspect={v.aspect} period={(2.8 + (index % 5) * 0.35) * (fish.caught ? 1.3 : 1)} />
        </div>
        {fish.caught && seen && <CaughtStamp />}
      </div>
      <footer className="fcard__foot">
        <div>
          <h3 className="display">{fishName(fish, lang)}</h3>
          <p className="fcard__sci">{fish.scientific}</p>
        </div>
        <span className={`fcard__status ${fish.caught ? 'is-caught' : ''}`}>
          {fish.caught ? (
            <><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12.5l4.5 4.5L19 7" /></svg>{t('collection.badgeCaught')}</>
          ) : t('collection.badgeTodo')}
        </span>
      </footer>
    </motion.article>
  );
}
