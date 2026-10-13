// Tiny JSON-file database. Good enough for one captain, two boats and a few
// hundred bookings a year; swap for Postgres/SQLite later without touching routes.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedAchievements, seedFish } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function initial() {
  return {
    reservations: [],
    blockedDays: [], // [{ date: 'YYYY-MM-DD', reason }]
    fish: seedFish(),
    achievements: seedAchievements(),
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
    if (!state.achievements) {
      state.achievements = seedAchievements();
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
    }
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
