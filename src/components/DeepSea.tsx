import { useEffect, useRef, useState } from 'react';
import { fishVisual } from '../lib/fishArt';
import type { FishShape } from '../lib/types';
import './DeepSea.css';

// Fixed underwater backdrop: light shafts from the surface, drifting marine
// snow and bubbles, distant silhouettes, and a depth gauge driven by scroll.

function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let w = 0, h = 0, raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    type P = { x: number; y: number; r: number; vy: number; vx: number; a: number; bubble: boolean; ph: number };
    let ps: P[] = [];
    const make = (bubble: boolean, y?: number): P => ({
      x: Math.random() * w,
      y: y ?? Math.random() * h,
      r: bubble ? 1.5 + Math.random() * 4 : 0.5 + Math.random() * 1.6,
      vy: bubble ? -(0.25 + Math.random() * 0.6) : 0.05 + Math.random() * 0.18,
      vx: (Math.random() - 0.5) * 0.15,
      a: bubble ? 0.25 + Math.random() * 0.35 : 0.15 + Math.random() * 0.45,
      bubble,
      ph: Math.random() * Math.PI * 2,
    });
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((w * h) / 9000);
      ps = Array.from({ length: count }, (_, i) => make(i % 7 === 0));
    };
    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y += p.vy;
        p.x += p.vx + (p.bubble ? Math.sin(t / 700 + p.ph) * 0.35 : 0);
        if (p.bubble && p.y < -10) Object.assign(p, make(true, h + 10));
        if (!p.bubble && p.y > h + 5) Object.assign(p, make(false, -5));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        if (p.bubble) {
          ctx.strokeStyle = `rgba(200,235,255,${p.a})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = `rgba(255,255,255,${p.a * 0.5})`;
          ctx.beginPath();
          ctx.arc(p.x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.28, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(190,225,255,${p.a})`;
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    resize();
    window.addEventListener('resize', resize);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="deepsea__particles" />;
}

const SILHOUETTES: { shape: FishShape; top: string; size: string; dur: string; delay: string; rev?: boolean }[] = [
  { shape: 'shark', top: '22%', size: '34vw', dur: '95s', delay: '-20s' },
  { shape: 'tuna', top: '58%', size: '18vw', dur: '70s', delay: '-50s', rev: true },
  { shape: 'marlin', top: '80%', size: '28vw', dur: '110s', delay: '-5s' },
];

export default function DeepSea() {
  const [depth, setDepth] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      setDepth(p);
      document.documentElement.style.setProperty('--depth', p.toFixed(3));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); document.documentElement.style.removeProperty('--depth'); };
  }, []);

  const meters = Math.round(depth * 300);
  return (
    <>
      <div className="deepsea" aria-hidden>
        <div className="deepsea__rays" />
        <div className="deepsea__caustics" />
        {SILHOUETTES.map((s, i) => {
          const v = fishVisual({ slug: `ghost-${i}`, image: '', art: { shape: s.shape, back: '#000', belly: '#000', fin: '#000', accent: '#000' } });
          return (
            <img
              key={i}
              src={v.src}
              alt=""
              className={`deepsea__ghost ${s.rev ? 'is-rev' : ''}`}
              style={{ top: s.top, width: s.size, animationDuration: s.dur, animationDelay: s.delay }}
            />
          );
        })}
        <Particles />
      </div>
      <div className="depth" aria-hidden>
        <div className="depth__track"><div className="depth__fill" style={{ height: `${depth * 100}%` }} /></div>
        <span className="depth__value display">{meters}<small>m</small></span>
      </div>
    </>
  );
}
