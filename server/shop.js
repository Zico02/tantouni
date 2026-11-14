// TANTOUNI merch catalog (seed). Omar edits prices, photos and stock from the admin.
// Prices are in DH. `order` is the display order in the shop.

const APPAREL_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const ONE_SIZE = ['TU'];

const HOODIE_DESC = {
  fr: 'Hoodie technique de pêche : tissu léger et respirant, capuche et cache-cou intégrés pour se protéger du soleil, du vent et des embruns. Logo TANTOUNI devant.',
  en: 'Technical fishing hoodie: light, breathable fabric with a built-in hood and neck gaiter to shield you from sun, wind and spray. TANTOUNI logo on the chest.',
  ar: 'هودي صيد تقني: قماش خفيف يسمح بالتهوية، مع قلنسوة وواقي رقبة مدمجين للحماية من الشمس والرياح ورذاذ البحر. شعار TANTOUNI على الصدر.',
  es: 'Sudadera técnica de pesca: tejido ligero y transpirable, capucha y braga de cuello integradas para protegerte del sol, el viento y la espuma. Logo TANTOUNI en el pecho.',
  it: 'Felpa tecnica da pesca: tessuto leggero e traspirante, cappuccio e scaldacollo integrati per proteggerti da sole, vento e spruzzi. Logo TANTOUNI sul petto.',
};
const HOODIE_PRINT_DESC = {
  fr: 'Hoodie technique de pêche avec grand logo TANTOUNI imprimé dans le dos et petit logo devant. Tissu léger et respirant, capuche, poche kangourou et passe-pouces.',
  en: 'Technical fishing hoodie with a large TANTOUNI print on the back and a small logo on the chest. Light, breathable fabric, hood, kangaroo pocket and thumb holes.',
  ar: 'هودي صيد تقني بشعار TANTOUNI كبير على الظهر وشعار صغير على الصدر. قماش خفيف يسمح بالتهوية، قلنسوة، جيب أمامي وفتحات للإبهام.',
  es: 'Sudadera técnica de pesca con gran logo TANTOUNI en la espalda y logo pequeño en el pecho. Tejido ligero y transpirable, capucha, bolsillo canguro y orificios para los pulgares.',
  it: 'Felpa tecnica da pesca con grande logo TANTOUNI sulla schiena e piccolo logo sul petto. Tessuto leggero e traspirante, cappuccio, tasca a marsupio e fori per i pollici.',
};
const BALACLAVA_DESC = {
  fr: 'Cagoule de pêche en tissu stretch léger : protège le visage et le cou du soleil et du vent, sèche vite. Logo TANTOUNI brodé sur le devant.',
  en: 'Lightweight stretch fishing balaclava: protects your face and neck from sun and wind, dries fast. TANTOUNI logo on the front.',
  ar: 'قناع صيد من قماش مطاطي خفيف: يحمي الوجه والرقبة من الشمس والرياح ويجف بسرعة. شعار TANTOUNI على الواجهة.',
  es: 'Pasamontañas de pesca en tejido elástico ligero: protege cara y cuello del sol y el viento, seca rápido. Logo TANTOUNI en la parte delantera.',
  it: 'Passamontagna da pesca in tessuto elastico leggero: protegge viso e collo da sole e vento, asciuga in fretta. Logo TANTOUNI sul davanti.',
};

const P = (o) => ({ oldPrice: null, badge: {}, soldOut: false, fit: 'contain', ...o });

export function seedProducts() {
  const list = [
    P({
      slug: 'hoodie-bleu-ciel', category: 'hoodie', price: 349, fit: 'cover', focus: '50% 30%',
      badge: { fr: 'Nouveau', en: 'New', ar: 'جديد', es: 'Nuevo', it: 'Novità' },
      name: { fr: 'Hoodie technique Bleu Ciel', en: 'Sky Blue Performance Hoodie', ar: 'هودي تقني أزرق سماوي', es: 'Sudadera técnica Azul Cielo', it: 'Felpa tecnica Azzurro Cielo' },
      description: HOODIE_DESC, images: ['/uploads/shop/hoodie-bleu-ciel.webp'], sizes: APPAREL_SIZES,
    }),
    P({
      slug: 'hoodie-gris-perle', category: 'hoodie', price: 349, fit: 'cover', focus: '50% 40%',
      badge: { fr: 'Nouveau', en: 'New', ar: 'جديد', es: 'Nuevo', it: 'Novità' },
      name: { fr: 'Hoodie technique Gris Perle', en: 'Pearl Grey Performance Hoodie', ar: 'هودي تقني رمادي لؤلؤي', es: 'Sudadera técnica Gris Perla', it: 'Felpa tecnica Grigio Perla' },
      description: HOODIE_DESC, images: ['/uploads/shop/hoodie-gris-perle.webp'], sizes: APPAREL_SIZES,
    }),
    P({
      slug: 'hoodie-noir', category: 'hoodie', price: 349, fit: 'cover',
      name: { fr: 'Hoodie technique Noir', en: 'Black Performance Hoodie', ar: 'هودي تقني أسود', es: 'Sudadera técnica Negra', it: 'Felpa tecnica Nera' },
      description: HOODIE_PRINT_DESC, images: ['/uploads/shop/hoodie-noir.webp'], sizes: APPAREL_SIZES,
    }),
    P({
      slug: 'hoodie-mahi-mahi', category: 'hoodie', price: 379, fit: 'cover',
      badge: { fr: 'Édition Mahi', en: 'Mahi edition', ar: 'إصدار ماهي', es: 'Edición Mahi', it: 'Edizione Mahi' },
      name: { fr: 'Hoodie technique Mahi-Mahi', en: 'Mahi-Mahi Performance Hoodie', ar: 'هودي تقني ماهي ماهي', es: 'Sudadera técnica Mahi-Mahi', it: 'Felpa tecnica Mahi-Mahi' },
      description: HOODIE_PRINT_DESC, images: ['/uploads/shop/hoodie-mahi.webp'], sizes: APPAREL_SIZES,
    }),
    P({
      slug: 'bob-cache-cou', category: 'hat', price: 199,
      name: { fr: 'Bob de pêche avec cache-cou', en: 'Fishing bucket hat with neck flap', ar: 'قبعة صيد مع واقي الرقبة', es: 'Gorro de pesca con cubrenuca', it: 'Cappello da pesca con paranuca' },
      description: {
        fr: 'Bob à large bord avec cache-cou amovible et cordon de serrage : la protection complète contre le soleil en mer. Logo TANTOUNI brodé.',
        en: 'Wide-brim bucket hat with a removable neck flap and chin cord: full sun protection out at sea. Embroidered TANTOUNI logo.',
        ar: 'قبعة بحافة عريضة مع واقي رقبة قابل للنزع وحبل للذقن: حماية كاملة من الشمس في البحر. شعار TANTOUNI مطرز.',
        es: 'Gorro de ala ancha con cubrenuca extraíble y cordón: protección total contra el sol en el mar. Logo TANTOUNI bordado.',
        it: 'Cappello a tesa larga con paranuca removibile e cordino: protezione completa dal sole in mare. Logo TANTOUNI ricamato.',
      },
      images: ['/uploads/shop/bob-noir.webp'], sizes: ONE_SIZE,
    }),
    P({
      slug: 'casquette-trucker', category: 'cap', price: 179,
      name: { fr: 'Casquette trucker Noir / Gris', en: 'Black / Grey Trucker Cap', ar: 'قبعة تراكر أسود / رمادي', es: 'Gorra trucker Negra / Gris', it: 'Cappellino trucker Nero / Grigio' },
      description: {
        fr: 'Casquette trucker à visière incurvée, filet respirant à l’arrière et fermeture réglable. Logo TANTOUNI brodé en relief.',
        en: 'Curved-visor trucker cap with breathable mesh back and adjustable snap. Raised embroidered TANTOUNI logo.',
        ar: 'قبعة تراكر بحافة منحنية وشبكة خلفية للتهوية وإغلاق قابل للتعديل. شعار TANTOUNI مطرز بارز.',
        es: 'Gorra trucker de visera curva, malla transpirable trasera y cierre ajustable. Logo TANTOUNI bordado en relieve.',
        it: 'Cappellino trucker con visiera curva, retro in rete traspirante e chiusura regolabile. Logo TANTOUNI ricamato in rilievo.',
      },
      images: ['/uploads/shop/casquette-trucker.webp'], sizes: ONE_SIZE,
    }),
    P({
      slug: 'cagoule-noire', category: 'balaclava', price: 99,
      name: { fr: 'Cagoule Noire', en: 'Black Balaclava', ar: 'قناع أسود', es: 'Pasamontañas Negro', it: 'Passamontagna Nero' },
      description: BALACLAVA_DESC, images: ['/uploads/shop/cagoule-1.webp'], sizes: ONE_SIZE,
    }),
    P({
      slug: 'cagoule-camo-nuit', category: 'balaclava', price: 99,
      name: { fr: 'Cagoule Camo Nuit', en: 'Night Camo Balaclava', ar: 'قناع تمويه ليلي', es: 'Pasamontañas Camo Noche', it: 'Passamontagna Camo Notte' },
      description: BALACLAVA_DESC, images: ['/uploads/shop/cagoule-2.webp'], sizes: ONE_SIZE,
    }),
    P({
      slug: 'cagoule-python', category: 'balaclava', price: 99,
      name: { fr: 'Cagoule Python', en: 'Python Balaclava', ar: 'قناع بايثون', es: 'Pasamontañas Pitón', it: 'Passamontagna Pitone' },
      description: BALACLAVA_DESC, images: ['/uploads/shop/cagoule-3.webp'], sizes: ONE_SIZE,
    }),
    P({
      slug: 'cagoule-camo-urbain', category: 'balaclava', price: 99,
      name: { fr: 'Cagoule Camo Urbain', en: 'Urban Camo Balaclava', ar: 'قناع تمويه حضري', es: 'Pasamontañas Camo Urbano', it: 'Passamontagna Camo Urbano' },
      description: BALACLAVA_DESC, images: ['/uploads/shop/cagoule-4.webp'], sizes: ONE_SIZE,
    }),
  ];
  const now = Date.now();
  return list.map((p, i) => ({ id: `${p.slug}-${(now + i).toString(36)}`, order: i, ...p }));
}
