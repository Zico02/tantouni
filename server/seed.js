import { SEAS_BY_SLUG, SHARKS } from './sharks.js';

// Starting species list for the "Tableau de chasse". Omar can tick, edit, add and
// delete from the admin panel; this file only runs when the database is created.
//
// art.shape picks the procedural SVG silhouette used until a real photo is uploaded.

const F = (o) => ({
  caught: false,
  catch: { date: '', weight: '', length: '', location: '', notes: '' },
  youtube: '',
  image: '',
  ...o,
});

const SPECIES = [
  F({
    slug: 'thon-rouge', rarity: 'legend', zone: 'maroc',
    names: { fr: 'Thon rouge', en: 'Atlantic bluefin tuna', ar: 'التونة الحمراء', es: 'Atún rojo', it: 'Tonno rosso' },
    nickname: 'TANTOUNI',
    scientific: 'Thunnus thynnus',
    maxLength: 400, maxWeight: 680, depth: '0 – 1000 m',
    habitat: ['pelagic'], techniques: ['jigging', 'trolling', 'livebait', 'popping'], season: [5, 6, 7, 8, 9, 10],
    description: {
      fr: "Le roi de l'Atlantique, le fameux « Tantouni ». Une torpille de muscles capable de dépasser 70 km/h et de vider un moulinet en quelques secondes. Le poisson de toute une vie.",
      en: 'The king of the Atlantic, the famous "Tantouni". A torpedo of muscle that can top 70 km/h and empty a reel in seconds. The fish of a lifetime.',
    },
    caught: true,
    image: '/uploads/tuna.png',
    art: { shape: 'tuna', back: '#0b1e4a', belly: '#d9e3ee', fin: '#16285a', accent: '#f2c230' },
  }),
  F({
    slug: 'marlin-blanc', rarity: 'legend', zone: 'maroc',
    names: { fr: 'Marlin blanc', en: 'White marlin', ar: 'المرلين الأبيض', es: 'Aguja blanca', it: 'Marlin bianco' },
    scientific: 'Kajikia albida',
    image: '/uploads/marlin.png',
    maxLength: 280, maxWeight: 82, depth: '0 – 150 m',
    habitat: ['pelagic'], techniques: ['trolling', 'livebait'], season: [7, 8, 9, 10],
    description: {
      fr: "Les eaux au large de Mohammedia sont parmi les meilleures au monde pour le marlin blanc. Sauts spectaculaires, rostre en l'air : un pur moment de big game.",
      en: 'The waters off Mohammedia are among the best in the world for white marlin. Spectacular jumps, bill in the air: pure big-game magic.',
    },
    caught: true,
    art: { shape: 'marlin', back: '#132a63', belly: '#e8eef5', fin: '#2a5dc9', accent: '#4fa3ff' },
  }),
  F({
    slug: 'thon-dents-de-chien', rarity: 'legend', zone: 'monde',
    names: { fr: 'Thon dents de chien', en: 'Dogtooth tuna', ar: 'تونة أسنان الكلب', es: 'Atún diente de perro', it: 'Tonno dente di cane' },
    nickname: 'DOGTOOTH',
    scientific: 'Gymnosarda unicolor',
    maxLength: 248, maxWeight: 131, depth: '10 – 300 m',
    habitat: ['reef', 'pelagic'], techniques: ['jigging', 'popping', 'livebait'], season: [],
    description: {
      fr: "Le cauchemar des récifs de l'Indo-Pacifique. Il frappe et file droit dans les roches : il faut tout bloquer dès la touche, sinon c'est la casse.",
      en: 'The nightmare of Indo-Pacific reefs. It hits and bolts straight for the rocks: lock everything at the strike or lose it.',
    },
    caught: true,
    image: '/uploads/dogtooth.png',
    art: { shape: 'tuna', back: '#1b2433', belly: '#b9c2cc', fin: '#2b3442', accent: '#6b7a8c' },
  }),
  F({
    slug: 'courbine', rarity: 'prized', zone: 'maroc',
    names: { fr: 'Courbine (Maigre)', en: 'Meagre', ar: 'الكوربين', es: 'Corvina', it: "Bocca d'oro" },
    nickname: 'COURBINE',
    scientific: 'Argyrosomus regius',
    maxLength: 230, maxWeight: 103, depth: '0 – 300 m',
    habitat: ['coastal', 'surf'], techniques: ['livebait', 'spinning', 'bottom'], season: [4, 5, 6, 7],
    description: {
      fr: "La géante des côtes marocaines. Elle « chante » sous l'eau grâce à sa vessie natatoire et peut dépasser les 50 kg près de Rabat.",
      en: 'The giant of the Moroccan coast. It "sings" underwater using its swim bladder and can top 50 kg near Rabat.',
    },
    caught: true,
    youtube: 'https://www.youtube.com/watch?v=Rc_FX_E79ns',
    image: '/uploads/courbine.png',
    art: { shape: 'corvina', back: '#6d6a72', belly: '#e9e4dc', fin: '#8a7f6e', accent: '#c4a979' },
  }),
  F({
    slug: 'requin-chama', rarity: 'legend', zone: 'maroc',
    names: { fr: 'Requin « Chama »', en: 'Shark ("Chama")', ar: 'القرش «شامة»', es: 'Tiburón «Chama»', it: 'Squalo «Chama»' },
    nickname: 'CHAMA',
    scientific: 'Selachimorpha',
    maxLength: null, maxWeight: null, depth: '0 – 500 m',
    habitat: ['pelagic'], techniques: ['livebait', 'bottom'], season: [],
    description: {
      fr: 'Un nouveau record national en big game : un combat interminable pour une bête hors normes. Respect total, remise à l\'eau.',
      en: 'A new national big-game record: an endless fight with an outsized beast. Total respect, released.',
    },
    caught: true,
    youtube: 'https://www.youtube.com/watch?v=j1DdS3c3nNQ',
    art: { shape: 'shark', back: '#3c4f66', belly: '#e6ebef', fin: '#34465b', accent: '#7d93ab' },
  }),
  F({
    slug: 'marlin-bleu', rarity: 'legend', zone: 'maroc',
    names: { fr: 'Marlin bleu', en: 'Blue marlin', ar: 'المرلين الأزرق', es: 'Marlín azul', it: 'Marlin azzurro' },
    scientific: 'Makaira nigricans',
    nickname: 'MARLIN',
    image: '/uploads/marlin-bleu.png',
    maxLength: 500, maxWeight: 820, depth: '0 – 200 m',
    habitat: ['pelagic'], techniques: ['trolling', 'livebait'], season: [7, 8, 9],
    description: {
      fr: "Le Graal absolu du big game. Plusieurs centaines de kilos de puissance pure qui sautent hors de l'eau.",
      en: 'The absolute holy grail of big game. Hundreds of kilos of raw power leaping out of the water.',
    },
    art: { shape: 'marlin', back: '#071c4d', belly: '#dfe8f2', fin: '#1647b8', accent: '#38b6ff' },
  }),
  F({
    slug: 'espadon', rarity: 'legend', zone: 'maroc',
    names: { fr: 'Espadon', en: 'Swordfish', ar: 'سمك أبو سيف', es: 'Pez espada', it: 'Pesce spada' },
    scientific: 'Xiphias gladius',
    maxLength: 455, maxWeight: 650, depth: '0 – 800 m',
    habitat: ['pelagic'], techniques: ['bottom', 'livebait'], season: [],
    description: {
      fr: "Gladiateur des profondeurs, il chasse de nuit à des centaines de mètres. Son épée plate le rend unique parmi les poissons à rostre.",
      en: 'Gladiator of the deep, hunting at night hundreds of metres down. Its flat sword makes it unique among billfish.',
    },
    art: { shape: 'sword', back: '#2c2440', belly: '#cfc7d9', fin: '#3a2f55', accent: '#8b7bb5' },
  }),
  F({
    slug: 'thon-albacore', rarity: 'prized', zone: 'maroc',
    names: { fr: 'Thon albacore', en: 'Yellowfin tuna', ar: 'التونة صفراء الزعانف', es: 'Rabil', it: 'Tonno pinna gialla' },
    scientific: 'Thunnus albacares',
    maxLength: 239, maxWeight: 200, depth: '0 – 250 m',
    habitat: ['pelagic'], techniques: ['popping', 'jigging', 'trolling'], season: [],
    description: {
      fr: 'Reconnaissable à ses longues nageoires jaunes. Chasses en surface explosives, idéal au popper.',
      en: 'Recognisable by its long yellow fins. Explosive surface feeds, perfect for poppers.',
    },
    art: { shape: 'tuna', back: '#0d2457', belly: '#e3e8ee', fin: '#ffd21f', accent: '#ffd21f', stripe: true },
  }),
  F({
    slug: 'germon', rarity: 'prized', zone: 'maroc',
    names: { fr: 'Germon', en: 'Albacore', ar: 'التونة البيضاء', es: 'Atún blanco', it: 'Alalunga' },
    scientific: 'Thunnus alalunga',
    maxLength: 140, maxWeight: 60, depth: '0 – 600 m',
    habitat: ['pelagic'], techniques: ['trolling', 'jigging'], season: [],
    description: {
      fr: 'Le thon aux très longues pectorales. Il voyage en bancs immenses au large.',
      en: 'The tuna with extra-long pectoral fins. It travels in huge schools offshore.',
    },
    art: { shape: 'tuna', back: '#1a2f5c', belly: '#e9edf2', fin: '#2d4677', accent: '#8fb3e6', longPec: true },
  }),
  F({
    slug: 'bonite', rarity: 'common', zone: 'maroc',
    names: { fr: 'Bonite à dos rayé', en: 'Atlantic bonito', ar: 'البونيت', es: 'Bonito', it: 'Palamita' },
    scientific: 'Sarda sarda',
    maxLength: 91, maxWeight: 11, depth: '0 – 200 m',
    habitat: ['pelagic', 'coastal'], techniques: ['spinning', 'jigging', 'trolling'], season: [],
    description: {
      fr: 'Petite cousine nerveuse du thon, rayée sur le dos. Elle déboule en bancs et donne des combats survoltés au léger.',
      en: "The tuna's wired little cousin, with a striped back. Arrives in schools and fights hard on light tackle.",
    },
    art: { shape: 'tuna', back: '#1b3a6b', belly: '#e6ebf0', fin: '#27497d', accent: '#0d2246', backStripes: true },
  }),
  F({
    slug: 'seriole', rarity: 'prized', zone: 'maroc',
    names: { fr: 'Amberjack', en: 'Greater amberjack', ar: 'السريولا', es: 'Pez de limón', it: 'Ricciola' },
    nickname: 'SÉRIOLE',
    scientific: 'Seriola dumerili',
    image: '/uploads/seriole.png',
    maxLength: 190, maxWeight: 80, depth: '10 – 360 m',
    habitat: ['reef', 'pelagic'], techniques: ['jigging', 'livebait'], season: [],
    description: {
      fr: 'La reine du jigging vertical. Elle sonde vers les épaves et les roches avec une puissance brutale.',
      en: 'The queen of vertical jigging. It dives for wrecks and rocks with brutal power.',
    },
    art: { shape: 'jack', back: '#5a5f3a', belly: '#ece6d3', fin: '#c9a227', accent: '#e8c547', band: true },
  }),
  F({
    slug: 'liche', rarity: 'prized', zone: 'maroc',
    names: { fr: 'Liche', en: 'Leerfish', ar: 'أولاح', es: 'Palometón', it: 'Leccia amia' },
    scientific: 'Lichia amia',
    nickname: 'AOULAH',
    image: '/uploads/liche-v2.png',
    maxLength: 200, maxWeight: 50, depth: '0 – 50 m',
    habitat: ['coastal', 'surf'], techniques: ['spinning', 'livebait', 'popping'], season: [],
    description: {
      fr: 'Un prédateur côtier capricieux et fou. Chasse en surface, rushs latéraux et sauts : elle rend dingue.',
      en: 'A moody, crazy coastal predator. Surface strikes, sideways runs and jumps: it drives anglers wild.',
      ar: 'الأولاح، مفترس ساحلي متقلّب ومجنون: هجمات على السطح، اندفاعات جانبية وقفزات تُجنّن الصيادين.',
    },
    art: { shape: 'jack', back: '#4a5866', belly: '#eef0f1', fin: '#55606b', accent: '#2c3640', wavyLine: true },
  }),
  F({
    slug: 'coryphene', rarity: 'prized', zone: 'maroc',
    names: { fr: 'Coryphène', en: 'Mahi-mahi', ar: 'الدورادو', es: 'Dorado', it: 'Lampuga' },
    scientific: 'Coryphaena hippurus',
    nickname: 'MAHI-MAHI',
    image: '/uploads/mahi-mahi.png',
    maxLength: 210, maxWeight: 40, depth: '0 – 85 m',
    habitat: ['pelagic'], techniques: ['trolling', 'spinning'], season: [7, 8, 9, 10],
    description: {
      fr: "Le poisson le plus coloré de l'océan : vert électrique, jaune et bleu. Il se cache sous les objets flottants.",
      en: 'The most colourful fish in the ocean: electric green, yellow and blue. It hides under floating objects.',
    },
    art: { shape: 'mahi', back: '#1b9e6b', belly: '#ffd84a', fin: '#1f74d1', accent: '#2fd0ff', spots: true },
  }),
  F({
    slug: 'merou', rarity: 'prized', zone: 'maroc',
    names: { fr: 'Grouper', en: 'Dusky grouper', ar: 'الميرو', es: 'Mero', it: 'Cernia bruna' },
    nickname: 'MÉROU',
    scientific: 'Epinephelus marginatus',
    image: '/uploads/merou.png',
    maxLength: 150, maxWeight: 60, depth: '8 – 300 m',
    habitat: ['reef'], techniques: ['jigging', 'livebait', 'bottom'], season: [],
    description: {
      fr: 'Le seigneur des roches. Une fois piqué, il fonce dans son trou : le combat se gagne dans les premiers mètres.',
      en: 'Lord of the rocks. Once hooked it charges for its hole: the fight is won in the first metres.',
    },
    art: { shape: 'grouper', back: '#5a3d2b', belly: '#c9a77e', fin: '#4a3020', accent: '#e6d0a8', blotches: true },
  }),
  F({
    slug: 'denti', rarity: 'prized', zone: 'maroc',
    names: { fr: 'Denti', en: 'Common dentex', ar: 'الدنتي', es: 'Dentón', it: 'Dentice' },
    nickname: 'DENTEX',
    scientific: 'Dentex dentex',
    image: '/uploads/dentex.png',
    maxLength: 100, maxWeight: 20, depth: '5 – 200 m',
    habitat: ['reef'], techniques: ['jigging', 'livebait'], season: [],
    description: {
      fr: 'Le carnassier aux crocs, reflets rosés et taches bleues. Un des poissons les plus recherchés en jigging léger.',
      en: 'The fanged predator with pink sheen and blue spots. One of the most sought-after fish on light jigs.',
    },
    art: { shape: 'bream', back: '#8d5b78', belly: '#efd7d9', fin: '#9d6a7c', accent: '#5aa7e8', spots: true },
  }),
  F({
    slug: 'bar', rarity: 'common', zone: 'maroc',
    names: { fr: 'Loup Bar', en: 'European seabass', ar: 'القاروس', es: 'Lubina', it: 'Spigola' },
    nickname: 'DER3I',
    scientific: 'Dicentrarchus labrax',
    image: '/uploads/bar.png',
    maxLength: 103, maxWeight: 12, depth: '0 – 100 m',
    habitat: ['coastal', 'surf'], techniques: ['spinning', 'livebait'], season: [11, 12, 1, 2, 3],
    description: {
      fr: "Le poisson des vagues et de l'écume. Chasse au leurre au lever du jour, le classique des côtes marocaines.",
      en: 'The fish of waves and foam. Dawn lure fishing, a Moroccan coastal classic.',
    },
    art: { shape: 'bass', back: '#4d5d6e', belly: '#eef1f4', fin: '#5c6b7b', accent: '#9fb0c2' },
  }),
  F({
    slug: 'pagre', rarity: 'common', zone: 'maroc',
    names: { fr: 'Pagre', en: 'Red porgy', ar: 'البغروس', es: 'Pargo', it: 'Pagro' },
    scientific: 'Pagrus pagrus',
    nickname: 'CHAMA',
    image: '/uploads/chama.png',
    caught: true,
    maxLength: 91, maxWeight: 7.7, depth: '10 – 250 m',
    habitat: ['reef'], techniques: ['bottom', 'jigging'], season: [],
    description: {
      fr: 'Robe rose argentée, mâchoires solides. Un régal sur les fonds rocheux.',
      en: 'Silvery-pink robe, strong jaws. A treat on rocky grounds.',
    },
    art: { shape: 'bream', back: '#c75b5b', belly: '#f8e1df', fin: '#d77c7c', accent: '#7fbcef', spots: true },
  }),
  F({
    slug: 'dorade-royale', rarity: 'common', zone: 'maroc',
    names: { fr: 'Dorade royale', en: 'Gilthead seabream', ar: 'الدوراد', es: 'Dorada', it: 'Orata' },
    nickname: 'DORADA',
    scientific: 'Sparus aurata',
    image: '/uploads/dorada.png',
    maxLength: 70, maxWeight: 17, depth: '0 – 150 m',
    habitat: ['coastal'], techniques: ['bottom', 'spinning'], season: [],
    description: {
      fr: "Reconnaissable à son bandeau doré entre les yeux. Méfiante et puissante, elle broie les coquillages.",
      en: 'Recognisable by the golden band between its eyes. Wary and strong, it crushes shellfish.',
    },
    art: { shape: 'bream', back: '#7b8a99', belly: '#eef2f5', fin: '#6d7b8a', accent: '#f0c23a', goldBand: true },
  }),
  F({
    slug: 'barracuda', rarity: 'common', zone: 'maroc',
    names: { fr: 'Barracuda', en: 'Barracuda', ar: 'الباراكودا', es: 'Barracuda', it: 'Barracuda' },
    scientific: 'Sphyraena viridensis',
    maxLength: 130, maxWeight: 12, depth: '0 – 100 m',
    habitat: ['coastal', 'reef'], techniques: ['spinning', 'trolling'], season: [],
    description: {
      fr: 'Le fusil de la mer : long, rapide et armé de dents tranchantes. Attaques éclair sur les leurres.',
      en: 'The rifle of the sea: long, fast and armed with razor teeth. Lightning strikes on lures.',
    },
    art: { shape: 'barracuda', back: '#3d5468', belly: '#e9eef2', fin: '#4a6176', accent: '#26394b', bars: true },
  }),
  F({
    slug: 'tassergal', rarity: 'common', zone: 'maroc',
    names: { fr: 'Bluefish', en: 'Bluefish', ar: 'التاسرغال', es: 'Anjova', it: 'Pesce serra' },
    nickname: 'TASSERGAL',
    scientific: 'Pomatomus saltatrix',
    image: '/uploads/tassergal.png',
    maxLength: 130, maxWeight: 14, depth: '0 – 200 m',
    habitat: ['coastal', 'surf'], techniques: ['spinning', 'popping'], season: [],
    description: {
      fr: 'Un vorace qui coupe les bas de ligne. Chasses en surface frénétiques au bord des plages.',
      en: 'A glutton that bites through leaders. Frenzied surface feeds right off the beaches.',
    },
    art: { shape: 'bass', back: '#2f6a86', belly: '#e6f0f4', fin: '#3d7a96', accent: '#9ed4e8' },
  }),
  F({
    slug: 'sar', rarity: 'common', zone: 'maroc',
    names: { fr: 'Sar commun', en: 'White seabream', ar: 'الشرغو', es: 'Sargo', it: 'Sarago maggiore' },
    scientific: 'Diplodus sargus',
    maxLength: 45, maxWeight: 1.9, depth: '0 – 50 m',
    habitat: ['coastal', 'reef'], techniques: ['bottom', 'spinning'], season: [],
    description: {
      fr: "Le combattant des roches battues par l'écume, rayé de noir. Petit mais teigneux.",
      en: 'The black-barred fighter of foam-beaten rocks. Small but feisty.',
    },
    art: { shape: 'bream', back: '#8f99a3', belly: '#f2f4f6', fin: '#2a2f35', accent: '#1d2125', bars: true },
  }),
  F({
    slug: 'wahoo', rarity: 'prized', zone: 'monde',
    names: { fr: 'Thazard-bâtard (Wahoo)', en: 'Wahoo', ar: 'الواهو', es: 'Peto', it: 'Acantocibio' },
    scientific: 'Acanthocybium solandri',
    maxLength: 250, maxWeight: 83, depth: '0 – 20 m',
    habitat: ['pelagic'], techniques: ['trolling'], season: [],
    description: {
      fr: "L'un des poissons les plus rapides au monde. Le moulinet hurle dès la touche.",
      en: 'One of the fastest fish in the world. The reel screams from the first second.',
    },
    art: { shape: 'wahoo', back: '#173d73', belly: '#dfe8f1', fin: '#1d4d8a', accent: '#5aa0e6', bars: true },
  }),
  F({
    slug: 'carangue-gt', rarity: 'legend', zone: 'monde',
    names: { fr: 'Carangue GT', en: 'Giant trevally', ar: 'الكراكس العملاق', es: 'Jurel gigante', it: 'Carango gigante' },
    scientific: 'Caranx ignobilis',
    maxLength: 170, maxWeight: 80, depth: '0 – 190 m',
    habitat: ['reef'], techniques: ['popping', 'jigging'], season: [],
    description: {
      fr: 'Le bulldozer des récifs. Il explose sur les poppers et tente tout pour casser dans le corail.',
      en: 'The bulldozer of the reef. It explodes on poppers and does anything to break you off in the coral.',
    },
    art: { shape: 'jack', back: '#3b4048', belly: '#cfd4da', fin: '#23272d', accent: '#5c6470', deep: true },
  }),
  F({
    slug: 'voilier', rarity: 'legend', zone: 'monde',
    names: { fr: 'Voilier', en: 'Sailfish', ar: 'سمكة الشراع', es: 'Pez vela', it: 'Pesce vela' },
    scientific: 'Istiophorus platypterus',
    maxLength: 340, maxWeight: 100, depth: '0 – 200 m',
    habitat: ['pelagic'], techniques: ['trolling', 'livebait'], season: [],
    description: {
      fr: "Sa voile dorsale géante se déploie pour rabattre les bancs. Le sprinteur de l'océan.",
      en: 'Its giant dorsal sail unfolds to herd baitfish. The sprinter of the ocean.',
    },
    art: { shape: 'sailfish', back: '#0f2c66', belly: '#e3ebf3', fin: '#1d4fbf', accent: '#5bc0ff', spots: true },
  }),
  F({
    slug: 'carangue-points-bleus', rarity: 'prized', zone: 'monde',
    names: { fr: 'Carangue à points bleus', en: 'Bluefin trevally', ar: 'الكراكس ذو الزعانف الزرقاء', es: 'Jurel aleta azul', it: 'Carango pinna blu' },
    nickname: 'BLUEFIN TREVALLY',
    scientific: 'Caranx melampygus',
    image: '/uploads/bluefin-trevally.png',
    maxLength: 117, maxWeight: 44, depth: '0 – 190 m',
    habitat: ['reef', 'coastal'], techniques: ['popping', 'jigging', 'spinning'], season: [],
    description: {
      fr: 'Le chasseur électrique des récifs, constellé de points noirs et aux nageoires bleutées. Il attaque les leurres de surface en meute et tire très fort dans les patates de corail.',
      en: 'The electric hunter of the reefs, speckled with black dots and blue-tinged fins. It hits surface lures in packs and pulls hard for the coral heads.',
    },
    art: { shape: 'jack', back: '#5c6a4c', belly: '#d9dde0', fin: '#3c6fb5', accent: '#1d2125', spots: true },
  }),
];

export function seedFish() {
  // fish species first, then the sharks; each gets the seas where it lives
  const all = [...SPECIES, ...SHARKS.map((x) => F(x))].map((x) => ({ seas: SEAS_BY_SLUG[x.slug] ?? x.seas ?? [], ...x }));
  const now = Date.now();
  return all.map((s, i) => ({ id: `${s.slug}-${(now + i).toString(36)}`, order: i, ...s }));
}

// ---------- Palmarès (achievements) ----------
export function seedAchievements() {
  return [
    {
      id: 'jebel-sifah-2026',
      date: '2026-10-11',
      place: 2,
      award: { fr: '2ᵉ place par équipe', en: '2nd Place Team', ar: 'المركز الثاني للفرق', es: '2.º puesto por equipos', it: '2° posto a squadre' },
      title: {
        fr: '3ᵉ International Fishing Championship',
        en: '3rd International Fishing Championship',
        ar: 'البطولة الدولية الثالثة للصيد',
        es: '3.er International Fishing Championship',
        it: '3° International Fishing Championship',
      },
      location: 'Jebel Sifah, Oman',
      organizer: 'IGFA · Offshore World Championship Costa Rica 2027 Qualifying Event',
      description: {
        fr: "Du 7 au 11 octobre 2026, Omar et l'équipe du Maroc ont affronté les meilleures équipes internationales à Jebel Sifah, en association avec l'IGFA, lors d'une épreuve qualificative pour l'Offshore World Championship Costa Rica 2027. Thon albacore au crochet de la pesée, drapeau marocain bien haut et, au bout, le trophée de 2ᵉ place par équipe. TANTOUNI !",
        en: 'From 7 to 11 October 2026, Omar and Team Morocco took on top international teams at Jebel Sifah, in association with the IGFA, at a qualifying event for the Offshore World Championship Costa Rica 2027. A yellowfin on the weigh-in hook, the Moroccan flag held high and, at the end, the 2nd Place Team trophy. TANTOUNI!',
        ar: 'من 7 إلى 11 أكتوبر 2026، واجه عمر والفريق المغربي أفضل الفرق الدولية في جبل سيفة بالتعاون مع IGFA، في منافسة مؤهلة لبطولة العالم Offshore World Championship كوستاريكا 2027. تونة صفراء الزعانف على الميزان، والعلم المغربي عاليًا، وفي النهاية كأس المركز الثاني للفرق. طنطوني!',
      },
      photos: [
        '/uploads/jebel-sifah-podium.jpg',
        '/uploads/jebel-sifah-pesee.jpg',
        '/uploads/jebel-sifah-trophees-2.jpg',
        '/uploads/jebel-sifah-trophees-1.jpg',
        '/uploads/jebel-sifah-albacore.jpg',
        '/uploads/jebel-sifah-affiche.jpg',
      ],
    },
  ];
}
