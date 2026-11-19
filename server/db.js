// The whole site state is one JSON document (bookings, fish, trophies, shop...).
// Locally it lives in server/data/db.json. On Vercel (DATABASE_URL set) it lives in
// one Postgres row, written with a version check so two servers never overwrite each other.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedAchievements, seedFish } from './seed.js';
import { SEAS_BY_SLUG } from './sharks.js';
import { seedProducts } from './shop.js';
import { RANGES } from './ranges.js';
import { SHARK_PHOTOS } from './sharkPhotos.js';

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

// Brings a database created by an older version up to date. Returns true if anything changed.
function migrate(state) {
  let dirty = false;
  if (!state.achievements) {
    state.achievements = seedAchievements();
    dirty = true;
  }
  if (!state.products) { state.products = seedProducts(); dirty = true; }
  if (!state.orders) { state.orders = []; dirty = true; }
  // one time: real photos for the sharks that still use the drawing
  if (!state.sharkPhotos) {
    for (const f of state.fish) {
      const p = SHARK_PHOTOS[f.slug];
      if (p && !f.image) { f.image = p.image; f.credit = p.credit; }
    }
    state.sharkPhotos = 1;
    dirty = true;
  }
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
  return dirty;
}

const PG_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;
let state;
let version = 0;

// ---------- Postgres (Vercel / Neon) ----------
let sqlFn;
async function sql() {
  if (!sqlFn) {
    const { neon } = await import('@neondatabase/serverless');
    sqlFn = neon(PG_URL);
    await sqlFn`CREATE TABLE IF NOT EXISTS site_state (id int PRIMARY KEY, version int NOT NULL, data jsonb NOT NULL)`;
  }
  return sqlFn;
}

async function pgLoad() {
  const q = await sql();
  const rows = await q`SELECT version, data FROM site_state WHERE id = 1`;
  if (!rows.length) {
    const fresh = initial();
    await q`INSERT INTO site_state (id, version, data) VALUES (1, 1, ${JSON.stringify(fresh)}::jsonb) ON CONFLICT (id) DO NOTHING`;
    return pgLoad();
  }
  if (rows[0].version === version && state) return;
  state = rows[0].data;
  version = rows[0].version;
  if (migrate(state)) await pgSave();
}

export class BusyError extends Error {}
async function pgSave() {
  const q = await sql();
  const rows = await q`UPDATE site_state SET data = ${JSON.stringify(state)}::jsonb, version = version + 1 WHERE id = 1 AND version = ${version} RETURNING version`;
  if (!rows.length) { state = null; throw new BusyError('busy'); } // someone else wrote first: reload next time
  version = rows[0].version;
}

// ---------- JSON file (local) ----------
function fileLoad() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    state = initial();
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
  } else {
    state = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (migrate(state)) fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
  }
}

/** Load (or refresh) the state before handling a request. */
export async function ready() {
  if (PG_URL) await pgLoad();
  else if (!state) fileLoad();
}

export function db() {
  if (!state) throw new Error('db not loaded');
  return state;
}

let writing = Promise.resolve();
export function save() {
  if (PG_URL) return pgSave();
  // Serialise writes so two requests never interleave a half-written file.
  const snapshot = JSON.stringify(state, null, 2);
  writing = writing.then(async () => {
    const tmp = DB_FILE + '.tmp';
    await fs.promises.writeFile(tmp, snapshot);
    await fs.promises.rename(tmp, DB_FILE);
  });
  return writing;
}

// One request at a time changes the state (per server), so a reload never lands mid-change.
let lock = Promise.resolve();
export function withLock(fn) {
  const run = lock.then(fn, fn);
  lock = run.catch(() => {});
  return run;
}
