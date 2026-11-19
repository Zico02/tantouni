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

function layout(title, rows, extra = '') {
  const tr = rows
    .filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => `<tr><td style="padding:8px 12px;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:8px 12px;font-size:14px;color:#0f172a">${v}</td></tr>`)
    .join('');
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:#04235a;color:#fff;padding:18px 22px;font-size:18px;font-weight:bold">TANTOUNI · ${esc(title)}</div>
    <table style="width:100%;border-collapse:collapse;margin:8px 0">${tr}</table>
    ${extra}
    <div style="padding:14px 22px;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0">Notification automatique · espace capitaine</div>
  </div></div>`;
}

const contact = (phone) =>
  `${esc(phone)} &nbsp;·&nbsp; <a href="${waLink(phone)}" style="color:#16a34a">WhatsApp</a> &nbsp;·&nbsp; <a href="tel:${esc(String(phone).replace(/[^\d+]/g, ''))}" style="color:#1d4ed8">Appeler</a>`;

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
    ['Référence', `<b>${esc(r.ref)}</b>`],
    ['Date', esc(frDate(r.date))],
    ['Formule', family ? 'Family vs Family (2 bateaux)' : 'Sortie standard'],
    ['Personnes', esc(r.people)],
    ['Bateaux', esc(r.allocation.map((a) => `Bateau ${a.boat} : ${a.seats} place(s)`).join(' · '))],
    ['Total', `<b>${dh(r.total)}</b>`],
    ['Client', esc(r.name)],
    ['Téléphone', contact(r.phone)],
    ['Email', r.email ? `<a href="mailto:${esc(r.email)}">${esc(r.email)}</a>` : ''],
    ['Message', r.message ? esc(r.message) : ''],
  ]);
  return send(subject, html);
}

export function notifyOrder(o) {
  const n = o.items.reduce((s, i) => s + i.qty, 0);
  const subject = `Nouvelle commande ${o.ref} · ${dh(o.total)} · ${n} article(s)`;
  const items = o.items
    .map((i) => `<tr><td style="padding:6px 12px;font-size:14px">${esc(i.qty)} × ${esc(i.name)}${i.size && i.size !== 'TU' ? ` · <b>${esc(i.size)}</b>` : ''}</td><td style="padding:6px 12px;font-size:14px;text-align:right;white-space:nowrap">${dh(i.price * i.qty)}</td></tr>`)
    .join('');
  const extra = `<div style="padding:4px 10px 12px"><table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:10px">${items}
    <tr><td style="padding:8px 12px;font-size:14px;border-top:1px solid #e2e8f0"><b>Total (paiement à la livraison)</b></td><td style="padding:8px 12px;font-size:15px;text-align:right;border-top:1px solid #e2e8f0"><b>${dh(o.total)}</b></td></tr></table></div>`;
  const html = layout('Nouvelle commande boutique', [
    ['Référence', `<b>${esc(o.ref)}</b>`],
    ['Client', esc(o.name)],
    ['Téléphone', contact(o.phone)],
    ['Ville', esc(o.city)],
    ['Adresse', esc(o.address)],
    ['Email', o.email ? `<a href="mailto:${esc(o.email)}">${esc(o.email)}</a>` : ''],
    ['Note', o.note ? esc(o.note) : ''],
  ], extra);
  return send(subject, html);
}

// ---------- confirmation emails to the customer ----------
// Resend only delivers to other people's addresses from a verified domain,
// so these are sent only when NOTIFY_FROM is set (e.g. "TANTOUNI <reservations@tantouni.ma>").
const T = {
  fr: {
    loc: 'fr-FR', hi: (n) => `Bonjour ${n},`,
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
    loc: 'en-GB', hi: (n) => `Hello ${n},`,
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
    loc: 'ar-MA', hi: (n) => `مرحبًا ${n}،`,
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
    loc: 'es-ES', hi: (n) => `Hola ${n}:`,
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
    loc: 'it-IT', hi: (n) => `Ciao ${n},`,
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
  const body = rows
    .filter(([, v]) => v !== '' && v != null)
    .map(([k, v]) => `<tr><td style="padding:7px 12px;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:7px 12px;font-size:14px;color:#0f172a">${v}</td></tr>`)
    .join('');
  return `<div dir="${rtl ? 'rtl' : 'ltr'}" style="font-family:Arial,Helvetica,sans-serif;background:#f1f5f9;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:#04235a;color:#fff;padding:20px 22px;font-size:20px;font-weight:bold;letter-spacing:.04em">TANTOUNI <span style="font-weight:normal;font-size:13px;opacity:.75">· Omar Pêche Vlog</span></div>
    <div style="padding:20px 22px 6px;font-size:15px;color:#0f172a;line-height:1.55">${intro}</div>
    <table style="width:100%;border-collapse:collapse;margin:4px 0">${body}</table>
    ${extra}
    <div style="padding:6px 22px 20px;font-size:15px;color:#0f172a;line-height:1.55">${next}<br><br>${esc(t.bye)}<br><b>${esc(t.team)}</b></div>
  </div></div>`;
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
  const html = customerLayout(t, r.lang === 'ar', `${esc(t.hi(r.name))}<br>${esc(t.bIntro)}`, [
    [t.ref, `<b>${esc(r.ref)}</b>`],
    [t.date, esc(date)],
    [t.people, esc(r.people)],
    [t.family, r.formula === 'family' ? esc(t.familyV) : ''],
    [t.port, esc(t.portV)],
    [t.total, `<b>${dh(r.total)}</b>`],
  ], '', esc(t.bNext));
  return sendTo(r.email, t.bSubject(r.ref), html);
}

export function confirmOrder(o) {
  if (!o.email) return;
  const t = tr(o.lang);
  const end = o.lang === 'ar' ? 'left' : 'right';
  const items = o.items
    .map((i) => `<tr><td style="padding:6px 12px;font-size:14px">${esc(i.qty)} × ${esc(i.name)}${i.size && i.size !== 'TU' ? ` · ${esc(t.size)} <b>${esc(i.size)}</b>` : ''}</td><td style="padding:6px 12px;font-size:14px;text-align:${end};white-space:nowrap">${dh(i.price * i.qty)}</td></tr>`)
    .join('');
  const extra = `<div style="padding:4px 10px 12px"><table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:10px">${items}
    <tr><td style="padding:8px 12px;font-size:14px;border-top:1px solid #e2e8f0"><b>${esc(t.total)}</b></td><td style="padding:8px 12px;font-size:15px;text-align:${end};border-top:1px solid #e2e8f0"><b>${dh(o.total)}</b></td></tr></table></div>`;
  const html = customerLayout(t, o.lang === 'ar', `${esc(t.hi(o.name))}<br>${esc(t.oIntro)}`, [
    [t.ref, `<b>${esc(o.ref)}</b>`],
    [t.delivery, `${esc(o.city)} - ${esc(o.address)}`],
  ], extra, esc(t.oNext));
  return sendTo(o.email, t.oSubject(o.ref), html);
}
