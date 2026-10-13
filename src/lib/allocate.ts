// Mirrors server/index.js allocate(): keep a group on one boat when possible
// (best fit), otherwise split it across both boats.
export function allocate(boatsLeft: number[], people: number): number[] | null {
  const total = boatsLeft.reduce((a, b) => a + b, 0);
  if (people > total) return null;
  const out = boatsLeft.map(() => 0);
  const fits = boatsLeft.map((l, i) => ({ l, i })).filter((b) => b.l >= people).sort((a, b) => a.l - b.l);
  if (fits.length) {
    out[fits[0].i] = people;
    return out;
  }
  let rest = people;
  for (const b of boatsLeft.map((l, i) => ({ l, i })).sort((a, b) => b.l - a.l)) {
    const take = Math.min(b.l, rest);
    out[b.i] = take;
    rest -= take;
  }
  return out;
}
