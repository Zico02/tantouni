import { useEffect, useRef, type CSSProperties } from 'react';
import SwimmingFish from './SwimmingFish';
import { fishVisual } from '../lib/fishArt';
import './HeroLens.css';

// Sport-shield sunglasses, like the "Season of giants" visual: one wraparound
// lens with a nose cut-out. The lens shows a mirrored ocean with the two
// giants - tuna and marlin - swimming in the reflection.
const VB = '-70 0 1140 380';
const LENS =
  'M40 92C40 52 78 34 160 32Q500 14 840 32C922 34 960 52 960 92C962 172 934 262 868 302C798 342 642 346 586 302C560 280 546 212 500 206C454 212 440 280 414 302C358 346 202 342 132 302C66 262 38 172 40 92Z';
const BROW = 'M30 96C28 46 76 22 160 20Q500 2 840 20C924 22 972 46 970 96';

const lensMask = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${VB}' preserveAspectRatio='none'><path d='${LENS}' fill='#000'/></svg>`,
)}")`;

const tuna = { src: '/uploads/tuna.png', aspect: 1752 / 555 };
const marlin = fishVisual({ slug: 'hero-marlin', image: '', art: { shape: 'marlin', back: '#0c2a6e', belly: '#e8eef5', fin: '#2a5dc9', accent: '#4fa3ff' } });

export default function HeroLens() {
  const ref = useRef<HTMLDivElement>(null);

  // The reflection slides opposite to the pointer, like a real mirrored lens.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0, tx = 0, ty = 0, x = 0, y = 0;
    const move = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * -2;
      ty = (e.clientY / window.innerHeight - 0.5) * -2;
    };
    const loop = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      el.style.setProperty('--px', x.toFixed(3));
      el.style.setProperty('--py', y.toFixed(3));
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move);
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className="lens" ref={ref}>
      <div className="lens__glass" style={{ WebkitMaskImage: lensMask, maskImage: lensMask } as CSSProperties}>
        <div className="lens__world">
          <div className="lens__sky" />
          <div className="lens__sun" />
          <div className="lens__sea" />
          <div className="lens__catch lens__catch--tuna">
            <SwimmingFish src={tuna.src} aspect={tuna.aspect} amp={0.05} period={3.6} />
          </div>
          <div className="lens__catch lens__catch--marlin">
            <SwimmingFish src={marlin.src} aspect={marlin.aspect} amp={0.05} period={4.2} />
          </div>
        </div>
        <div className="lens__tint" />
        <div className="lens__glare" />
      </div>
      <svg className="lens__frame" viewBox={VB} preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="frame" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a3342" />
            <stop offset="1" stopColor="#07090d" />
          </linearGradient>
        </defs>
        <path d="M34 84L-66 70M966 84L1066 70" stroke="#0b0e14" strokeWidth="22" strokeLinecap="round" />
        <path d={LENS} fill="none" stroke="url(#frame)" strokeWidth="14" />
        <path d={BROW} fill="none" stroke="url(#frame)" strokeWidth="30" strokeLinecap="round" />
        <path d="M462 214C478 196 522 196 538 214" fill="none" stroke="#0b0e14" strokeWidth="16" strokeLinecap="round" />
        <path d={BROW} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="3" transform="translate(0 -9)" />
        <circle cx="64" cy="92" r="7" fill="#ff3b30" />
        <circle cx="936" cy="92" r="7" fill="#ff3b30" />
      </svg>
    </div>
  );
}
