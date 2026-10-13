// Procedural fish illustrations. Every species gets a hand-tuned silhouette
// (body profile, fins, tail, markings) rendered to SVG, facing left like a
// classic fish plate. A real photo uploaded from the admin replaces it.
import type { Fish, FishArt, FishShape } from './types';

type FinKind = 'tri' | 'sickle' | 'spiny' | 'long' | 'sail' | 'marlin' | 'round';
interface Fin { at: number; len: number; h: number; kind: FinKind }
interface Shape {
  x0: number; xp: number; h: number; peak: number; p1: number; p2: number; pedH: number; belly: number;
  tail: 'lunate' | 'forked' | 'round' | 'truncate' | 'shark'; tl: number; th: number;
  dorsal: Fin[]; anal: Fin[]; pelvic?: number; pec: number; finlets?: boolean;
  bill?: 'marlin' | 'sword'; eye: number; eyeT: number; gills?: boolean; mouth?: number;
}

const f = (at: number, len: number, h: number, kind: FinKind = 'tri'): Fin => ({ at, len, h, kind });

const SHAPES: Record<FishShape, Shape> = {
  tuna: { x0: 30, xp: 470, h: 66, peak: 0.36, p1: 0.72, p2: 1.35, pedH: 6, belly: 1.02, tail: 'lunate', tl: 100, th: 92,
    dorsal: [f(0.3, 0.13, 42, 'sickle'), f(0.52, 0.07, 34, 'sickle')], anal: [f(0.56, 0.07, 32, 'sickle')], pelvic: 0.3, pec: 80, finlets: true, eye: 9, eyeT: 0.09 },
  marlin: { x0: 150, xp: 490, h: 44, peak: 0.28, p1: 0.85, p2: 1.15, pedH: 6, belly: 1.05, tail: 'lunate', tl: 92, th: 96,
    dorsal: [f(0.04, 0.55, 64, 'marlin'), f(0.86, 0.04, 12)], anal: [f(0.52, 0.09, 34, 'sickle')], pelvic: 0.22, pec: 70, bill: 'marlin', eye: 7, eyeT: 0.06 },
  sword: { x0: 175, xp: 495, h: 46, peak: 0.3, p1: 0.75, p2: 1.2, pedH: 6, belly: 1.0, tail: 'lunate', tl: 96, th: 100,
    dorsal: [f(0.12, 0.1, 62, 'sickle')], anal: [f(0.62, 0.07, 28, 'sickle')], pec: 70, bill: 'sword', eye: 9, eyeT: 0.07 },
  sailfish: { x0: 140, xp: 495, h: 36, peak: 0.3, p1: 0.9, p2: 1.1, pedH: 5, belly: 1.05, tail: 'lunate', tl: 88, th: 86,
    dorsal: [f(0.03, 0.66, 108, 'sail')], anal: [f(0.55, 0.08, 30, 'sickle')], pelvic: 0.2, pec: 60, bill: 'marlin', eye: 6, eyeT: 0.06 },
  shark: { x0: 30, xp: 430, h: 52, peak: 0.36, p1: 0.5, p2: 1.45, pedH: 9, belly: 0.95, tail: 'shark', tl: 150, th: 92,
    dorsal: [f(0.33, 0.15, 64, 'sickle'), f(0.8, 0.05, 16)], anal: [f(0.78, 0.05, 14)], pelvic: 0.6, pec: 95, gills: true, eye: 5, eyeT: 0.12, mouth: 0.1 },
  grouper: { x0: 30, xp: 470, h: 72, peak: 0.36, p1: 0.5, p2: 0.85, pedH: 24, belly: 1.06, tail: 'round', tl: 82, th: 54,
    dorsal: [f(0.22, 0.38, 22, 'spiny'), f(0.6, 0.18, 30, 'round')], anal: [f(0.62, 0.15, 30, 'round')], pelvic: 0.3, pec: 58, eye: 9, eyeT: 0.12, mouth: 0.14 },
  bream: { x0: 40, xp: 465, h: 84, peak: 0.4, p1: 0.58, p2: 1.0, pedH: 12, belly: 1.0, tail: 'forked', tl: 86, th: 72,
    dorsal: [f(0.26, 0.56, 26, 'spiny')], anal: [f(0.64, 0.16, 24, 'round')], pelvic: 0.34, pec: 70, eye: 11, eyeT: 0.13, mouth: 0.05 },
  bass: { x0: 30, xp: 480, h: 54, peak: 0.4, p1: 0.78, p2: 1.0, pedH: 14, belly: 1.0, tail: 'forked', tl: 80, th: 56,
    dorsal: [f(0.3, 0.17, 30, 'spiny'), f(0.52, 0.17, 24, 'round')], anal: [f(0.61, 0.14, 22, 'round')], pelvic: 0.32, pec: 50, eye: 9, eyeT: 0.1, mouth: 0.1 },
  barracuda: { x0: 30, xp: 505, h: 30, peak: 0.46, p1: 1.15, p2: 0.9, pedH: 10, belly: 1.0, tail: 'forked', tl: 70, th: 52,
    dorsal: [f(0.42, 0.07, 26, 'sickle'), f(0.7, 0.06, 20, 'sickle')], anal: [f(0.71, 0.06, 18, 'sickle')], pelvic: 0.44, pec: 40, eye: 8, eyeT: 0.13, mouth: 0.15 },
  mahi: { x0: 30, xp: 480, h: 70, peak: 0.1, p1: 0.35, p2: 1.1, pedH: 8, belly: 1.0, tail: 'forked', tl: 104, th: 88,
    dorsal: [f(0.03, 0.82, 30, 'long')], anal: [f(0.46, 0.42, 24, 'long')], pelvic: 0.22, pec: 50, eye: 8, eyeT: 0.08, mouth: 0.05 },
  jack: { x0: 30, xp: 470, h: 66, peak: 0.38, p1: 0.68, p2: 1.2, pedH: 8, belly: 1.05, tail: 'lunate', tl: 96, th: 86,
    dorsal: [f(0.3, 0.07, 16, 'spiny'), f(0.42, 0.32, 36, 'long')], anal: [f(0.56, 0.22, 30, 'long')], pelvic: 0.32, pec: 76, eye: 10, eyeT: 0.1, mouth: 0.08 },
  corvina: { x0: 30, xp: 480, h: 58, peak: 0.36, p1: 0.68, p2: 1.0, pedH: 16, belly: 1.02, tail: 'truncate', tl: 76, th: 52,
    dorsal: [f(0.25, 0.16, 36, 'spiny'), f(0.43, 0.36, 20, 'round')], anal: [f(0.68, 0.08, 20, 'round')], pelvic: 0.3, pec: 52, eye: 9, eyeT: 0.1, mouth: 0.1 },
  wahoo: { x0: 30, xp: 510, h: 32, peak: 0.34, p1: 1.05, p2: 0.95, pedH: 7, belly: 1.0, tail: 'lunate', tl: 84, th: 72,
    dorsal: [f(0.15, 0.45, 18, 'long')], anal: [f(0.64, 0.1, 18, 'sickle')], pelvic: 0.3, pec: 34, finlets: true, eye: 7, eyeT: 0.08, mouth: 0.12 },
};

const CY = 120;

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type P = [number, number];
const n = (v: number) => Math.round(v * 10) / 10;

// Catmull-Rom → cubic Bézier, for smooth sampled outlines.
function smooth(pts: P[], closed = false) {
  if (pts.length < 2) return '';
  let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
  const get = (i: number) => pts[closed ? (i + pts.length) % pts.length : Math.max(0, Math.min(pts.length - 1, i))];
  const last = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${n(c1[0])} ${n(c1[1])} ${n(c2[0])} ${n(c2[1])} ${n(p2[0])} ${n(p2[1])}`;
  }
  return closed ? d + 'Z' : d;
}

function shade(hex: string, amt: number) {
  const c = hex.replace('#', '');
  const v = parseInt(c.length === 3 ? c.split('').map((x) => x + x).join('') : c, 16);
  const ch = (s: number) => Math.max(0, Math.min(255, Math.round(((v >> s) & 255) + amt * 255)));
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}

export function fishSvg(art: FishArt, seedKey = 'fish'): { svg: string; aspect: number } {
  const base = SHAPES[art.shape] ?? SHAPES.tuna;
  const s: Shape = art.deep ? { ...base, h: base.h * 1.22, p1: base.p1 * 0.75 } : base;
  const rand = rng(hash(seedKey));
  const L = s.xp - s.x0;
  const X = (t: number) => s.x0 + t * L;
  const thick = (t: number) =>
    t < s.peak
      ? s.h * Math.pow(Math.sin((Math.PI / 2) * (t / s.peak)), s.p1)
      : s.pedH + (s.h - s.pedH) * Math.pow(Math.cos((Math.PI / 2) * ((t - s.peak) / (1 - s.peak))), s.p2);
  const top = (t: number) => CY - thick(t);
  const bot = (t: number) => CY + thick(t) * s.belly;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const ext = (x: number, y: number) => {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  };

  // ---- body outline
  const N = 56;
  const upper: P[] = [], lower: P[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    upper.push([X(t), top(t)]);
    lower.push([X(t), bot(t)]);
  }
  upper.forEach(([x, y]) => ext(x, y));
  lower.forEach(([x, y]) => ext(x, y));
  const bodyPts = [...upper, ...lower.reverse().slice(1, -1)];
  const body = smooth(bodyPts, true);

  // ---- fins
  const fin = (fi: Fin, dir: -1 | 1) => {
    const edge = dir < 0 ? top : bot;
    const tA = fi.at, tB = Math.min(0.99, fi.at + fi.len);
    const inset = -dir * 4;
    const sx = X(tA), sy = edge(tA) + inset, ex = X(tB), ey = edge(tB) + inset;
    const w = ex - sx;
    const pts: P[] = [];
    const out = (x: number, y: number) => { ext(x, y); return [x, y] as P; };
    if (fi.kind === 'spiny') {
      const count = Math.max(4, Math.round(w / 13));
      let d = `M${n(sx)} ${n(sy)}`;
      for (let i = 0; i <= count; i++) {
        const t = tA + (i / count) * (tB - tA);
        const k = i === 0 ? 0.55 : 1 - 0.25 * (i / count);
        const [x, y] = out(X(t) + 5, edge(t) + dir * fi.h * k);
        const [mx, my] = [X(t) + 11, edge(t) + dir * fi.h * k * 0.62];
        d += `L${n(x)} ${n(y)}Q${n(mx - 3)} ${n(my)} ${n(mx)} ${n(my)}`;
      }
      d += `L${n(ex)} ${n(ey)}Z`;
      let rays = '';
      for (let i = 0; i <= count; i++) {
        const t = tA + (i / count) * (tB - tA);
        const k = i === 0 ? 0.55 : 1 - 0.25 * (i / count);
        rays += `M${n(X(t))} ${n(edge(t) + inset)}L${n(X(t) + 5)} ${n(edge(t) + dir * fi.h * k)}`;
      }
      return { d, rays };
    }
    if (fi.kind === 'long' || fi.kind === 'sail' || fi.kind === 'marlin' || fi.kind === 'round') {
      const M = 18;
      for (let i = 0; i <= M; i++) {
        const u = i / M;
        let k: number;
        if (fi.kind === 'long') k = 1 - 0.55 * u;
        else if (fi.kind === 'sail') k = Math.sin(Math.PI * Math.min(1, u * 1.15 + 0.05)) * (1 - 0.3 * u) + 0.08;
        else if (fi.kind === 'marlin') k = u < 0.16 ? Math.sin((u / 0.16) * (Math.PI / 2)) : 0.22 - 0.08 * u;
        else k = Math.sin(Math.PI * u) * 0.9 + 0.1;
        const t = tA + u * (tB - tA);
        pts.push(out(X(t) + (fi.kind === 'marlin' && u < 0.16 ? u * 60 : 6), edge(t) + dir * fi.h * Math.max(0.06, k)));
      }
      const d = `M${n(sx)} ${n(sy)}` + smooth(pts).replace(/^M/, 'L') + `L${n(ex)} ${n(ey)}Z`;
      let rays = '';
      if (fi.kind === 'sail' || fi.kind === 'long') {
        for (let i = 1; i < M; i += 2) rays += `M${n(pts[i][0] - 6)} ${n(edge(tA + (i / M) * (tB - tA)) + inset)}L${n(pts[i][0])} ${n(pts[i][1])}`;
      }
      return { d, rays };
    }
    // tri / sickle
    const sweep = fi.kind === 'sickle' ? 1.1 : 0.55;
    const [ax, ay] = out(sx + w * 0.4 + fi.h * sweep, sy + dir * fi.h);
    const d = `M${n(sx)} ${n(sy)}Q${n(sx + w * 0.15)} ${n(sy + dir * fi.h * 0.75)} ${n(ax)} ${n(ay)}` +
      `Q${n(ex - w * (fi.kind === 'sickle' ? 0.05 : 0.2))} ${n(ey + dir * fi.h * (fi.kind === 'sickle' ? 0.12 : 0.35))} ${n(ex)} ${n(ey)}Z`;
    return { d, rays: '' };
  };
  const dorsal = s.dorsal.map((d) => fin(d, -1));
  const anal = s.anal.map((d) => fin(d, 1));

  // ---- tail
  const tx = s.xp - 8;
  const pt = s.pedH;
  const { tl, th } = s;
  let tail: string;
  switch (s.tail) {
    case 'lunate':
      tail = `M${tx} ${CY - pt}C${tx + tl * 0.35} ${CY - th * 0.35} ${tx + tl * 0.75} ${CY - th * 0.8} ${tx + tl} ${CY - th}` +
        `Q${tx + tl * 0.42} ${CY} ${tx + tl} ${CY + th}C${tx + tl * 0.75} ${CY + th * 0.8} ${tx + tl * 0.35} ${CY + th * 0.35} ${tx} ${CY + pt}Z`;
      ext(tx + tl, CY - th); ext(tx + tl, CY + th);
      break;
    case 'forked':
      tail = `M${tx} ${CY - pt}C${tx + tl * 0.4} ${CY - th * 0.4} ${tx + tl * 0.8} ${CY - th * 0.85} ${tx + tl} ${CY - th}` +
        `L${tx + tl * 0.5} ${CY}L${tx + tl} ${CY + th}C${tx + tl * 0.8} ${CY + th * 0.85} ${tx + tl * 0.4} ${CY + th * 0.4} ${tx} ${CY + pt}Z`;
      ext(tx + tl, CY - th); ext(tx + tl, CY + th);
      break;
    case 'round':
      tail = `M${tx} ${CY - pt}C${tx + tl * 0.55} ${CY - th * 1.2} ${tx + tl * 1.05} ${CY - th * 0.7} ${tx + tl} ${CY}` +
        `C${tx + tl * 1.05} ${CY + th * 0.7} ${tx + tl * 0.55} ${CY + th * 1.2} ${tx} ${CY + pt}Z`;
      ext(tx + tl * 1.05, CY - th); ext(tx + tl, CY + th);
      break;
    case 'truncate':
      tail = `M${tx} ${CY - pt}Q${tx + tl * 0.5} ${CY - th * 0.8} ${tx + tl * 0.92} ${CY - th}L${tx + tl} ${CY}` +
        `L${tx + tl * 0.92} ${CY + th}Q${tx + tl * 0.5} ${CY + th * 0.8} ${tx} ${CY + pt}Z`;
      ext(tx + tl, CY - th); ext(tx + tl, CY + th);
      break;
    case 'shark':
    default:
      tail = `M${tx} ${CY - pt}Q${tx + tl * 0.5} ${CY - th * 0.7} ${tx + tl} ${CY - th * 1.15}` +
        `Q${tx + tl * 0.72} ${CY - th * 0.25} ${tx + tl * 0.62} ${CY + th * 0.02}Q${tx + tl * 0.55} ${CY + th * 0.45} ${tx + tl * 0.5} ${CY + th * 0.62}` +
        `Q${tx + tl * 0.25} ${CY + th * 0.3} ${tx} ${CY + pt}Z`;
      ext(tx + tl, CY - th * 1.15); ext(tx + tl * 0.5, CY + th * 0.62);
  }

  // ---- pectoral, pelvic, finlets, bill
  const pecT = art.shape === 'shark' ? 0.27 : 0.22;
  const pecX = X(pecT), pecY = CY + thick(pecT) * (art.shape === 'shark' ? 0.55 : 0.12);
  const pl = (art.longPec ? 2 : 1) * s.pec;
  const droop = art.shape === 'shark' ? 0.75 : 0.22;
  const pec = `M${n(pecX)} ${n(pecY - 6)}Q${n(pecX + pl * 0.45)} ${n(pecY - 10 + pl * droop * 0.3)} ${n(pecX + pl)} ${n(pecY + pl * droop)}` +
    `Q${n(pecX + pl * 0.4)} ${n(pecY + 10 + pl * droop * 0.4)} ${n(pecX)} ${n(pecY + 6)}Z`;
  ext(pecX + pl, pecY + pl * droop);

  let pelvic = '';
  if (s.pelvic) {
    const px = X(s.pelvic), py = bot(s.pelvic) - 3;
    pelvic = `M${n(px)} ${n(py)}Q${n(px + 10)} ${n(py + 18)} ${n(px + 30)} ${n(py + 24)}Q${n(px + 22)} ${n(py + 6)} ${n(px + 24)} ${n(py)}Z`;
    ext(px + 30, py + 24);
  }

  let finlets = '';
  if (s.finlets) {
    for (let i = 0; i < 7; i++) {
      const t = 0.78 + i * 0.03;
      const x = X(t);
      finlets += `M${n(x)} ${n(top(t) + 2)}L${n(x + 9)} ${n(top(t) - 7)}L${n(x + 7)} ${n(top(t) + 2)}Z`;
      finlets += `M${n(x)} ${n(bot(t) - 2)}L${n(x + 9)} ${n(bot(t) + 7)}L${n(x + 7)} ${n(bot(t) - 2)}Z`;
    }
  }

  let bill = '';
  if (s.bill === 'marlin') {
    const bl = s.x0 - 22;
    bill = `M${s.x0 + 8} ${CY - 5}L${s.x0 - bl} ${CY + 1}L${s.x0 + 8} ${CY + 6}Z M${s.x0 + 6} ${CY + 5}L${s.x0 - 18} ${CY + 7}L${s.x0 + 8} ${CY + 10}Z`;
    ext(s.x0 - bl, CY);
  } else if (s.bill === 'sword') {
    const bl = s.x0 - 18;
    bill = `M${s.x0 + 8} ${CY - 9}Q${s.x0 - bl * 0.5} ${CY - 6} ${s.x0 - bl} ${CY}Q${s.x0 - bl * 0.5} ${CY + 3} ${s.x0 + 8} ${CY + 6}Z`;
    ext(s.x0 - bl, CY);
  }

  // ---- head details
  const ex = X(s.eyeT), ey = CY - thick(s.eyeT) * 0.32;
  const opT = s.eyeT + 0.1;
  const oper = s.gills
    ? Array.from({ length: 5 }, (_, i) => {
        const x = X(0.19 + i * 0.022);
        return `M${n(x)} ${n(CY - thick(0.2) * 0.45)}Q${n(x - 4)} ${n(CY)} ${n(x)} ${n(CY + thick(0.2) * 0.4)}`;
      }).join('')
    : `M${n(X(opT))} ${n(top(opT) + 5)}Q${n(X(opT + 0.06))} ${n(CY + 2)} ${n(X(opT) - 4)} ${n(bot(opT) - 6)}`;
  const mt = s.mouth ?? 0.06;
  const mouth = `M${n(X(0.005))} ${n(CY + 2)}Q${n(X(mt * 0.6))} ${n(CY + thick(mt) * 0.18)} ${n(X(mt))} ${n(CY + thick(mt) * 0.28)}`;

  // ---- markings (clipped to body)
  let marks = '';
  const latPts: P[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = 0.16 + (i / 24) * 0.82;
    const wob = art.wavyLine ? Math.sin(t * 22) * thick(t) * 0.18 : 0;
    latPts.push([X(t), CY - thick(t) * 0.22 + wob]);
  }
  if (art.stripe) marks += `<path d="${smooth(latPts)}" stroke="${art.accent}" stroke-width="${n(s.h * 0.16)}" stroke-opacity=".75" fill="none" stroke-linecap="round"/>`;
  if (art.band) {
    marks += `<path d="M${n(X(0.0))} ${n(CY - 2)}L${n(X(0.2))} ${n(top(0.2))}" stroke="#000" stroke-opacity=".32" stroke-width="10" stroke-linecap="round"/>`;
    marks += `<path d="${smooth(latPts)}" stroke="${art.accent}" stroke-width="7" stroke-opacity=".8" fill="none"/>`;
  }
  if (art.backStripes) {
    for (let t = 0.22; t < 0.88; t += 0.065)
      marks += `<path d="M${n(X(t))} ${n(top(t) - 2)}L${n(X(t) + 34)} ${n(CY - thick(t) * 0.18)}" stroke="${art.accent}" stroke-width="4.5" stroke-opacity=".7" stroke-linecap="round"/>`;
  }
  if (art.bars) {
    for (let t = 0.24; t < 0.9; t += 0.085)
      marks += `<path d="M${n(X(t))} ${n(top(t) - 4)}Q${n(X(t) + 6)} ${n(CY)} ${n(X(t) - 2)} ${n(CY + thick(t) * 0.35)}" stroke="${art.accent}" stroke-width="${n(Math.max(6, L * 0.022))}" stroke-opacity=".5" stroke-linecap="round" fill="none"/>`;
  }
  if (art.spots) {
    for (let i = 0; i < 34; i++) {
      const t = 0.12 + rand() * 0.78;
      const y = CY - thick(t) * (0.15 + rand() * 0.7);
      marks += `<circle cx="${n(X(t))}" cy="${n(y)}" r="${n(1.6 + rand() * 2.6)}" fill="${art.accent}" fill-opacity=".85"/>`;
    }
  }
  if (art.blotches) {
    for (let i = 0; i < 18; i++) {
      const t = 0.12 + rand() * 0.82;
      const y = CY + thick(t) * (rand() * 1.6 - 0.8);
      marks += `<ellipse cx="${n(X(t))}" cy="${n(y)}" rx="${n(6 + rand() * 9)}" ry="${n(4 + rand() * 6)}" fill="${art.accent}" fill-opacity=".32" transform="rotate(${n(rand() * 60 - 30)} ${n(X(t))} ${n(y)})"/>`;
    }
  }
  if (art.goldBand) {
    marks += `<path d="M${n(ex - 10)} ${n(ey - s.eye - 3)}Q${n(ex + 4)} ${n(ey - s.eye * 2.2)} ${n(ex + 18)} ${n(ey - s.eye - 2)}" stroke="${art.accent}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  }
  const lateral = art.stripe || art.band ? '' :
    `<path d="${smooth(latPts)}" stroke="${art.wavyLine ? '#000' : '#fff'}" stroke-opacity="${art.wavyLine ? 0.45 : 0.32}" stroke-width="${art.wavyLine ? 2.4 : 1.4}" fill="none"/>`;

  const finC = art.fin, finDark = shade(art.fin, -0.18);
  const pad = 8;
  const vx = Math.floor(minX - pad), vy = Math.floor(minY - pad);
  const vw = Math.ceil(maxX - minX + pad * 2), vh = Math.ceil(maxY - minY + pad * 2);
  const k = `f${hash(seedKey).toString(36)}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${vw * 2}" height="${vh * 2}">
<defs>
<linearGradient id="${k}b" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="${shade(art.back, -0.06)}"/><stop offset=".44" stop-color="${art.back}"/>
<stop offset=".6" stop-color="${shade(art.belly, -0.12)}"/><stop offset="1" stop-color="${art.belly}"/></linearGradient>
<linearGradient id="${k}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${finC}"/><stop offset="1" stop-color="${finDark}"/></linearGradient>
<radialGradient id="${k}s" cx=".38" cy=".3" r=".55"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<pattern id="${k}p" width="9" height="7" patternUnits="userSpaceOnUse"><path d="M0 7Q4.5 0 9 7" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width=".8"/></pattern>
<filter id="${k}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${hash(seedKey) % 97}"/>
<feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .32 -.12"/></filter>
<clipPath id="${k}c"><path d="${body}"/></clipPath>
</defs>
<g stroke="${finDark}" stroke-width="1" stroke-linejoin="round">
<path d="${tail}" fill="url(#${k}f)"/>
${dorsal.map((d) => `<path d="${d.d}" fill="url(#${k}f)" fill-opacity=".96"/>`).join('')}
${anal.map((d) => `<path d="${d.d}" fill="url(#${k}f)" fill-opacity=".96"/>`).join('')}
${bill ? `<path d="${bill}" fill="${shade(art.back, 0.04)}"/>` : ''}
</g>
<g stroke="${shade(finDark, -0.1)}" stroke-opacity=".45" stroke-width="1" fill="none">${dorsal.map((d) => d.rays).join('')}${anal.map((d) => d.rays).join('')}</g>
<path d="${body}" fill="url(#${k}b)"/>
<g clip-path="url(#${k}c)">
<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="url(#${k}p)"/>
${marks}
<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" filter="url(#${k}n)"/>
<ellipse cx="${n(X(0.42))}" cy="${n(CY - s.h * 0.35)}" rx="${n(L * 0.48)}" ry="${n(s.h * 0.42)}" fill="url(#${k}s)"/>
<path d="${body}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="5"/>
${lateral}
<path d="${oper}" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="2"/>
<path d="${mouth}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/>
</g>
${pelvic ? `<path d="${pelvic}" fill="url(#${k}f)" stroke="${finDark}" stroke-width="1"/>` : ''}
<path d="${pec}" fill="url(#${k}f)" fill-opacity=".92" stroke="${finDark}" stroke-width="1"/>
${finlets ? `<path d="${finlets}" fill="${art.shape === 'wahoo' ? finC : art.accent}"/>` : ''}
<circle cx="${n(ex)}" cy="${n(ey)}" r="${s.eye}" fill="#e9e2cf" stroke="#000" stroke-opacity=".5" stroke-width="1.4"/>
<circle cx="${n(ex)}" cy="${n(ey)}" r="${n(s.eye * 0.66)}" fill="#07090d"/>
<circle cx="${n(ex - s.eye * 0.28)}" cy="${n(ey - s.eye * 0.3)}" r="${n(s.eye * 0.22)}" fill="#fff" fill-opacity=".9"/>
</svg>`;
  return { svg, aspect: vw / vh };
}

const cache = new Map<string, { src: string; aspect: number }>();

/** Image URL + aspect ratio for a fish (uploaded photo wins over the generated art). */
export function fishVisual(fish: Pick<Fish, 'slug' | 'art' | 'image'>): { src: string; aspect?: number } {
  if (fish.image) return { src: fish.image };
  const key = fish.slug + JSON.stringify(fish.art);
  let v = cache.get(key);
  if (!v) {
    const { svg, aspect } = fishSvg(fish.art, fish.slug);
    v = { src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, aspect };
    cache.set(key, v);
  }
  return v;
}

export const FISH_SHAPES = Object.keys(SHAPES) as FishShape[];
