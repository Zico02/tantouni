// A slow-pitch metal jig on its line: front assist hooks, holographic body, tail treble.
// Drawn upright (eye at the top) so it hangs naturally from the line.
export default function Jig({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 220" width="60" height="220" aria-hidden>
      <defs>
        <linearGradient id="jig-metal" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#5d7594" />
          <stop offset="0.32" stopColor="#c9d7ea" />
          <stop offset="0.48" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#b5c6dd" />
          <stop offset="1" stopColor="#4c6282" />
        </linearGradient>
        <linearGradient id="jig-holo" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7fd4ff" stopOpacity="0.55" />
          <stop offset="0.35" stopColor="#c9a2ff" stopOpacity="0.35" />
          <stop offset="0.7" stopColor="#7fffe1" stopOpacity="0.35" />
          <stop offset="1" stopColor="#7fd4ff" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="jig-back" x1="0" x2="1">
          <stop offset="0" stopColor="#0f2a55" stopOpacity="0.85" />
          <stop offset="1" stopColor="#0f2a55" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* split ring + swivel at the nose */}
      <ellipse cx="30" cy="9" rx="4.2" ry="5.5" fill="none" stroke="#d9e2ee" strokeWidth="1.6" />
      <ellipse cx="30" cy="20" rx="3" ry="4" fill="none" stroke="#c4cfdd" strokeWidth="1.4" />
      {/* two assist hooks on gold cord, hanging along the body */}
      <path d="M30 22c-3 6-8 10-12 15" fill="none" stroke="#e3b54b" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 22c3 6 8 10 12 15" fill="none" stroke="#e3b54b" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 37v16c0 6 7 6 7 0" fill="none" stroke="#dbe3ee" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M42 37v16c0 6-7 6-7 0" fill="none" stroke="#dbe3ee" strokeWidth="1.8" strokeLinecap="round" />
      {/* body */}
      <path d="M30 24c9 16 11 58 8 104-1 22-4 40-8 52-4-12-7-30-8-52-3-46-1-88 8-104z" fill="url(#jig-metal)" />
      <path d="M30 24c9 16 11 58 8 104-1 22-4 40-8 52-4-12-7-30-8-52-3-46-1-88 8-104z" fill="url(#jig-holo)" style={{ mixBlendMode: 'screen' }} />
      <path d="M30 24c-9 16-11 58-8 104 1 22 4 40 8 52V24z" fill="url(#jig-back)" />
      {/* glow stripe + eye */}
      <path d="M31.5 46c2.5 22 2.6 56 .6 92" fill="none" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="30" cy="44" r="5" fill="#e3b54b" />
      <circle cx="30" cy="44" r="2.6" fill="#0a0f1a" />
      <circle cx="31" cy="43" r="0.9" fill="#fff" />
      {/* tail ring + treble */}
      <ellipse cx="30" cy="184" rx="3" ry="4" fill="none" stroke="#c4cfdd" strokeWidth="1.4" />
      <path d="M30 188v14" stroke="#dbe3ee" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M30 202c0 7-8 8-9 1M30 202c0 7 8 8 9 1M30 202v8c0 4 4 4 4 1" fill="none" stroke="#dbe3ee" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
