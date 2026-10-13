# TANTOUNI · Omar Pêche Vlog

Booking site for fishing trips with **Omar Pêche Vlog** (Mohammedia, Morocco), plus the
**Tableau de chasse**: every species Omar has caught gets its red X.

- French by default, with an FR / EN / العربية (RTL) / ES / IT switcher
- 1000 DH per person · 2 boats · 5 anglers per boat (10 per day)
- Captain's area at `/admin`: bookings, blocked days, and full fish management

## Run it

```bash
npm install
npm run dev        # API on :3001 + site on http://localhost:5173
```

Production:

```bash
npm run build
npm start          # one Node process serves the API and the built site on API_PORT
```

## Admin

- URL: `/admin` (link "Espace capitaine" in the footer)
- The password is `ADMIN_PASSWORD` in `.env` (see `.env.example`). Change it before going live,
  and set a long random `ADMIN_SECRET`.
- **Réservations**: upcoming/past, change status (pending / confirmed / cancelled), WhatsApp link,
  per-day load for each boat, revenue.
- **Disponibilités**: click a day to block or unblock it, or block a whole date range (trips, tournaments).
  Customers can no longer book blocked days.
- **Tableau de chasse**: tick "Capturé" (the X appears on the site), add / edit / delete / reorder species,
  names in 5 languages, YouTube link of the catch video, catch details, and photo upload.

### Fish photos

Upload a PNG with a **transparent background**, fish **in profile, head on the left**. Any image swims:
the site slices it into strips and animates a wave running from head to tail. Until a photo is uploaded,
each species uses a generated illustration (silhouette and colours editable in the admin).

## Where to change things

| What | File |
| --- | --- |
| Price, boats, port, social links, home-page videos, WhatsApp number | `src/lib/site.ts` (+ `PRICE_PER_PERSON`, `BOATS`, `SEATS_PER_BOAT` in `server/index.js`) |
| Every text in all 5 languages | `src/i18n/locales.ts` |
| Starting species list (only used to create the database) | `server/seed.js` |
| Data (bookings, blocked days, fish) | `server/data/db.json` (back up this file!) |
| Uploaded photos | `server/uploads/` |

## Animation and 3D stack

| Library | Used for |
| --- | --- |
| three + @react-three/fiber | Home hero: real-time ocean shader (waves, sun glitter, sky with clouds) |
| @react-three/drei | Bubbles (Sparkles) around the fish in the detail view |
| @react-three/postprocessing | Bloom + vignette on the ocean |
| Custom R3F shader | Detail view: the fish bends and swims in 3D and follows the mouse |
| gsap + ScrollTrigger + @gsap/react | Hero intro, scroll parallax (sunglasses, "Season of giants" banner), counters |
| motion (Framer Motion) | Modals, filters, layout animations, 3D tilt cards, language menu |
| lenis | Smooth scrolling |

## Hosting notes

The database is a JSON file, so host on something with a **persistent disk** (VPS, Railway/Render with
a volume, etc.), not on a serverless platform. To swap in Postgres/SQLite later, only `server/db.js`
and the routes in `server/index.js` change.
