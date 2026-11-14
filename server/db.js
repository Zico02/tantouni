// Tiny JSON-file database. Good enough for one captain, two boats and a few
// hundred bookings a year; swap for Postgres/SQLite later without touching routes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedAchievements, seedFish } from './seed.js';
import { SEAS_BY_SLUG } from './sharks.js';
import { seedProducts } from './shop.js';
import { RANGES } from './ranges.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function initial() {
  return {
    reservations: [],
    blockedDays: [], // [{ date: 'YYYY-MM-DD', reason }]
    fish: seedFish(),
    achievements: seedAchievements(),
    products: seedProducts(),
    shopVersion: 4,
    orders: [],
  };
}

let state;
let writing = Promise.resolve();

export function load() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    state = initial();
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
  } else {
    state = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    // migrations for databases created by older versions
    let dirty = false;
    if (!state.achievements) {
      state.achievements = seedAchievements();
      dirty = true;
    }
    if (!state.products) { state.products = seedProducts(); dirty = true; }
    if (!state.orders) { state.orders = []; dirty = true; }
    // shop v2 (one time): new order (hoodies, balaclavas, bob, cap), new prices, cap photo without the label
    if ((state.shopVersion ?? 1) < 2) {
      const ORDER = ['hoodie-bleu-ciel', 'hoodie-gris-perle', 'hoodie-noir', 'hoodie-mahi-mahi', 'cagoule-noire', 'cagoule-camo-nuit', 'cagoule-python', 'cagoule-camo-urbain', 'bob-cache-cou', 'casquette-trucker'];
      for (const p of state.products) {
        const i = ORDER.indexOf(p.slug);
        if (i >= 0) p.order = i;
        if (p.slug === 'hoodie-bleu-ciel') p.price = 350;
        if (p.slug === 'casquette-trucker') p.price = 75;
        p.images = (p.images ?? []).map((u) => (u === '/uploads/shop/casquette-trucker.webp' ? '/uploads/shop/casquette-trucker-v2.webp' : u));
      }
      state.shopVersion = 2;
      dirty = true;
    }
    // shop v3 (one time): no "Édition Mahi" badge on the Mahi-Mahi hoodie
    if (state.shopVersion < 3) {
      const mahi = state.products.find((p) => p.slug === 'hoodie-mahi-mahi');
      if (mahi?.badge?.fr === 'Édition Mahi') mahi.badge = {};
      state.shopVersion = 3;
      dirty = true;
    }
    // shop v4 (one time): bob 250 DH, cap 150 DH (only if still at the previous price)
    if (state.shopVersion < 4) {
      for (const p of state.products) {
        if (p.slug === 'bob-cache-cou' && p.price === 199) p.price = 250;
        if (p.slug === 'casquette-trucker' && p.price === 75) p.price = 150;
      }
      state.shopVersion = 4;
      dirty = true;
    }
    // seas filter: give existing fish their seas, and add sharks that aren't on the board yet
    const seeded = seedFish();
    for (const f of state.fish) {
      if (!f.seas) { f.seas = SEAS_BY_SLUG[f.slug] ?? []; dirty = true; }
      // "Où le trouver": fill it once for fish that don't have one yet
      if (!f.range) { f.range = RANGES[f.slug] ?? {}; dirty = true; }
    }
    let order = Math.max(-1, ...state.fish.map((f) => f.order ?? 0));
    for (const f of seeded) {
      if (f.group === 'shark' && !state.fish.some((x) => x.slug === f.slug)) {
        state.fish.push({ ...f, order: ++order });
        dirty = true;
      }
    }
    if (dirty) fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
  }
  return state;
}

export function db() {
  return state ?? load();
}

// Serialise writes so two requests never interleave a half-written file.
export function save() {
  const snapshot = JSON.stringify(state, null, 2);
  writing = writing.then(async () => {
    const tmp = DB_FILE + '.tmp';
    await fs.promises.writeFile(tmp, snapshot);
    await fs.promises.rename(tmp, DB_FILE);
  });
  return writing;
}
