import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, load, save } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.API_PORT || 3001);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SECRET = process.env.ADMIN_SECRET || crypto.randomBytes(32).toString('hex');

export const PRICE_PER_PERSON = 1000; // MAD
export const BOATS = 2;
export const SEATS_PER_BOAT = 5;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12;
// Boats leave at 7:00 (Casablanca time): today stays bookable until then.
const DEPARTURE_HOUR = 7;

if (!ADMIN_PASSWORD) {
  console.warn('[tantoni] ADMIN_PASSWORD is not set in .env - admin login is disabled.');
}

load();
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));

// ---------- helpers ----------
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const todayCasa = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Casablanca' }).format(new Date());

const hourCasa = () =>
  Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Casablanca', hour: '2-digit', hourCycle: 'h23' }).format(new Date()));
const addDays = (iso, n) => {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
/** First date a customer can still book: today before departure, otherwise tomorrow. */
const firstBookable = () => (hourCasa() < DEPARTURE_HOUR ? todayCasa() : addDays(todayCasa(), 1));

const active = (r) => r.status !== 'cancelled';

function boatLoads(date, excludeId) {
  const loads = Array(BOATS).fill(0);
  for (const r of db().reservations) {
    if (r.date !== date || !active(r) || r.id === excludeId) continue;
    for (const a of r.allocation) loads[a.boat - 1] += a.seats;
  }
  return loads;
}

// Keep groups together on one boat whenever possible (best fit, so the emptier
// boat stays free for a bigger group); otherwise split across both boats.
function allocate(date, people, excludeId) {
  const left = boatLoads(date, excludeId).map((l) => SEATS_PER_BOAT - l);
  const total = left.reduce((a, b) => a + b, 0);
  if (people > total) return null;
  const fits = left
    .map((l, i) => ({ l, i }))
    .filter((b) => b.l >= people)
    .sort((a, b) => a.l - b.l);
  if (fits.length) return [{ boat: fits[0].i + 1, seats: people }];
  const out = [];
  let rest = people;
  for (const b of left.map((l, i) => ({ l, i })).sort((a, b) => b.l - a.l)) {
    if (!rest) break;
    const take = Math.min(b.l, rest);
    if (take) out.push({ boat: b.i + 1, seats: take });
    rest -= take;
  }
  return out;
}

const isBlocked = (date) => db().blockedDays.find((b) => b.date === date);

function signToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token = '') {
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now();
  } catch {
    return false;
  }
}

function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  if (!verifyToken(token)) return res.status(401).json({ error: 'unauthorized' });
  next();
}

const clean = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// ---------- public ----------
app.get('/api/config', (_req, res) => {
  res.json({ price: PRICE_PER_PERSON, boats: BOATS, seatsPerBoat: SEATS_PER_BOAT, today: todayCasa() });
});

app.get('/api/availability', (req, res) => {
  const { from, to } = req.query;
  if (!DATE_RE.test(from) || !DATE_RE.test(to)) return res.status(400).json({ error: 'bad_range' });
  const days = {};
  const d = new Date(from + 'T00:00:00Z');
  const end = new Date(to + 'T00:00:00Z');
  for (let i = 0; d <= end && i < 120; i++, d.setUTCDate(d.getUTCDate() + 1)) {
    const date = d.toISOString().slice(0, 10);
    const loads = boatLoads(date);
    const blocked = isBlocked(date);
    days[date] = {
      blocked: Boolean(blocked),
      weather: blocked?.type === 'weather',
      boatsLeft: loads.map((l) => SEATS_PER_BOAT - l),
      left: blocked ? 0 : loads.reduce((a, l) => a + (SEATS_PER_BOAT - l), 0),
    };
  }
  res.json({ today: todayCasa(), firstBookable: firstBookable(), days });
});

const STATUSES = ['pending', 'confirmed', 'paid', 'cancelled'];

// Validates and stores a booking. Admin bookings may use any date (walk-ins,
// past trips to record) and any status, but boat capacity is always enforced.
async function createReservation(body, { admin = false } = {}) {
  const name = clean(body.name, 120);
  const phone = clean(body.phone, 40);
  const email = clean(body.email, 160);
  const message = clean(body.message, 1000);
  const date = clean(body.date, 10);
  const people = Number(body.people);

  if (!name || !phone) return { error: 'missing_fields', code: 400 };
  if (!DATE_RE.test(date) || (!admin && date < firstBookable())) return { error: 'bad_date', code: 400 };
  if (!Number.isInteger(people) || people < 1 || people > BOATS * SEATS_PER_BOAT) return { error: 'bad_people', code: 400 };
  if (!admin && isBlocked(date)) return { error: 'day_blocked', code: 409 };

  const allocation = allocate(date, people);
  if (!allocation) return { error: 'not_enough_seats', code: 409 };

  const reservation = {
    id: crypto.randomUUID(),
    ref: 'TAN-' + crypto.randomBytes(3).toString('hex').toUpperCase(),
    name, phone, email, message, date, people,
    lang: clean(body.lang, 5) || 'fr',
    allocation,
    total: people * PRICE_PER_PERSON,
    status: admin && STATUSES.includes(body.status) ? body.status : 'pending',
    source: admin ? 'admin' : 'site',
    createdAt: new Date().toISOString(),
  };
  db().reservations.push(reservation);
  await save();
  return { reservation };
}

app.post('/api/reservations', async (req, res) => {
  const { error, code, reservation: r } = await createReservation(req.body);
  if (error) return res.status(code).json({ error });
  res.status(201).json({ ref: r.ref, date: r.date, people: r.people, total: r.total, allocation: r.allocation });
});

app.get('/api/fish', (_req, res) => {
  res.json([...db().fish].sort((a, b) => a.order - b.order));
});

const byDateDesc = (a, b) => (b.date || '').localeCompare(a.date || '');
app.get('/api/achievements', (_req, res) => {
  res.json([...db().achievements].sort(byDateDesc));
});

// ---------- admin ----------
app.post('/api/admin/login', (req, res) => {
  const pw = String(req.body.password || '');
  if (!ADMIN_PASSWORD) return res.status(503).json({ error: 'admin_disabled' });
  const a = crypto.createHash('sha256').update(pw).digest();
  const b = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
  if (!crypto.timingSafeEqual(a, b)) return res.status(401).json({ error: 'bad_password' });
  res.json({ token: signToken() });
});

app.use('/api/admin', requireAdmin);

app.get('/api/admin/reservations', (_req, res) => {
  res.json([...db().reservations].sort((a, b) => (a.date === b.date ? a.createdAt.localeCompare(b.createdAt) : a.date.localeCompare(b.date))));
});

app.post('/api/admin/reservations', async (req, res) => {
  const { error, code, reservation } = await createReservation(req.body, { admin: true });
  if (error) return res.status(code).json({ error });
  res.status(201).json(reservation);
});

app.patch('/api/admin/reservations/:id', async (req, res) => {
  const r = db().reservations.find((x) => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'not_found' });
  const { status, adminNotes } = req.body;
  if (status && !STATUSES.includes(status)) return res.status(400).json({ error: 'bad_status' });
  if (status && r.status === 'cancelled' && status !== 'cancelled') {
    const allocation = allocate(r.date, r.people, r.id);
    if (!allocation) return res.status(409).json({ error: 'not_enough_seats' });
    r.allocation = allocation;
  }
  if (status) r.status = status;
  if (typeof adminNotes === 'string') r.adminNotes = clean(adminNotes, 1000);
  await save();
  res.json(r);
});

app.delete('/api/admin/reservations/:id', async (req, res) => {
  const list = db().reservations;
  const i = list.findIndex((x) => x.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'not_found' });
  list.splice(i, 1);
  await save();
  res.status(204).end();
});

app.get('/api/admin/blocked', (_req, res) => res.json(db().blockedDays));

app.post('/api/admin/blocked', async (req, res) => {
  const date = clean(req.body.date, 10);
  if (!DATE_RE.test(date)) return res.status(400).json({ error: 'bad_date' });
  const type = req.body.type === 'weather' ? 'weather' : 'blocked';
  const existing = isBlocked(date);
  if (existing) Object.assign(existing, { type, reason: clean(req.body.reason, 200) || existing.reason });
  else db().blockedDays.push({ date, type, reason: clean(req.body.reason, 200) });
  await save();
  const affected = db().reservations.filter((r) => r.date === date && active(r)).length;
  res.status(201).json({ date, affected });
});

app.delete('/api/admin/blocked/:date', async (req, res) => {
  db().blockedDays = db().blockedDays.filter((b) => b.date !== req.params.date);
  await save();
  res.status(204).end();
});

const FISH_FIELDS = ['slug', 'names', 'nickname', 'scientific', 'maxLength', 'maxWeight', 'depth', 'habitat', 'techniques',
  'season', 'description', 'caught', 'catch', 'youtube', 'image', 'art', 'rarity', 'zone', 'order'];

function pickFish(body) {
  const out = {};
  for (const k of FISH_FIELDS) if (k in body) out[k] = body[k];
  return out;
}

app.post('/api/admin/fish', async (req, res) => {
  const data = pickFish(req.body);
  if (!data.names?.fr) return res.status(400).json({ error: 'missing_name' });
  const slug = (data.slug || data.names.fr).toLowerCase().normalize('NFD').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
  const fish = {
    caught: false,
    catch: { date: '', weight: '', length: '', location: '', notes: '' },
    youtube: '', image: '', habitat: [], techniques: [], season: [],
    description: { fr: '', en: '' },
    art: { shape: 'tuna', back: '#13315c', belly: '#e6edf3', fin: '#1d4f91', accent: '#5aa0e6' },
    rarity: 'common', zone: 'maroc',
    ...data,
    slug,
    id: `${slug}-${Date.now().toString(36)}`,
    order: data.order ?? Math.max(-1, ...db().fish.map((f) => f.order)) + 1,
  };
  db().fish.push(fish);
  await save();
  res.status(201).json(fish);
});

app.put('/api/admin/fish/:id', async (req, res) => {
  const fish = db().fish.find((f) => f.id === req.params.id);
  if (!fish) return res.status(404).json({ error: 'not_found' });
  Object.assign(fish, pickFish(req.body));
  await save();
  res.json(fish);
});

app.delete('/api/admin/fish/:id', async (req, res) => {
  const before = db().fish.length;
  db().fish = db().fish.filter((f) => f.id !== req.params.id);
  if (db().fish.length === before) return res.status(404).json({ error: 'not_found' });
  await save();
  res.status(204).end();
});

const ACH_FIELDS = ['date', 'place', 'award', 'title', 'location', 'organizer', 'description', 'photos', 'video'];
const pickAch = (body) => Object.fromEntries(ACH_FIELDS.filter((k) => k in body).map((k) => [k, body[k]]));

app.post('/api/admin/achievements', async (req, res) => {
  const data = pickAch(req.body);
  if (!data.title?.fr) return res.status(400).json({ error: 'missing_title' });
  const a = { place: null, award: {}, location: '', organizer: '', description: {}, photos: [], video: '', date: '', ...data, id: crypto.randomUUID() };
  db().achievements.push(a);
  await save();
  res.status(201).json(a);
});

app.put('/api/admin/achievements/:id', async (req, res) => {
  const a = db().achievements.find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: 'not_found' });
  Object.assign(a, pickAch(req.body));
  await save();
  res.json(a);
});

app.delete('/api/admin/achievements/:id', async (req, res) => {
  const before = db().achievements.length;
  db().achievements = db().achievements.filter((x) => x.id !== req.params.id);
  if (db().achievements.length === before) return res.status(404).json({ error: 'not_found' });
  await save();
  res.status(204).end();
});

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => cb(null, `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(png|jpe?g|webp|avif)$/.test(file.mimetype)),
});

app.post('/api/admin/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'bad_file' });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

// ---------- production: serve the built site ----------
const DIST = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get('/{*splat}', (req, res, next) => (req.path.startsWith('/api') ? next() : res.sendFile(path.join(DIST, 'index.html'))));
}

app.listen(PORT, () => console.log(`[tantoni] API on http://localhost:${PORT}`));
