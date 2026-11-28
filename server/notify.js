// Admin email notifications through Resend (https://resend.com).
// Needs RESEND_API_KEY and NOTIFY_EMAIL in .env; without them nothing is sent.
// A failed email never blocks a booking or an order: it is only logged.

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dh = (n) => `${Number(n).toLocaleString('fr-FR')} DH`;
const frDate = (iso) => new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso + 'T12:00:00'));
const waLink = (phone) => {
  let d = String(phone).replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  else if (d.startsWith('0')) d = '212' + d.slice(1);
  return `https://wa.me/${d}`;
};

// ---------- shared email design: logo header, gold line, details card, footer ----------
const SITE = (process.env.SITE_URL || 'https://tantouni.vercel.app').replace(/\/$/, '');
const NAVY = '#04235a';
const GOLD = '#e3b54b';

function shell({ rtl = false, kicker, title, intro = '', body, outro = '', footer }) {
  const align = rtl ? 'right' : 'left';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#eef2f7">
<div dir="${rtl ? 'rtl' : 'ltr'}" style="font-family:Arial,Helvetica,sans-serif;background:#eef2f7;padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border-collapse:separate;box-shadow:0 10px 30px rgba(4,35,90,.12)">
  <tr><td align="center" style="background-color:${NAVY};background-image:linear-gradient(180deg,#0a4fb0 0%,${NAVY} 55%,#010a1c 100%);padding:30px 24px 26px;border-radius:18px 18px 0 0">
    <a href="${SITE}" style="text-decoration:none"><img src="${SITE}/img/email-logo.png" width="210" alt="TANTOUNI" style="display:block;width:210px;max-width:70%;height:auto;border:0;margin:0 auto"></a>
    <div style="margin-top:10px;font-size:11px;letter-spacing:.28em;text-transform:uppercase;color:#bcd6ff">Omar Pêche Vlog</div>
  </td></tr>
  <tr><td style="height:4px;line-height:4px;font-size:0;background:${GOLD}">&nbsp;</td></tr>
  <tr><td style="padding:28px 28px 6px;text-align:${align}">
    <div style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#b08a2e;font-weight:bold">${kicker}</div>
    <div style="margin-top:6px;font-size:24px;line-height:1.25;color:${NAVY};font-weight:bold">${title}</div>
    ${intro ? `<div style="margin-top:12px;font-size:15px;line-height:1.6;color:#334155">${intro}</div>` : ''}
  </td></tr>
  <tr><td style="padding:16px 20px 6px">${body}</td></tr>
  ${outro ? `<tr><td style="padding:12px 28px 26px;font-size:15px;line-height:1.6;color:#334155;text-align:${align}">${outro}</td></tr>` : '<tr><td style="height:18px"></td></tr>'}
  <tr><td align="center" style="background:#010a1c;padding:18px 24px;font-size:12px;line-height:1.6;color:#8ea3c4;border-radius:0 0 18px 18px">
    ${footer}<br><a href="${SITE}" style="color:${GOLD};text-decoration:none">${SITE.replace(/^https?:\/\//, '')}</a>
  </td></tr>
</table></div></body></html>`;
}

// the reservation / order details, in a soft card
function detailsCard(rows, rtl = false) {
  const end = rtl ? 'left' : 'right';
  const list = rows.filter(([, v]) => v !== '' && v != null);
  const tr = list
    .map(([k, v], i) => {
      const line = i ? ';border-top:1px solid #e6ecf4' : '';
      return `<tr><td style="padding:12px 16px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#64748b;white-space:nowrap;vertical-align:middle${line}">${esc(k)}</td><td style="padding:12px 16px;font-size:15px;color:#0f172a;text-align:${end}${line}">${v}</td></tr>`;
    })
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fc;border:1px solid #e6ecf4;border-radius:14px;border-collapse:separate">${tr}</table>`;
}

const totalPill = (v) => `<span style="display:inline-block;background:${NAVY};color:${GOLD};font-weight:bold;font-size:16px;padding:6px 14px;border-radius:999px;white-space:nowrap">${v}</span>`;
const refTag = (v) => `<span style="display:inline-block;font-family:Consolas,Menlo,monospace;font-weight:bold;color:${NAVY};background:#fff4d6;border:1px solid #f0d58a;padding:3px 10px;border-radius:8px">${esc(v)}</span>`;

function layout(title, rows, extra = '', buttons = '') {
  return shell({
    kicker: 'Espace capitaine',
    title: esc(title),
    body: detailsCard(rows) + extra + buttons,
    footer: 'Notification automatique · TANTOUNI',
  });
}

// big WhatsApp / call buttons for the captain
const actions = (phone) => {
  const tel = esc(String(phone).replace(/[^\d+]/g, ''));
  const btn = (href, bg, label) => `<a href="${href}" style="display:inline-block;background:${bg};color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:999px;margin:6px 4px">${label}</a>`;
  return `<div style="text-align:center;padding:18px 0 4px">${btn(waLink(phone), '#16a34a', 'WhatsApp')}${btn('tel:' + tel, NAVY, 'Appeler')}</div>`;
};

const contact = (phone) => `<a href="tel:${esc(String(phone).replace(/[^\d+]/g, ''))}" style="color:#0f172a;text-decoration:none">${esc(phone)}</a>`;

async function send(subject, html) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // onboarding@resend.dev works without a domain, but only towards the Resend account's own email
        from: process.env.NOTIFY_FROM || 'TANTOUNI <onboarding@resend.dev>',
        to: to.split(',').map((x) => x.trim()).filter(Boolean),
        subject,
        html,
      }),
    });
    if (!r.ok) console.warn('[tantoni] email not sent:', r.status, await r.text());
  } catch (e) {
    console.warn('[tantoni] email not sent:', e.message);
  }
}

export function notifyReservation(r) {
  const family = r.formula === 'family';
  const subject = `Nouvelle réservation ${r.ref} · ${frDate(r.date)} · ${family ? 'Family vs Family' : `${r.people} pers.`}`;
  const html = layout('Nouvelle réservation', [
    ['Référence', refTag(r.ref)],
    ['Date', esc(frDate(r.date))],
    ['Formule', family ? 'Family vs Family (2 bateaux)' : 'Sortie standard'],
    ['Personnes', esc(r.people)],
    ['Bateaux', esc(r.allocation.map((a) => `Bateau ${a.boat} : ${a.seats} place(s)`).join(' · '))],
    ['Total', totalPill(dh(r.total))],
    ['Client', esc(r.name)],
    ['Téléphone', contact(r.phone)],
    ['Email', r.email ? `<a href="mailto:${esc(r.email)}" style="color:#1d4ed8">${esc(r.email)}</a>` : ''],
    ['Message', r.message ? esc(r.message) : ''],
  ], '', actions(r.phone));
  return send(subject, html);
}

export function notifyOrder(o) {
  const n = o.items.reduce((s, i) => s + i.qty, 0);
  const subject = `Nouvelle commande ${o.ref} · ${dh(o.total)} · ${n} article(s)`;
  const items = o.items
    .map((i) => `<tr><td style="padding:10px 12px;font-size:14px;color:#0f172a">${esc(i.qty)} × ${esc(i.name)}${i.size && i.size !== 'TU' ? ` · <b>${esc(i.size)}</b>` : ''}</td><td style="padding:10px 12px;font-size:14px;text-align:right;white-space:nowrap">${dh(i.price * i.qty)}</td></tr>`)
    .join('');
  const extra = `<div style="padding-top:14px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e6ecf4;border-radius:14px;border-collapse:separate">${items}
    <tr><td style="padding:12px;font-size:14px;border-top:1px solid #e6ecf4"><b>Total</b> <span style="color:#64748b">(paiement à la livraison)</span></td><td style="padding:12px;text-align:right;border-top:1px solid #e6ecf4">${totalPill(dh(o.total))}</td></tr></table></div>`;
  const html = layout('Nouvelle commande boutique', [
    ['Référence', refTag(o.ref)],
    ['Client', esc(o.name)],
    ['Téléphone', contact(o.phone)],
    ['Ville', esc(o.city)],
    ['Adresse', esc(o.address)],
    ['Email', o.email ? `<a href="mailto:${esc(o.email)}" style="color:#1d4ed8">${esc(o.email)}</a>` : ''],
    ['Note', o.note ? esc(o.note) : ''],
  ], extra, actions(o.phone));
  return send(subject, html);
}

// ---------- confirmation emails to the customer ----------
// Resend only delivers to other people's addresses from a verified domain,
// so these are sent only when NOTIFY_FROM is set (e.g. "TANTOUNI <reservations@tantouni.ma>").
const T = {
  fr: {
    kicker: 'Bien reçu', loc: 'fr-FR', hi: (n) => `Bonjour ${n},`,
    bSubject: (ref) => `Votre demande de réservation ${ref} · TANTOUNI`,
    bIntro: 'Merci ! Nous avons bien reçu votre demande de sortie en mer avec Omar Pêche Vlog.',
    bNext: 'Omar vous contacte très vite par téléphone ou WhatsApp pour confirmer votre place. Le paiement se fait sur place.',
    oSubject: (ref) => `Votre commande ${ref} · Boutique TANTOUNI`,
    oIntro: 'Merci pour votre commande dans la boutique officielle TANTOUNI !',
    oNext: 'Nous vous appelons pour confirmer la taille et la livraison. Paiement en espèces à la livraison.',
    ref: 'Référence', date: 'Date', people: 'Personnes', family: 'Formule', familyV: 'Family vs Family (2 bateaux privatisés)', total: 'Total',
    port: 'Départ', portV: 'Port de Mohammedia, 7h00', delivery: 'Livraison', size: 'Taille', bye: 'À très vite en mer,', team: "L'équipe TANTOUNI",
  },
  en: {
    kicker: 'Received', loc: 'en-GB', hi: (n) => `Hello ${n},`,
    bSubject: (ref) => `Your booking request ${ref} · TANTOUNI`,
    bIntro: 'Thank you! We have received your request for a fishing trip with Omar Pêche Vlog.',
    bNext: 'Omar will contact you very soon by phone or WhatsApp to confirm your seat. Payment is made on site.',
    oSubject: (ref) => `Your order ${ref} · TANTOUNI shop`,
    oIntro: 'Thank you for your order from the official TANTOUNI shop!',
    oNext: "We'll call you to confirm the size and delivery. Cash on delivery.",
    ref: 'Reference', date: 'Date', people: 'People', family: 'Package', familyV: 'Family vs Family (2 private boats)', total: 'Total',
    port: 'Departure', portV: 'Port of Mohammedia, 7:00 am', delivery: 'Delivery', size: 'Size', bye: 'See you soon at sea,', team: 'The TANTOUNI team',
  },
  ar: {
    kicker: 'تم الاستلام', loc: 'ar-MA', hi: (n) => `مرحبًا ${n}،`,
    bSubject: (ref) => `طلب حجزك ${ref} · TANTOUNI`,
    bIntro: 'شكرًا! توصلنا بطلب رحلة الصيد مع Omar Pêche Vlog.',
    bNext: 'سيتصل بك عمر قريبًا جدًا عبر الهاتف أو واتساب لتأكيد مكانك. الدفع يتم في عين المكان.',
    oSubject: (ref) => `طلبك ${ref} · متجر TANTOUNI`,
    oIntro: 'شكرًا على طلبك من المتجر الرسمي TANTOUNI!',
    oNext: 'سنتصل بك لتأكيد المقاس والتوصيل. الدفع نقدًا عند الاستلام.',
    ref: 'المرجع', date: 'التاريخ', people: 'عدد الأشخاص', family: 'العرض', familyV: 'عائلة ضد عائلة (قاربان خاصان)', total: 'المجموع',
    port: 'الانطلاق', portV: 'ميناء المحمدية، الساعة 7:00', delivery: 'التوصيل', size: 'المقاس', bye: 'إلى اللقاء قريبًا في البحر،', team: 'فريق TANTOUNI',
  },
  es: {
    kicker: 'Recibido', loc: 'es-ES', hi: (n) => `Hola ${n}:`,
    bSubject: (ref) => `Tu solicitud de reserva ${ref} · TANTOUNI`,
    bIntro: '¡Gracias! Hemos recibido tu solicitud de salida de pesca con Omar Pêche Vlog.',
    bNext: 'Omar te contactará muy pronto por teléfono o WhatsApp para confirmar tu plaza. El pago se hace en el lugar.',
    oSubject: (ref) => `Tu pedido ${ref} · Tienda TANTOUNI`,
    oIntro: '¡Gracias por tu pedido en la tienda oficial TANTOUNI!',
    oNext: 'Te llamaremos para confirmar la talla y el envío. Pago en efectivo a la entrega.',
    ref: 'Referencia', date: 'Fecha', people: 'Personas', family: 'Fórmula', familyV: 'Family vs Family (2 barcos privados)', total: 'Total',
    port: 'Salida', portV: 'Puerto de Mohammedia, 7:00', delivery: 'Envío', size: 'Talla', bye: '¡Hasta pronto en el mar!', team: 'El equipo TANTOUNI',
  },
  it: {
    kicker: 'Ricevuto', loc: 'it-IT', hi: (n) => `Ciao ${n},`,
    bSubject: (ref) => `La tua richiesta di prenotazione ${ref} · TANTOUNI`,
    bIntro: 'Grazie! Abbiamo ricevuto la tua richiesta di uscita di pesca con Omar Pêche Vlog.',
    bNext: 'Omar ti contatterà prestissimo per telefono o WhatsApp per confermare il tuo posto. Il pagamento si fa sul posto.',
    oSubject: (ref) => `Il tuo ordine ${ref} · Shop TANTOUNI`,
    oIntro: 'Grazie per il tuo ordine dallo shop ufficiale TANTOUNI!',
    oNext: 'Ti chiameremo per confermare taglia e consegna. Pagamento in contanti alla consegna.',
    ref: 'Riferimento', date: 'Data', people: 'Persone', family: 'Formula', familyV: 'Family vs Family (2 barche private)', total: 'Totale',
    port: 'Partenza', portV: 'Porto di Mohammedia, ore 7:00', delivery: 'Consegna', size: 'Taglia', bye: 'A presto in mare,', team: 'Il team TANTOUNI',
  },
};
const tr = (lang) => T[lang] || T.fr;

function customerLayout(t, rtl, intro, rows, extra, next) {
  return shell({
    rtl,
    kicker: esc(t.kicker),
    title: intro.title,
    intro: intro.text,
    body: detailsCard(rows, rtl) + extra,
    outro: `${next}<br><br>${esc(t.bye)}<br><b style="color:${NAVY}">${esc(t.team)}</b>`,
    footer: 'TANTOUNI · Omar Pêche Vlog · Port de Mohammedia',
  });
}

async function sendTo(to, subject, html) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM;
  if (!key || !from || !to) return; // customer emails need a verified sending domain
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, html, reply_to: process.env.NOTIFY_EMAIL?.split(',')[0]?.trim() || undefined }),
    });
    if (!r.ok) console.warn('[tantoni] customer email not sent:', r.status, await r.text());
  } catch (e) {
    console.warn('[tantoni] customer email not sent:', e.message);
  }
}

export function confirmReservation(r) {
  if (!r.email) return;
  const t = tr(r.lang);
  const date = new Intl.DateTimeFormat(t.loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(r.date + 'T12:00:00'));
  const html = customerLayout(t, r.lang === 'ar', { title: esc(t.hi(r.name)), text: esc(t.bIntro) }, [
    [t.ref, refTag(r.ref)],
    [t.date, esc(date)],
    [t.people, esc(r.people)],
    [t.family, r.formula === 'family' ? esc(t.familyV) : ''],
    [t.port, esc(t.portV)],
    [t.total, totalPill(dh(r.total))],
  ], '', esc(t.bNext));
  return sendTo(r.email, t.bSubject(r.ref), html);
}

export function confirmOrder(o) {
  if (!o.email) return;
  const t = tr(o.lang);
  const end = o.lang === 'ar' ? 'left' : 'right';
  const items = o.items
    .map((i) => `<tr><td style="padding:10px 12px;font-size:14px;color:#0f172a">${esc(i.qty)} × ${esc(i.name)}${i.size && i.size !== 'TU' ? ` · ${esc(t.size)} <b>${esc(i.size)}</b>` : ''}</td><td style="padding:10px 12px;font-size:14px;text-align:${end};white-space:nowrap">${dh(i.price * i.qty)}</td></tr>`)
    .join('');
  const extra = `<div style="padding-top:14px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e6ecf4;border-radius:14px;border-collapse:separate">${items}
    <tr><td style="padding:12px;font-size:14px;border-top:1px solid #e6ecf4"><b>${esc(t.total)}</b></td><td style="padding:12px;text-align:${end};border-top:1px solid #e6ecf4">${totalPill(dh(o.total))}</td></tr></table></div>`;
  const html = customerLayout(t, o.lang === 'ar', { title: esc(t.hi(o.name)), text: esc(t.oIntro) }, [
    [t.ref, refTag(o.ref)],
    [t.delivery, `${esc(o.city)} - ${esc(o.address)}`],
  ], extra, esc(t.oNext));
  return sendTo(o.email, t.oSubject(o.ref), html);
}
