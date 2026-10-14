import { useId } from 'react';

// "CAUGHT" rubber stamp laid over a caught species: tilted red frame, bold
// letters, worn-ink speckles (procedural noise filter), semi-transparent.
export default function CaughtStamp({ animate = true, label = 'CAUGHT' }: { animate?: boolean; label?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={`stamp ${animate ? 'stamp--hit' : ''}`} viewBox="0 0 340 150" aria-hidden>
      <defs>
        {/* worn ink: punch sparse noise speckles out of the stamp */}
        <filter id={`${id}w`} filterUnits="userSpaceOnUse" x="0" y="0" width="340" height="150">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  14 0 0 0 -9.4" result="holes" />
          <feComposite in="SourceGraphic" in2="holes" operator="out" />
        </filter>
      </defs>
      <g transform="rotate(-14 170 75)" filter={`url(#${id}w)`} className="stamp__ink">
        <rect x="22" y="30" width="296" height="90" rx="16" fill="none" strokeWidth="9" />
        <rect x="34" y="41" width="272" height="68" rx="9" fill="none" strokeWidth="2.5" />
        <text x="170" y="94" textAnchor="middle" className="stamp__text" textLength="236" lengthAdjust="spacingAndGlyphs">{label}</text>
      </g>
    </svg>
  );
}
