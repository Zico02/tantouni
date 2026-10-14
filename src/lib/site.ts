// Everything Omar may want to change without touching components.
export const SITE = {
  brand: 'TANTOUNI',
  captain: 'Omar Pêche Vlog',
  port: 'Port de Mohammedia',
  pricePerPerson: 1000,
  // "Family vs Family": both boats privatised for the day (must match FAMILY_PRICE in server/index.js)
  familyPrice: 10000,
  currency: 'DH',
  boats: 2,
  seatsPerBoat: 5,
  // Put the WhatsApp number in international format (e.g. '2126XXXXXXXX') to show the button.
  whatsapp: '',
  socials: {
    youtube: 'https://www.youtube.com/@omarpechevlog1230',
    instagram: 'https://www.instagram.com/omarpechevlog/',
    facebook: 'https://www.facebook.com/p/Omar-p%C3%AAche-vlog-100063479772521/',
  },
  // Verified videos from the channel (shown on the home page).
  videos: [
    { id: 'j1DdS3c3nNQ', title: 'Big game - nouveau record « Chama » au Maroc' },
    { id: 'vEzuc3EH6UI', title: 'La mer a explosé de poissons ! Saison 2026' },
    { id: 'igdX8-H7JPU', title: 'Un nouveau spot plein de géants' },
    { id: 'Rc_FX_E79ns', title: 'Première sortie courbine à Rabat' },
    { id: 'HZvPbGVh70w', title: 'Venu de Dubaï pour cette expérience magique' },
    { id: 'OHOdzl_lrzo', title: 'Aventure au large avec le rappeur Stormy' },
  ],
};

export const youtubeId = (url: string) => {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : '';
};
