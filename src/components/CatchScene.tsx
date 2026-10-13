import { useEffect, useRef } from 'react';
import SwimmingFish from './SwimmingFish';
import './CatchScene.css';

// Booking confirmed: Omar (photo cut-out) on the bow, twitching a lure; a dentex chases it.
// Everything is driven by one rAF loop writing straight to the DOM (no re-renders).
const W = 1000, H = 520, WATER = 250, VY = -90; // VY: extra sky above the boat
const FISH_W = 270, FISH_ASPECT = 1756 / 753, MOUTH_Y = 0.6;

export default function CatchScene() {
  const rod = useRef<SVGPathElement>(null);
  const line = useRef<SVGPathElement>(null);
  const lure = useRef<SVGGElement>(null);
  const fish = useRef<HTMLDivElement>(null);
  const torso = useRef<SVGGElement>(null);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    let fx = 900, fy = 400, facingLeft = true;
    const fishH = FISH_W / FISH_ASPECT;
    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      const pulse = Math.pow(Math.max(0, Math.sin(t * 2.6)), 8); // rod twitches
      const lx = 680 + 170 * Math.sin(t * 0.42) - 30 * pulse;
      const ly = 392 + 34 * Math.sin(t * 0.84) - 14 * pulse;
      const vx = Math.cos(t * 0.42);

      // the dentex keeps its jaws just behind the lure
      if (vx < -0.15) facingLeft = true;
      if (vx > 0.15) facingLeft = false;
      const tx = facingLeft ? lx + 26 : lx - 26;
      fx += (tx - fx) * 0.035;
      fy += (ly - fy) * 0.05;

      const tipX = 566 - 20 * pulse;
      const tipY = -14 + 26 * pulse + 5 * Math.sin(t * 0.84);
      rod.current?.setAttribute('d', `M146 22Q${380 - 10 * pulse} ${-30 + 18 * pulse} ${tipX} ${tipY}`);
      line.current?.setAttribute('d', `M${tipX} ${tipY}Q${(tipX + lx) / 2 + 40} ${WATER - 30 + 40 * (1 - pulse)} ${lx} ${ly}`);
      const ang = facingLeft ? -6 + 18 * pulse : 186 - 18 * pulse;
      lure.current?.setAttribute('transform', `translate(${lx} ${ly}) rotate(${ang})`);
      torso.current?.setAttribute('transform', `rotate(${-2.5 * pulse} 150 232)`);

      if (fish.current) {
        const left = facingLeft ? fx : fx - FISH_W;
        fish.current.style.left = `${(left / W) * 100}%`;
        fish.current.style.top = `${((fy - fishH * MOUTH_Y - VY) / (H - VY)) * 100}%`;
        fish.current.style.transform = `scaleX(${facingLeft ? 1 : -1}) rotate(${(ly - fy) * 0.15}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="scene" style={{ aspectRatio: `${W} / ${H - VY}` }} aria-hidden>
      <svg viewBox={`0 ${VY} ${W} ${H - VY}`} className="scene__svg">
        <defs>
          <linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1b6fe0" />
            <stop offset=".6" stopColor="#6fb9f5" />
            <stop offset="1" stopColor="#d6efff" />
          </linearGradient>
          <radialGradient id="sc-sun">
            <stop offset="0" stopColor="#fffbe6" />
            <stop offset=".25" stopColor="#ffe68a" stopOpacity=".9" />
            <stop offset="1" stopColor="#ffc83d" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sc-glare" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff3b0" stopOpacity=".75" />
            <stop offset="1" stopColor="#fff3b0" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="sc-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d86ff" stopOpacity=".9" />
            <stop offset=".35" stopColor="#0a4fb0" stopOpacity=".92" />
            <stop offset="1" stopColor="#021a45" />
          </linearGradient>
          <linearGradient id="sc-hull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="1" stopColor="#c9d8ec" />
          </linearGradient>
          <linearGradient id="sc-lure" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d4fbf" />
            <stop offset=".45" stopColor="#e9f2ff" />
            <stop offset="1" stopColor="#c9d4e2" />
          </linearGradient>
        </defs>

        {/* sky */}
        <rect x="0" y={VY} width={W} height={WATER - VY + 20} fill="url(#sc-sky)" />
        <circle cx="760" cy="40" r="120" fill="url(#sc-sun)" className="scene__sun" />
        <g className="scene__clouds" fill="#fff">
          <g opacity=".85"><ellipse cx="260" cy="-30" rx="70" ry="18" /><ellipse cx="300" cy="-42" rx="44" ry="22" /><ellipse cx="230" cy="-40" rx="34" ry="16" /></g>
          <g opacity=".7"><ellipse cx="620" cy="-50" rx="60" ry="14" /><ellipse cx="650" cy="-60" rx="36" ry="18" /></g>
          <g opacity=".75"><ellipse cx="930" cy="10" rx="64" ry="15" /><ellipse cx="900" cy="0" rx="34" ry="16" /></g>
        </g>
        <path d={`M0 ${WATER - 6}H${W}`} stroke="#0a4fb0" strokeWidth="6" opacity=".55" />

        {/* boat */}
        <path d="M0 232H318Q352 234 344 252L300 318H0Z" fill="url(#sc-hull)" />
        <path d="M0 246H330L322 258H0Z" fill="#0b5bd3" />
        <path d="M0 214H300" stroke="#c9d8ec" strokeWidth="5" strokeLinecap="round" />
        <path d="M30 214V232M110 214V232M190 214V232M270 214V232" stroke="#c9d8ec" strokeWidth="4" />

        {/* Omar (real photo), leaning back into the fight */}
        <g className="omar">
          <g ref={torso}>
            <image href="/uploads/omar-cutout.png" x="78" y="-72" width="124" height="304" preserveAspectRatio="xMidYMax meet" />
          </g>

        {/* rod, reel */}
          <path ref={rod} d="M146 22Q380 -30 566 -14" fill="none" stroke="#14181d" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M144 20L176 13" stroke="#c49a6c" strokeWidth="8" strokeLinecap="round" />
          <g transform="translate(160 24)">
            <circle r="11" fill="#9aa8ba" stroke="#3a4656" strokeWidth="2" />
            <circle r="5" fill="#3a4656" />
            <g className="scene__handle"><path d="M0 0L14 -6" stroke="#14181d" strokeWidth="3" strokeLinecap="round" /><circle cx="14" cy="-6" r="3.5" fill="#ffc83d" /></g>
          </g>
        </g>

        {/* water */}
        <path className="scene__water" d={`M0 ${WATER}Q62 ${WATER - 10} 125 ${WATER}T250 ${WATER}T375 ${WATER}T500 ${WATER}T625 ${WATER}T750 ${WATER}T875 ${WATER}T1000 ${WATER}T1125 ${WATER}T1250 ${WATER}V${H}H0Z`} fill="url(#sc-water)" />
        <path d={`M700 ${WATER}L820 ${WATER}L860 ${WATER + 120}L660 ${WATER + 120}Z`} fill="url(#sc-glare)" className="scene__glare" />
        <g className="scene__rays" opacity=".18">
          <path d="M520 250L460 520H520L600 250Z" fill="#bfe8ff" />
          <path d="M760 250L740 520H790L820 250Z" fill="#bfe8ff" />
          <path d="M300 250L230 520H270L340 250Z" fill="#bfe8ff" />
        </g>

        <path ref={line} d="M566 -14Q640 240 680 392" fill="none" stroke="#e9f6ff" strokeOpacity=".75" strokeWidth="1.4" />

        {/* lure: minnow with a red head and a treble hook */}
        <g ref={lure} transform="translate(680 392)">
          <path d="M-22 0Q-12 -9 14 -6Q24 -4 26 0Q24 4 14 6Q-12 9 -22 0Z" fill="url(#sc-lure)" stroke="#0b2a66" strokeWidth="1.2" />
          <path d="M-22 0Q-18 -6 -10 -6V6Q-18 6 -22 0Z" fill="#ff3b30" />
          <path d="M-24 1L-34 6L-24 4Z" fill="#c9d4e2" opacity=".85" />
          <circle cx="-14" cy="-1.5" r="2" fill="#111" />
          <path d="M4 7V13M4 13Q0 17 -2 13M4 13Q8 17 10 13" fill="none" stroke="#9aa8ba" strokeWidth="1.4" />
        </g>
      </svg>

      <div className="scene__fish" ref={fish} style={{ width: `${(FISH_W / W) * 100}%` }}>
        <SwimmingFish src="/uploads/dentex.png" aspect={FISH_ASPECT} period={1.4} amp={0.05} drift={false} alt="" />
      </div>
      <div className="scene__bubbles">{Array.from({ length: 10 }, (_, i) => <i key={i} style={{ left: `${30 + i * 6.5}%`, animationDelay: `${-i * 0.7}s` }} />)}</div>
    </div>
  );
}
