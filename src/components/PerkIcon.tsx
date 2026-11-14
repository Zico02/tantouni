// Line icons for the service promises (no emoji: they render differently on every phone).
const PERK_ICONS = [
  // truck
  'M3 6h11v9H3zM14 9h4l3 3v3h-7M7.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  // banknote
  'M3 7h18v10H3zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM6 10v4M18 10v4',
  // phone with check
  'M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM11 18h2M9.5 10.5l2 2 3.5-3.5',
  // shopping bag
  'M6 7h12l-1 13H7L6 7zM9 7a3 3 0 0 1 6 0',
];
export const PerkIcon = ({ i, size = 22 }: { i: number; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={PERK_ICONS[i]} />
  </svg>
);
