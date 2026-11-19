import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BusyError, db, ready, save, withLock } from './db.js';
import { confirmOrder, confirmReservation, notifyOrder, notifyReservation } from './notify.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.API_PORT || 3001);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ON_VERCEL = Boolean(process.env.VERCEL);
// Sessions must survive across Vercel's many short-lived servers, so the secret can't be random there.
const SECRET = process.env.ADMIN_SECRET
  || (ON_VERCEL ? crypto.createHash('sha256').update(`tantoni:${ADMIN_PASSWORD}`).digest('hex') : crypto.randomBytes(32).toString('hex'));

export const PRICE_PER_PERSON = 1000; // MAD
export const BOATS = 2;
export const SEATS_PER_BOAT = 5;
// "Family vs Family": both boats privatised for one day, flat price.
export const FAMILY_PRICE = 10000;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12;
// Boats leave at 7:00 (Casablanca time): today stays bookable until then.
const DEPARTURE_HOUR = 7;

if (!ADMIN_PASSWORD) {
  console.warn('[tantoni] ADMIN_PASSWORD is not set in .env - admin login is disabled.');
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!ON_VERCEL) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));

// Load the latest data before each API call. Changes run one at a time, so a refresh never lands mid-change.
app.use('/api', (req, res, next) => {
  if (req.method === 'GET') return ready().then(() => next(), next);
  withLock(() => new Promise((done) => {
    res.on('finish', done);
    res.on('close', done);
    ready().then(() => next(), (e) => { done(); next(e); });
  }));
});

// On Vercel the server may be frozen right after answering, so emails are sent before replying there.
const background = (...jobs) => {
  const all = Promise.allSettled(jobs.map((j) => Promise.resolve(j)));
  return ON_VERCEL ? Promise.race([all, new Promise((r) => setTimeout(r, 6000))]) : null;
};

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
  res.json({ price: PRICE_PER_PERSON, familyPrice: FAMILY_PRICE, boats: BOATS, seatsPerBoat: SEATS_PER_BOAT, today: todayCasa() });
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
      familyOk: !blocked && loads.every((l) => l === 0),
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
  const family = body.formula === 'family';
  const people = family ? BOATS * SEATS_PER_BOAT : Number(body.people);

  if (!name || !phone) return { error: 'missing_fields', code: 400 };
  if (!DATE_RE.test(date) || (!admin && date < firstBookable())) return { error: 'bad_date', code: 400 };
  if (!Number.isInteger(people) || people < 1 || people > BOATS * SEATS_PER_BOAT) return { error: 'bad_people', code: 400 };
  if (!admin && isBlocked(date)) return { error: 'day_blocked', code: 409 };

  let allocation;
  if (family) {
    // both boats must be completely free that day
    if (boatLoads(date).some((l) => l > 0)) return { error: 'family_unavailable', code: 409 };
    allocation = Array.from({ length: BOATS }, (_, i) => ({ boat: i + 1, seats: SEATS_PER_BOAT }));
  } else {
    allocation = allocate(date, people);
    if (!allocation) return { error: 'not_enough_seats', code: 409 };
  }

  const reservation = {
    id: crypto.randomUUID(),
    ref: 'TAN-' + crypto.randomBytes(3).toString('hex').toUpperCase(),
    name, phone, email, message, date, people,
    lang: clean(body.lang, 5) || 'fr',
    allocation,
    formula: family ? 'family' : 'standard',
    total: family ? FAMILY_PRICE : people * PRICE_PER_PERSON,
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
  await background(notifyReservation(r), confirmReservation(r));
  res.status(201).json({ ref: r.ref, date: r.date, people: r.people, total: r.total, formula: r.formula, allocation: r.allocation });
});

app.get('/api/fish', (_req, res) => {
  res.json([...db().fish].sort((a, b) => a.order - b.order));
});

const byDateDesc = (a, b) => (b.date || '').localeCompare(a.date || '');
app.get('/api/achievements', (_req, res) => {
  res.json([...db().achievements].sort(byDateDesc));
});

// ---------- shop ----------
app.get('/api/products', (_req, res) => {
  res.json([...db().products].sort((a, b) => a.order - b.order));
});

const ORDER_STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];

// Prices always come from the catalog, never from the browser.
app.post('/api/orders', async (req, res) => {
  const name = clean(req.body.name, 120);
  const phone = clean(req.body.phone, 40);
  const city = clean(req.body.city, 80);
  const address = clean(req.body.address, 300);
  const note = clean(req.body.note, 1000);
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(req.body.email, 160)) ? clean(req.body.email, 160) : '';
  if (!name || !phone || !city || !address) return res.status(400).json({ error: 'missing_fields' });
  const raw = Array.isArray(req.body.items) ? req.body.items.slice(0, 30) : [];
  const items = [];
  for (const it of raw) {
    const p = db().products.find((x) => x.id === it?.id);
    const qty = Number(it?.qty);
    if (!p || p.soldOut || !Number.isInteger(qty) || qty < 1 || qty > 20) return res.status(400).json({ error: 'bad_items' });
    const size = clean(it.size, 10);
    if (p.sizes?.length && !p.sizes.includes(size)) return res.status(400).json({ error: 'bad_items' });
    items.push({ productId: p.id, name: p.name?.fr || p.slug, size, qty, price: p.price, image: p.images?.[0] || '' });
  }
  if (!items.length) return res.status(400).json({ error: 'bad_items' });
  const order = {
    id: crypto.randomUUID(),
    ref: 'TSH-' + crypto.randomBytes(3).toString('hex').toUpperCase(),
    name, phone, email, city, address, note,
    lang: clean(req.body.lang, 5) || 'fr',
    items,
    total: items.reduce((s, i) => s + i.price * i.qty, 0),
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  db().orders.push(order);
  await save();
  await background(notifyOrder(order), confirmOrder(order));
  res.status(201).json({ ref: order.ref, total: order.total });
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

// ---------- sea & weather forecast (Open-Meteo: free, no key) ----------
// Points just offshore, where the boats fish. Only these coordinates are sent.
const SPOTS = {
  mohammedia: { lat: 33.74, lon: -7.45 },
  rabat: { lat: 34.06, lon: -6.88 },
};
const seaCache = new Map(); // spot -> { at, data }
const SEA_TTL_MS = 30 * 60 * 1000;

async function seaForecast(spot) {
  const { lat, lon } = SPOTS[spot];
  const tz = 'timezone=Africa%2FCasablanca&forecast_days=7';
  const [marine, weather] = await Promise.all([
    fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&daily=wave_height_max,wave_period_max,wave_direction_dominant,swell_wave_height_max&${tz}`).then((r) => r.json()),
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&wind_speed_unit=kmh&${tz}`).then((r) => r.json()),
  ]);
  const m = marine.daily, w = weather.daily;
  if (!m?.time || !w?.time) throw new Error('bad_forecast');
  return m.time.map((date, i) => {
    const j = w.time.indexOf(date);
    return {
      date,
      wave: m.wave_height_max[i], period: m.wave_period_max[i], waveDir: m.wave_direction_dominant[i], swell: m.swell_wave_height_max[i],
      wind: j >= 0 ? w.wind_speed_10m_max[j] : null, gust: j >= 0 ? w.wind_gusts_10m_max[j] : null,
      windDir: j >= 0 ? w.wind_direction_10m_dominant[j] : null, code: j >= 0 ? w.weather_code[j] : null,
      temp: j >= 0 ? w.temperature_2m_max[j] : null, rain: j >= 0 ? w.precipitation_sum[j] : null,
    };
  });
}

app.get('/api/admin/sea', async (req, res) => {
  const spot = SPOTS[req.query.spot] ? req.query.spot : 'mohammedia';
  const hit = seaCache.get(spot);
  if (hit && Date.now() - hit.at < SEA_TTL_MS) return res.json({ spot, updated: hit.at, days: hit.data });
  try {
    const data = await seaForecast(spot);
    seaCache.set(spot, { at: Date.now(), data });
    res.json({ spot, updated: Date.now(), days: data });
  } catch {
    if (hit) return res.json({ spot, updated: hit.at, days: hit.data, stale: true });
    res.status(502).json({ error: 'forecast_unavailable' });
  }
});

app.delete('/api/admin/blocked/:date', async (req, res) => {
  db().blockedDays = db().blockedDays.filter((b) => b.date !== req.params.date);
  await save();
  res.status(204).end();
});

const FISH_FIELDS = ['slug', 'names', 'nickname', 'scientific', 'maxLength', 'maxWeight', 'depth', 'habitat', 'techniques',
  'season', 'description', 'caught', 'catch', 'youtube', 'image', 'art', 'rarity', 'zone', 'order', 'seas', 'group', 'bait', 'range', 'credit'];

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

const ACH_FIELDS = ['date', 'place', 'award', 'title', 'location', 'organizer', 'description', 'photos', 'video', 'trophies', 'champion'];
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

const PRODUCT_FIELDS = ['slug', 'category', 'name', 'description', 'price', 'oldPrice', 'images', 'sizes', 'badge', 'soldOut', 'fit', 'focus', 'order'];
const pickProduct = (body) => Object.fromEntries(PRODUCT_FIELDS.filter((k) => k in body).map((k) => [k, body[k]]));

app.post('/api/admin/products', async (req, res) => {
  const data = pickProduct(req.body);
  if (!data.name?.fr) return res.status(400).json({ error: 'missing_name' });
  const slug = String(data.slug || data.name.fr).toLowerCase().normalize('NFD').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
  const p = {
    category: 'hoodie', description: {}, price: 0, oldPrice: null, images: [], sizes: [], badge: {}, soldOut: false, fit: 'contain',
    ...data,
    slug,
    id: `${slug}-${Date.now().toString(36)}`,
    order: data.order ?? Math.max(-1, ...db().products.map((x) => x.order)) + 1,
  };
  db().products.push(p);
  await save();
  res.status(201).json(p);
});

app.put('/api/admin/products/:id', async (req, res) => {
  const p = db().products.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'not_found' });
  Object.assign(p, pickProduct(req.body));
  await save();
  res.json(p);
});

app.delete('/api/admin/products/:id', async (req, res) => {
  const before = db().products.length;
  db().products = db().products.filter((x) => x.id !== req.params.id);
  if (db().products.length === before) return res.status(404).json({ error: 'not_found' });
  await save();
  res.status(204).end();
});

app.get('/api/admin/orders', (_req, res) => {
  res.json([...db().orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
});

app.patch('/api/admin/orders/:id', async (req, res) => {
  const o = db().orders.find((x) => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: 'not_found' });
  const { status, adminNotes } = req.body;
  if (status && !ORDER_STATUSES.includes(status)) return res.status(400).json({ error: 'bad_status' });
  if (status) o.status = status;
  if (typeof adminNotes === 'string') o.adminNotes = clean(adminNotes, 1000);
  await save();
  res.json(o);
});

app.delete('/api/admin/orders/:id', async (req, res) => {
  const before = db().orders.length;
  db().orders = db().orders.filter((x) => x.id !== req.params.id);
  if (db().orders.length === before) return res.status(404).json({ error: 'not_found' });
  await save();
  res.status(204).end();
});

// Uploads go to Vercel Blob when it's connected (BLOB_READ_WRITE_TOKEN), otherwise to server/uploads.
const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const fileName = (original) => `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}${path.extname(original).toLowerCase()}`;
const upload = multer({
  storage: USE_BLOB ? multer.memoryStorage() : multer.diskStorage({ destination: UPLOAD_DIR, filename: (_req, file, cb) => cb(null, fileName(file.originalname)) }),
  // Vercel accepts requests up to 4.5 MB
  limits: { fileSize: (ON_VERCEL ? 4 : 10) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, /^image\/(png|jpe?g|webp|avif)$/.test(file.mimetype)),
});

app.post('/api/admin/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'bad_file' });
  if (!USE_BLOB) return res.status(201).json({ url: `/uploads/${req.file.filename}` });
  const { put } = await import('@vercel/blob');
  const blob = await put(`uploads/${fileName(req.file.originalname)}`, req.file.buffer, { access: 'public', contentType: req.file.mimetype });
  res.status(201).json({ url: blob.url });
});

// ---------- production: serve the built site ----------
const DIST = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  app.get('/{*splat}', (req, res, next) => (req.path.startsWith('/api') ? next() : res.sendFile(path.join(DIST, 'index.html'))));
}

// Two admins saving at the very same moment: the second one is asked to retry.
app.use((err, _req, res, _next) => {
  if (err instanceof BusyError) return res.status(409).json({ error: 'busy' });
  if (err?.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'file_too_large' });
  console.error('[tantoni]', err);
  res.status(500).json({ error: 'server_error' });
});

if (!ON_VERCEL) app.listen(PORT, () => console.log(`[tantoni] API on http://localhost:${PORT}`));
export default app;
