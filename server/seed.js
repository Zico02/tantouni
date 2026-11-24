import { SEAS_BY_SLUG, SHARKS } from './sharks.js';
import { RANGES } from './ranges.js';
import { SHARK_PHOTOS } from './sharkPhotos.js';

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
    slug: 'thon-albacore', rarity: 'prized', zone: 'maroc',
    names: { fr: 'Thon jaune', en: 'Yellowfin tuna', ar: 'التونة صفراء الزعانف', es: 'Rabil', it: 'Tonno pinna gialla' },
    nickname: 'YELLOWFIN',
    scientific: 'Thunnus albacares',
    maxLength: 239, maxWeight: 200, depth: '0 – 250 m',
    habitat: ['pelagic'], techniques: ['popping', 'jigging', 'trolling'], season: [],
    description: {
      fr: 'Reconnaissable à ses longues nageoires jaunes. Chasses en surface explosives, idéal au popper.',
      en: 'Recognisable by its long yellow fins. Explosive surface feeds, perfect for poppers.',
    },
    caught: true,
    image: '/uploads/tuna.png',
    art: { shape: 'tuna', back: '#0d2457', belly: '#e3e8ee', fin: '#ffd21f', accent: '#ffd21f', stripe: true },
  }),
  F({
    slug: 'thon-rouge', rarity: 'legend', zone: 'maroc',
    names: { fr: 'Thon rouge', en: 'Atlantic bluefin tuna', ar: 'التونة الحمراء', es: 'Atún rojo', it: 'Tonno rosso' },
    nickname: 'BLUEFIN',
    scientific: 'Thunnus thynnus',
    image: '/uploads/thon-rouge.png',
    maxLength: 400, maxWeight: 680, depth: '0 – 1000 m',
    habitat: ['pelagic'], techniques: ['jigging', 'trolling', 'livebait', 'popping'], season: [5, 6, 7, 8, 9, 10],
    description: {
      fr: "Le roi de l'Atlantique, le fameux « Tantouni ». Une torpille de muscles capable de dépasser 70 km/h et de vider un moulinet en quelques secondes. Le poisson de toute une vie.",
      en: 'The king of the Atlantic, the famous "Tantouni". A torpedo of muscle that can top 70 km/h and empty a reel in seconds. The fish of a lifetime.',
    },
    art: { shape: 'tuna', back: '#0b1e4a', belly: '#d9e3ee', fin: '#16285a', accent: '#f2c230' },
  }),
  F({
    slug: 'thon-rouge-atlantique', rarity: 'legend', zone: 'maroc',
    names: { fr: 'Bluefin tuna', en: 'Bluefin tuna', ar: 'التونة الحمراء الأطلسية', es: 'Atún rojo del Atlántico', it: 'Tonno rosso atlantico' },
    nickname: 'ATLANTIC BLUEFIN',
    scientific: 'Thunnus thynnus',
    image: '/uploads/thon-rouge-atlantique.webp',
    maxLength: 400, maxWeight: 680, depth: '0 – 1000 m',
    habitat: ['pelagic'], techniques: ['jigging', 'trolling', 'livebait', 'popping'], season: [5, 6, 7, 8, 9, 10],
    description: {
      fr: "Le géant des grandes migrations : il traverse l'Atlantique et passe au large du Maroc entre le printemps et l'automne. Dos bleu nuit, flancs argentés, pinnules jaunes et une puissance qui use bras et matériel.",
      en: 'The giant of the great migrations: it crosses the Atlantic and passes off Morocco between spring and autumn. A midnight-blue back, silver flanks, yellow finlets and a power that wears out arms and tackle.',
      ar: 'عملاق الهجرات الكبرى: يعبر الأطلسي ويمر قبالة المغرب بين الربيع والخريف. ظهر أزرق داكن وجوانب فضية وزعيفات صفراء وقوة تُنهك الذراعين والمعدات.',
    },
    art: { shape: 'tuna', back: '#0b1e4a', belly: '#d9e3ee', fin: '#16285a', accent: '#f2c230' },
  }),
  F({
    slug: 'courbine', rarity: 'prized', zone: 'maroc',
    names: { fr: 'Maigre', en: 'Meagre', ar: 'الكوربين', es: 'Corvina', it: "Bocca d'oro" },
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
    slug: 'germon', rarity: 'prized', zone: 'maroc',
    names: { fr: 'Germon', en: 'Albacore', ar: 'التونة البيضاء', es: 'Atún blanco', it: 'Alalunga' },
    nickname: 'ALBACORE',
    scientific: 'Thunnus alalunga',
    image: '/uploads/germon.png',
    maxLength: 140, maxWeight: 60, depth: '0 – 600 m',
    habitat: ['pelagic'], techniques: ['trolling', 'jigging'], season: [],
    description: {
      fr: 'Le thon aux très longues pectorales. Il voyage en bancs immenses au large.',
      en: 'The tuna with extra-long pectoral fins. It travels in huge schools offshore.',
    },
    art: { shape: 'tuna', back: '#1a2f5c', belly: '#e9edf2', fin: '#2d4677', accent: '#8fb3e6', longPec: true },
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
    slug: 'voilier', rarity: 'legend', zone: 'monde',
    names: { fr: 'Voilier', en: 'Sailfish', ar: 'سمكة الشراع', es: 'Pez vela', it: 'Pesce vela' },
    nickname: 'SAILFISH',
    scientific: 'Istiophorus platypterus',
    image: '/uploads/voilier.png',
    maxLength: 340, maxWeight: 100, depth: '0 – 200 m',
    habitat: ['pelagic'], techniques: ['trolling', 'livebait'], season: [],
    description: {
      fr: "Sa voile dorsale géante se déploie pour rabattre les bancs. Le sprinteur de l'océan.",
      en: 'Its giant dorsal sail unfolds to herd baitfish. The sprinter of the ocean.',
    },
    art: { shape: 'sailfish', back: '#0f2c66', belly: '#e3ebf3', fin: '#1d4fbf', accent: '#5bc0ff', spots: true },
  }),
  F({
    slug: 'espadon', rarity: 'legend', zone: 'maroc',
    names: { fr: 'Espadon', en: 'Swordfish', ar: 'سمك أبو سيف', es: 'Pez espada', it: 'Pesce spada' },
    nickname: 'SWORDFISH',
    scientific: 'Xiphias gladius',
    image: '/uploads/espadon.png',
    maxLength: 455, maxWeight: 650, depth: '0 – 800 m',
    habitat: ['pelagic'], techniques: ['bottom', 'livebait'], season: [],
    description: {
      fr: "Gladiateur des profondeurs, il chasse de nuit à des centaines de mètres. Son épée plate le rend unique parmi les poissons à rostre.",
      en: 'Gladiator of the deep, hunting at night hundreds of metres down. Its flat sword makes it unique among billfish.',
    },
    art: { shape: 'sword', back: '#2c2440', belly: '#cfc7d9', fin: '#3a2f55', accent: '#8b7bb5' },
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
    slug: 'bonite', rarity: 'common', zone: 'maroc',
    names: { fr: 'Bonite à dos rayé', en: 'Atlantic bonito', ar: 'البونيت', es: 'Bonito', it: 'Palamita' },
    nickname: 'BONITE À DOS RAYÉ',
    scientific: 'Sarda sarda',
    image: '/uploads/bonite-v2.png',
    maxLength: 91, maxWeight: 11, depth: '0 – 200 m',
    habitat: ['pelagic', 'coastal'], techniques: ['spinning', 'jigging', 'trolling'], season: [],
    description: {
      fr: 'Petite cousine nerveuse du thon, rayée sur le dos. Elle déboule en bancs et donne des combats survoltés au léger.',
      en: "The tuna's wired little cousin, with a striped back. Arrives in schools and fights hard on light tackle.",
    },
    art: { shape: 'tuna', back: '#1b3a6b', belly: '#e6ebf0', fin: '#27497d', accent: '#0d2246', backStripes: true },
  }),
  F({
    slug: "bonite-thonine",
    rarity: "common",
    zone: "maroc",
    names: {"fr": "Bonite", "en": "Little tunny", "ar": "البونيت", "es": "Bacoreta", "it": "Tonnetto alletterato"},
    nickname: "BONITE",
    scientific: "Euthynnus alletteratus",
    maxLength: 122,
    maxWeight: 16,
    depth: "0 – 150 m",
    habitat: ["pelagic", "coastal"],
    techniques: ["spinning", "trolling", "jigging"],
    season: [],
    seas: ["atlantique", "mediterranee"],
    description: {"fr": "Petit thon nerveux aux marbrures bleues sur le dos. Il arrive en bancs et explose en surface sur les leurres : un combat rapide et puissant au léger.", "en": "A feisty little tuna with blue marbling on its back. It arrives in schools and explodes on surface lures: a fast, powerful fight on light tackle.", "ar": "تونة صغيرة نشيطة بخطوط زرقاء متموجة على ظهرها. تأتي في أسراب وتهاجم الطعوم السطحية بقوة: قتال سريع وعنيف."},
    image: "/uploads/bonite-thonine.png",
    art: {"shape": "tuna", "back": "#1f4f8a", "belly": "#e6ebf0", "fin": "#27497d", "accent": "#0d2246"},
  }),
  F({
    slug: "chinchard",
    rarity: "common",
    zone: "maroc",
    names: {"fr": "Chinchard", "en": "Horse mackerel", "ar": "الشرن", "es": "Jurel", "it": "Sugarello"},
    nickname: "HORSE MACKEREL",
    scientific: "Trachurus trachurus",
    bait: true,
    image: "/uploads/chinchard.png",
    maxLength: 70,
    maxWeight: 2,
    depth: "0 – 500 m",
    habitat: ["pelagic", "coastal"],
    techniques: ["spinning", "jigging", "livebait"],
    season: [],
    seas: ["atlantique", "mediterranee"],
    description: {"fr": "Petit pélagique aux grands yeux et à la ligne latérale cuirassée d'écailles. Très abondant au Maroc, c'est aussi l'un des meilleurs vifs pour les gros carnassiers.", "en": "A small big-eyed pelagic with a lateral line armoured in bony scutes. Very abundant in Morocco, and one of the best live baits for big predators.", "ar": "سمكة سطحية صغيرة بعيون كبيرة وخط جانبي مدرّع بالحراشف. وفيرة جدًا في المغرب، ومن أفضل الطعوم الحية للأسماك المفترسة الكبيرة."},
    art: {"shape": "jack", "back": "#4f7a7d", "belly": "#e9eef0", "fin": "#5d7f82", "accent": "#cfd8db"},
  }),
  F({
    slug: "maquereau",
    rarity: "common",
    zone: "maroc",
    names: {"fr": "Maquereau", "en": "Mackerel", "ar": "الإسقمري", "es": "Caballa", "it": "Sgombro"},
    nickname: "MACKEREL",
    scientific: "Scomber scombrus",
    bait: true,
    maxLength: 60,
    maxWeight: 3,
    depth: "0 – 200 m",
    habitat: ["pelagic", "coastal"],
    techniques: ["spinning", "jigging", "trolling"],
    season: [],
    seas: ["atlantique", "mediterranee"],
    description: {"fr": "Reconnaissable à ses zébrures vert-bleu sur le dos. Il chasse en bancs serrés : quand il est là, chaque lancer peut faire mouche, et c'est un vif parfait pour le thon.", "en": "Recognisable by the blue-green zebra stripes on its back. It hunts in tight schools: when it is around every cast can hook up, and it makes perfect live bait for tuna.", "ar": "يُعرف بخطوطه الخضراء الزرقاء على ظهره. يصطاد في أسراب متراصة، ويُعد طعمًا حيًا مثاليًا للتونة."},
    image: "/uploads/maquereau.png",
    art: {"shape": "tuna", "back": "#3c6b5a", "belly": "#e6ecee", "fin": "#4a6f62", "accent": "#14241d", "backStripes": true},
  }),
  F({
    slug: 'calamar', rarity: 'common', zone: 'maroc',
    names: { fr: 'Calamar vivant', en: 'Live calamari', ar: 'الكلمار الحي', es: 'Calamar vivo', it: 'Calamaro vivo' },
    nickname: 'CALAMARI',
    scientific: 'Loligo vulgaris',
    bait: true,
    image: '/uploads/calamar.webp',
    maxLength: 60, maxWeight: 2, depth: '0 – 500 m',
    habitat: ['coastal', 'pelagic'], techniques: ['jigging', 'livebait'], season: [10, 11, 12, 1, 2, 3],
    seas: ['atlantique', 'mediterranee'],
    description: {
      fr: "Pêché la nuit à la turlutte puis gardé vivant : aucun thon ni gros denté ne résiste à un calamar qui palpite au bout de la ligne. Le vif roi pour les géants.",
      en: 'Caught at night on squid jigs and kept alive: no tuna or big dentex can resist a squid pulsing on the line. The king of live baits for the giants.',
      ar: 'يُصطاد ليلًا بالطعم الصناعي الخاص ثم يُحفظ حيًا: لا تقاوم التونة ولا الدنتون الكبير كلمارًا ينبض في طرف الخيط. ملك الطعوم الحية للعمالقة.',
    },
    art: { shape: 'barracuda', back: '#e8cfc4', belly: '#f6ece6', fin: '#e2c2b5', accent: '#b0302a' },
  }),
  F({
    slug: 'choco', rarity: 'common', zone: 'maroc',
    names: { fr: 'Choco vivant', en: 'Live cuttlefish', ar: 'الشوكو الحي', es: 'Sepia viva', it: 'Seppia viva' },
    nickname: 'CHOCO',
    scientific: 'Sepia officinalis',
    bait: true,
    image: '/uploads/choco.webp',
    maxLength: 45, maxWeight: 4, depth: '0 – 200 m',
    habitat: ['coastal', 'reef'], techniques: ['bottom', 'livebait'], season: [2, 3, 4, 5],
    seas: ['atlantique', 'mediterranee'],
    description: {
      fr: "La seiche, le « choco » des pêcheurs marocains. Vivante, elle change de couleur et attire les mérous, dentés et courbines qui chassent près du fond.",
      en: 'The cuttlefish, the "choco" of Moroccan anglers. Alive it keeps changing colour and draws in the groupers, dentex and meagre hunting near the bottom.',
      ar: 'السيبيا، «الشوكو» عند الصيادين المغاربة. وهي حية تغيّر لونها وتجذب الهامور والدنتون والقرب التي تصطاد قرب القاع.',
    },
    art: { shape: 'grouper', back: '#7a3424', belly: '#c98a6a', fin: '#5e2a1e', accent: '#e9d3c4' },
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
    "slug": "almaco-jack",
    "rarity": "prized",
    "zone": "maroc",
    "names": {
      "fr": "Almaco Jack",
      "en": "Almaco Jack",
      "ar": "السريولا الألماكو",
      "es": "Medregal limón",
      "it": "Ricciola falcata"
    },
    "nickname": "ALMACO",
    "scientific": "Seriola rivoliana",
    "maxLength": 160,
    "maxWeight": 60,
    "depth": "5 – 250 m",
    "habitat": [
      "pelagic",
      "reef"
    ],
    "techniques": [
      "jigging",
      "livebait"
    ],
    "season": [],
    "seas": [
      "atlantique",
      "indonesie"
    ],
    "description": {
      "fr": "Cousine de la sériole, plus haute et plus foncée, avec une bande sombre au-dessus de l'œil. Elle tient les tombants et les épaves profondes et plonge dès la touche.",
      "en": "A cousin of the amberjack, deeper-bodied and darker, with a dark band above the eye. It holds deep drop-offs and wrecks and dives as soon as it is hooked.",
      "ar": "قريبة السريولا، بجسم أعلى ولون أغمق وشريط داكن فوق العين. تلازم المنحدرات والحطام العميقة وتغوص فور علوقها."
    },
    "image": "/uploads/almaco-jack.webp",
    "art": {
      "shape": "jack",
      "back": "#4a4f58",
      "belly": "#cfd3d8",
      "fin": "#3a3e45",
      "accent": "#8a8f98"
    }
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
    slug: 'badekhou', rarity: 'legend', zone: 'maroc',
    names: { fr: 'Dusky Grouper', en: 'Dusky grouper', ar: 'البادخو', es: 'Mero', it: 'Cernia bruna' },
    nickname: 'BADEKHOU',
    scientific: 'Epinephelus marginatus',
    image: '/uploads/badekhou.png',
    maxLength: 150, maxWeight: 60, depth: '8 – 300 m',
    habitat: ['reef'], techniques: ['jigging', 'livebait', 'bottom'], season: [],
    seas: ['atlantique', 'mediterranee'],
    description: {
      fr: "Le « Badekhou », géant des roches marocaines à la robe marbrée de brun et d'or. Une fois piqué, il fonce dans son trou : tout se joue dans les premiers mètres.",
      en: 'The "Badekhou", giant of the Moroccan rocks with a brown-and-gold marbled coat. Once hooked it bolts for its hole: everything is decided in the first metres.',
      ar: 'البادخو، عملاق الصخور المغربية بلونه البني المرقط بالذهبي. عندما يعلق يندفع نحو جحره: كل شيء يُحسم في الأمتار الأولى.',
    },
    art: { shape: 'grouper', back: '#5a3d2b', belly: '#c9a77e', fin: '#4a3020', accent: '#e6d0a8', blotches: true },
  }),
  F({
    "slug": "broomtail-grouper",
    "rarity": "legend",
    "zone": "monde",
    "names": {
      "fr": "Broomtail Grouper",
      "en": "Broomtail Grouper",
      "ar": "الهامور ذو الذيل المكنسي",
      "es": "Garropa",
      "it": "Cernia coda di scopa"
    },
    "nickname": "BROOMTAIL",
    "scientific": "Mycteroperca xenarcha",
    "maxLength": 150,
    "maxWeight": 45,
    "depth": "0 – 75 m",
    "habitat": [
      "reef",
      "coastal"
    ],
    "techniques": [
      "livebait",
      "jigging",
      "bottom"
    ],
    "season": [],
    "seas": [],
    "description": {
      "fr": "Grand mérou du Pacifique Est à la robe marbrée et à la queue frangée « en balai ». Il guette près des roches et des épaves : une fois piqué, il faut l'arracher du fond.",
      "en": "A big Eastern Pacific grouper with a marbled body and a ragged, broom-like tail. It lurks by rocks and wrecks: once hooked, you have to tear it off the bottom.",
      "ar": "هامور كبير من شرق الهادئ بجسم مرقش وذيل مهدب كالمكنسة. يتربص قرب الصخور والحطام: بعد علوقه يجب انتزاعه من القاع."
    },
    "image": "/uploads/broomtail-grouper.webp",
    "art": {
      "shape": "grouper",
      "back": "#5a3e30",
      "belly": "#d8c49a",
      "fin": "#4a3026",
      "accent": "#e8d8a8",
      "spots": true
    }
  }),
  F({
    "slug": "gorgeous-swallowtail",
    "rarity": "prized",
    "zone": "monde",
    "names": {
      "fr": "Gorgeous Swallowtail",
      "en": "Gorgeous Swallowtail",
      "ar": "الأنثياس الرائع",
      "es": "Anthias de Natal",
      "it": "Anthias del Natal"
    },
    "nickname": "SWALLOWTAIL",
    "scientific": "Meganthias natalensis",
    "maxLength": 45,
    "maxWeight": 2,
    "depth": "50 – 200 m",
    "habitat": [
      "reef"
    ],
    "techniques": [
      "bottom",
      "jigging"
    ],
    "season": [],
    "seas": [
      "indonesie"
    ],
    "description": {
      "fr": "Un joyau des récifs profonds : robe orange et rose, nageoires jaunes et longue queue en hirondelle. Rare au bout de la ligne, on le remonte au jig lent ou à l'appât.",
      "en": "A jewel of the deep reefs: an orange and pink body, yellow fins and a long swallow tail. Rarely caught, it comes up on slow jigs or bait.",
      "ar": "جوهرة الشعاب العميقة: جسم برتقالي ووردي وزعانف صفراء وذيل طويل كذيل السنونو. نادر الصيد، يُصطاد بالجيغ البطيء أو الطُعم."
    },
    "image": "/uploads/gorgeous-swallowtail.webp",
    "art": {
      "shape": "bream",
      "back": "#f0603a",
      "belly": "#f7c6b0",
      "fin": "#ffd21f",
      "accent": "#ff8fa0"
    }
  }),
  F({
    "slug": "mafou",
    "rarity": "prized",
    "zone": "monde",
    "names": {
      "fr": "Mafou",
      "en": "Cobia",
      "ar": "الكوبيا",
      "es": "Cobia",
      "it": "Cobia"
    },
    "nickname": "COBIA",
    "scientific": "Rachycentron canadum",
    "image": "/uploads/mafou.webp",
    "maxLength": 200,
    "maxWeight": 78,
    "depth": "0 – 50 m",
    "habitat": [
      "pelagic",
      "coastal"
    ],
    "techniques": [
      "livebait",
      "jigging"
    ],
    "season": [],
    "seas": [
      "atlantique",
      "mer-rouge",
      "mer-oman",
      "golfe",
      "indonesie"
    ],
    "description": {
      "fr": "Silhouette de requin, bande blanche le long du flanc et une puissance redoutable. Le cobia suit souvent les raies et les objets flottants, et se méfie rarement d'un beau vif.",
      "en": "Shark-like silhouette, a white stripe along the flank and formidable power. Cobia often follow rays and floating objects, and rarely refuse a good live bait.",
      "ar": "هيئة تشبه القرش، شريط أبيض على طول الجانب وقوة هائلة. يتبع الكوبيا غالبًا أسماك الراي والأجسام العائمة، ونادرًا ما يرفض طعمًا حيًا جيدًا."
    },
    "art": {
      "shape": "shark",
      "back": "#3d3328",
      "belly": "#e8e2d6",
      "fin": "#2e271f",
      "accent": "#f1ead9",
      "band": true
    }
  }),
  F({
    "slug": "saumonee-leopard",
    "rarity": "legend",
    "zone": "monde",
    "names": {
      "fr": "Saumonée léopard",
      "en": "Coral trout",
      "ar": "هامور المرجان",
      "es": "Mero leopardo",
      "it": "Cernia leopardo"
    },
    "nickname": "CORAL TROUT",
    "scientific": "Plectropomus leopardus",
    "image": "/uploads/saumonee-leopard.webp",
    "maxLength": 120,
    "maxWeight": 23.6,
    "depth": "3 – 100 m",
    "habitat": [
      "reef"
    ],
    "techniques": [
      "jigging",
      "livebait",
      "popping"
    ],
    "season": [],
    "seas": [
      "indonesie"
    ],
    "description": {
      "fr": "Le joyau des récifs coralliens du Pacifique : robe rouge vif criblée de points bleus. Il attaque comme une flèche puis fonce dans le corail.",
      "en": "The jewel of Pacific coral reefs: bright red coat peppered with blue dots. It strikes like an arrow, then bolts for the coral.",
      "ar": "جوهرة الشعاب المرجانية في المحيط الهادئ: لون أحمر زاهٍ مرصع بنقاط زرقاء. يهاجم كالسهم ثم يندفع نحو المرجان."
    },
    "art": {
      "shape": "grouper",
      "back": "#c2412f",
      "belly": "#e8846e",
      "fin": "#a8341f",
      "accent": "#5ab4f0",
      "spots": true
    }
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
    "slug": "gros-dente-rose",
    "rarity": "prized",
    "zone": "maroc",
    "names": {
      "fr": "Gros denté rose",
      "en": "Pink dentex",
      "ar": "الدنتي الوردي",
      "es": "Sama de pluma",
      "it": "Dentice gibboso"
    },
    "nickname": "SAMA",
    "scientific": "Dentex gibbosus",
    "image": "/uploads/gros-dente-rose-v2.webp",
    "maxLength": 106,
    "maxWeight": null,
    "depth": "20 – 220 m",
    "habitat": [
      "reef"
    ],
    "techniques": [
      "jigging",
      "livebait"
    ],
    "season": [],
    "seas": [
      "atlantique",
      "mediterranee"
    ],
    "description": {
      "fr": "Le grand denté rose : le mâle adulte porte une bosse bien marquée sur le front, les jeunes arborent de longs filaments sur la dorsale. Un carnassier des fonds rocheux, puissant au jig comme au vif.",
      "en": "The big pink dentex: adult males carry a pronounced hump on the forehead, juveniles have long filaments on the dorsal fin. A rocky-bottom predator that fights hard on jigs and live bait.",
      "ar": "الدنتي الوردي الكبير: يحمل الذكر البالغ حدبة واضحة على الجبهة، وللصغار خيوط طويلة على الزعنفة الظهرية. مفترس القيعان الصخرية، قوي على الجيغ والطعم الحي."
    },
    "art": {
      "shape": "bream",
      "back": "#b0605a",
      "belly": "#f2d6cf",
      "fin": "#c07466",
      "accent": "#e0a090"
    }
  }),
  F({
    "slug": "dente-tache-rouge",
    "rarity": "prized",
    "zone": "maroc",
    "names": {
      "fr": "Denté à tache rouge",
      "en": "Canary dentex",
      "ar": "الدنتي الكناري",
      "es": "Chacarona",
      "it": "Dentice delle Canarie"
    },
    "nickname": "CHACARONA",
    "scientific": "Dentex canariensis",
    "image": "/uploads/dente-tache-rouge-v2.webp",
    "maxLength": null,
    "maxWeight": null,
    "depth": "15 – 200 m",
    "habitat": [
      "reef"
    ],
    "techniques": [
      "jigging",
      "bottom"
    ],
    "season": [],
    "seas": [
      "atlantique"
    ],
    "description": {
      "fr": "Le denté de l'Atlantique africain, robe argentée et petite tache rouge à la base de la dorsale. On le croise du Maroc jusqu'au Golfe de Guinée.",
      "en": "The dentex of the African Atlantic, silvery with a small red spot at the base of the dorsal fin. Found from Morocco down to the Gulf of Guinea.",
      "ar": "دنتي الأطلسي الإفريقي، فضي اللون مع بقعة حمراء صغيرة عند قاعدة الزعنفة الظهرية. يوجد من المغرب حتى خليج غينيا."
    },
    "art": {
      "shape": "bream",
      "back": "#b9b3b6",
      "belly": "#f4f1f0",
      "fin": "#dcc6c6",
      "accent": "#d33a3a"
    }
  }),
  F({
    slug: 'pageot-royal', rarity: 'prized', zone: 'maroc',
    names: { fr: 'Pageot royal', en: 'Redbanded seabream', ar: 'البغروس الملكي', es: 'Hurta', it: 'Pagro reale' },
    nickname: 'PAGEOT ROYAL',
    scientific: 'Pagrus auriga',
    image: '/uploads/pageot-royal.png',
    maxLength: 80, maxWeight: null, depth: '10 – 170 m',
    habitat: ['reef', 'coastal'], techniques: ['bottom', 'jigging', 'livebait'], season: [],
    seas: ['atlantique', 'mediterranee'],
    description: {
      fr: 'Le grand cousin du pagre, rouge vif avec des bandes sombres chez les jeunes. Il vit sur les fonds rocheux et livre un combat puissant au jig comme au vif.',
      en: 'The big cousin of the red porgy, bright red with dark bands when young. It lives over rocky bottoms and fights hard on jigs and live bait.',
      ar: 'القريب الكبير للبغروس، أحمر زاهٍ مع أشرطة داكنة عند الصغار. يعيش في القيعان الصخرية ويقاوم بقوة على الجيغ والطعم الحي.',
    },
    art: { shape: 'bream', back: '#c2412f', belly: '#f6d9cf', fin: '#d4553e', accent: '#7fbcef' },
  }),
  F({
    "slug": "catalineta",
    "rarity": "common",
    "zone": "maroc",
    "names": {
      "fr": "Catalineta",
      "en": "Redbanded seabream (juvenile)",
      "ar": "الكاتالينيتا",
      "es": "Catalineta",
      "it": "Pagro reale (giovane)"
    },
    "nickname": "CATALINETA",
    "scientific": "Pagrus auriga",
    "image": "/uploads/catalineta.webp",
    "maxLength": null,
    "maxWeight": null,
    "depth": "5 – 80 m",
    "habitat": [
      "reef",
      "coastal"
    ],
    "techniques": [
      "bottom",
      "jigging"
    ],
    "season": [],
    "seas": [
      "atlantique",
      "mediterranee"
    ],
    "description": {
      "fr": "Le jeune Pageot royal : de larges bandes rouges sur une robe argentée et de longs filaments sur la dorsale. En grandissant, les bandes s'estompent et il devient le Pageot royal.",
      "en": "The young redbanded seabream: wide red bands on a silver body and long filaments on the dorsal fin. As it grows the bands fade and it becomes the adult redbanded seabream.",
      "ar": "صغير البغروس الملكي: أشرطة حمراء عريضة على جسم فضي وخيوط طويلة على الزعنفة الظهرية. مع النمو تتلاشى الأشرطة ويصبح بغروسًا ملكيًا."
    },
    "art": {
      "shape": "bream",
      "back": "#e0552e",
      "belly": "#f4eeea",
      "fin": "#ec6a3c",
      "accent": "#ffffff",
      "bars": true
    }
  }),
  F({
    "slug": "pageot-commun",
    "rarity": "common",
    "zone": "maroc",
    "names": {
      "fr": "Pageot commun",
      "en": "Common pandora",
      "ar": "الباجو الشائع",
      "es": "Breca",
      "it": "Pagello fragolino"
    },
    "nickname": "BRECA",
    "scientific": "Pagellus erythrinus",
    "image": "/uploads/pageot-commun-v2.webp",
    "maxLength": 60,
    "maxWeight": null,
    "depth": "20 – 300 m",
    "habitat": [
      "reef",
      "coastal"
    ],
    "techniques": [
      "bottom",
      "jigging"
    ],
    "season": [],
    "seas": [
      "atlantique",
      "mediterranee"
    ],
    "description": {
      "fr": "Le petit cousin rose des pagres, sans gros crocs, avec de fines taches bleutées sur le dos. Très présent sur les côtes marocaines, il mord volontiers au fond et au petit jig.",
      "en": "The small pink cousin of the porgies, without big fangs and with fine bluish dots on the back. Very common on Moroccan coasts, it bites readily on bottom rigs and small jigs.",
      "ar": "القريب الوردي الصغير للبغروس، بلا أنياب كبيرة ومع نقاط زرقاء دقيقة على الظهر. منتشر جدًا على السواحل المغربية ويلتقط الطعم بسهولة في القاع وعلى الجيغ الصغير."
    },
    "art": {
      "shape": "bream",
      "back": "#d58a86",
      "belly": "#f8e3df",
      "fin": "#e2a09a",
      "accent": "#7fbcef",
      "spots": true
    }
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
    "slug": "vivaneau-cubera",
    "rarity": "legend",
    "zone": "monde",
    "names": {
      "fr": "Cubera Snapper",
      "en": "Cubera Snapper",
      "ar": "النهاش الكوبيري",
      "es": "Pargo cubera",
      "it": "Lutiano cubera"
    },
    "nickname": "CUBERA",
    "scientific": "Lutjanus cyanopterus",
    "image": "/uploads/vivaneau-cubera.webp",
    "maxLength": 160,
    "maxWeight": 57,
    "depth": "18 – 55 m",
    "habitat": [
      "reef"
    ],
    "techniques": [
      "livebait",
      "jigging"
    ],
    "season": [],
    "seas": [
      "atlantique"
    ],
    "description": {
      "fr": "Le plus grand des vivaneaux, des Caraïbes au Brésil. Des crocs impressionnants et une force brute : sur les épaves, le combat se gagne dès les premiers mètres.",
      "en": "The biggest of the snappers, from the Caribbean to Brazil. Impressive fangs and raw power: over wrecks, the fight is won in the first metres.",
      "ar": "أكبر أسماك النهاش، من الكاريبي إلى البرازيل. أنياب مخيفة وقوة هائلة: فوق الحطام تُحسم المعركة في الأمتار الأولى."
    },
    "art": {
      "shape": "bass",
      "back": "#6b4a45",
      "belly": "#d9b4a6",
      "fin": "#5a3c37",
      "accent": "#c96d5a"
    }
  }),
  F({
    "slug": "colorado-snapper",
    "rarity": "prized",
    "zone": "monde",
    "names": {
      "fr": "Colorado Snapper",
      "en": "Colorado Snapper",
      "ar": "النهاش الكولورادو",
      "es": "Pargo colorado",
      "it": "Lutiano colorado"
    },
    "nickname": "COLORADO",
    "scientific": "Lutjanus colorado",
    "maxLength": 91,
    "maxWeight": 15,
    "depth": "1 – 90 m",
    "habitat": [
      "reef",
      "coastal"
    ],
    "techniques": [
      "livebait",
      "jigging",
      "bottom"
    ],
    "season": [],
    "seas": [],
    "description": {
      "fr": "Vivaneau rouge vif du Pacifique Est, puissant et méfiant. Il chasse près des roches et des mangroves et file vers son abri à la moindre touche.",
      "en": "A bright red Eastern Pacific snapper, strong and wary. It hunts near rocks and mangroves and bolts for cover at the slightest bite.",
      "ar": "نهاش أحمر زاهٍ من شرق الهادئ، قوي وحذر. يصطاد قرب الصخور والمانغروف ويندفع نحو مخبئه عند أدنى لمسة."
    },
    "image": "/uploads/colorado-snapper.webp",
    "art": {
      "shape": "bass",
      "back": "#e0401e",
      "belly": "#f7a080",
      "fin": "#ff5a2a",
      "accent": "#ffd0a0"
    }
  }),
  F({
    "slug": "rock-snapper",
    "rarity": "prized",
    "zone": "monde",
    "names": {
      "fr": "Rock Snapper",
      "en": "Rock Snapper",
      "ar": "نهاش الصخور",
      "es": "Pargo mulato",
      "it": "Lutiano di roccia"
    },
    "nickname": "BARRED PARGO",
    "scientific": "Hoplopagrus guentherii",
    "maxLength": 90,
    "maxWeight": 12,
    "depth": "1 – 30 m",
    "habitat": [
      "reef",
      "coastal"
    ],
    "techniques": [
      "livebait",
      "bottom",
      "jigging"
    ],
    "season": [],
    "seas": [],
    "description": {
      "fr": "Vivaneau trapu aux larges bandes sombres, roi des fonds rocheux peu profonds. Une attaque brutale, puis il plonge droit dans les trous : il faut bloquer fort.",
      "en": "A stocky snapper with wide dark bars, king of shallow rocky bottoms. A brutal strike, then it dives straight into the holes: you have to lock up hard.",
      "ar": "نهاش ممتلئ بخطوط داكنة عريضة، ملك القيعان الصخرية الضحلة. هجوم عنيف ثم يغوص مباشرة في الشقوق: يجب الشد بقوة."
    },
    "image": "/uploads/rock-snapper.webp",
    "art": {
      "shape": "bass",
      "back": "#8a4a2a",
      "belly": "#e89a6a",
      "fin": "#b8902a",
      "accent": "#f0c070",
      "bars": true
    }
  }),
  F({
    "slug": "thazard-atlantique",
    "rarity": "prized",
    "zone": "monde",
    "names": {
      "fr": "Spanish Mackerel",
      "en": "Atlantic Spanish mackerel",
      "ar": "الكنعد الأطلسي",
      "es": "Carite atlántico",
      "it": "Sgombro reale atlantico"
    },
    "nickname": "SPANISH MACKEREL",
    "scientific": "Scomberomorus maculatus",
    "image": "/uploads/thazard-atlantique.webp",
    "maxLength": 91,
    "maxWeight": 5.9,
    "depth": "10 – 35 m",
    "habitat": [
      "pelagic",
      "coastal"
    ],
    "techniques": [
      "trolling",
      "spinning",
      "livebait"
    ],
    "season": [],
    "seas": [
      "atlantique"
    ],
    "description": {
      "fr": "Le « Spanish mackerel » de l'Atlantique ouest : flancs argentés semés de taches dorées, dents acérées et départs fulgurants. Un régal à la traîne légère et au lancer.",
      "en": "The Spanish mackerel of the western Atlantic: silver flanks dotted with golden spots, sharp teeth and blistering runs. Great fun on light trolling and casting gear.",
      "ar": "الكنعد الإسباني لغرب الأطلسي: جوانب فضية مرصعة ببقع ذهبية وأسنان حادة وانطلاقات خاطفة. ممتع جدًا على الجر الخفيف والرمي."
    },
    "art": {
      "shape": "wahoo",
      "back": "#3a6f6a",
      "belly": "#eef2f4",
      "fin": "#3a5a55",
      "accent": "#d9a53a",
      "spots": true
    }
  }),
  F({
    "slug": "thazard-royal",
    "rarity": "prized",
    "zone": "monde",
    "names": {
      "fr": "Thazard royal",
      "en": "King mackerel",
      "ar": "الكنعد الملكي",
      "es": "Carite lucio",
      "it": "Sgombro reale"
    },
    "nickname": "KING MACKEREL",
    "scientific": "Scomberomorus cavalla",
    "maxLength": 184,
    "maxWeight": 45,
    "depth": "5 – 140 m",
    "habitat": [
      "pelagic",
      "coastal"
    ],
    "techniques": [
      "trolling",
      "livebait",
      "spinning"
    ],
    "season": [],
    "seas": [
      "atlantique"
    ],
    "description": {
      "fr": "Le plus grand des thazards : un corps fuselé gris acier, des dents tranchantes comme des rasoirs et des départs foudroyants. Il attaque les appâts vivants et les leurres traînés en surface, souvent par un saut spectaculaire.",
      "en": "The biggest of the Spanish mackerels: a steel-grey torpedo body, razor-sharp teeth and blistering runs. It hits live baits and trolled lures near the surface, often with a spectacular leap.",
      "ar": "أكبر أسماك الكنعد: جسم انسيابي رمادي فولاذي وأسنان حادة كالشفرات وانطلاقات خاطفة. يهاجم الطعم الحي والطعوم المجرورة قرب السطح، غالبًا بقفزة مذهلة."
    },
    "image": "/uploads/thazard-royal.webp",
    "art": {
      "shape": "wahoo",
      "back": "#3b5f86",
      "belly": "#e3e8ee",
      "fin": "#4a5d72",
      "accent": "#9db3c8"
    }
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
    slug: 'wahoo', rarity: 'prized', zone: 'monde',
    names: { fr: 'Thazard-bâtard', en: 'Wahoo', ar: 'الواهو', es: 'Peto', it: 'Acantocibio' },
    nickname: 'WAHOO',
    scientific: 'Acanthocybium solandri',
    image: '/uploads/wahoo.png',
    maxLength: 250, maxWeight: 83, depth: '0 – 20 m',
    habitat: ['pelagic'], techniques: ['trolling'], season: [],
    description: {
      fr: "L'un des poissons les plus rapides au monde. Le moulinet hurle dès la touche.",
      en: 'One of the fastest fish in the world. The reel screams from the first second.',
    },
    art: { shape: 'wahoo', back: '#173d73', belly: '#dfe8f1', fin: '#1d4d8a', accent: '#5aa0e6', bars: true },
  }),
  F({
    slug: 'barracuda', rarity: 'common', zone: 'maroc',
    names: { fr: 'Barracuda', en: 'Barracuda', ar: 'الباراكودا', es: 'Barracuda', it: 'Barracuda' },
    nickname: 'BARRACUDA',
    scientific: 'Sphyraena viridensis',
    image: '/uploads/barracuda.png',
    maxLength: 130, maxWeight: 12, depth: '0 – 100 m',
    habitat: ['coastal', 'reef'], techniques: ['spinning', 'trolling'], season: [],
    description: {
      fr: 'Le fusil de la mer : long, rapide et armé de dents tranchantes. Attaques éclair sur les leurres.',
      en: 'The rifle of the sea: long, fast and armed with razor teeth. Lightning strikes on lures.',
    },
    art: { shape: 'barracuda', back: '#3d5468', belly: '#e9eef2', fin: '#4a6176', accent: '#26394b', bars: true },
  }),
  F({
    "slug": "thazard-blanc",
    "rarity": "prized",
    "zone": "maroc",
    "names": {
      "fr": "Thazard blanc",
      "en": "West African Spanish mackerel",
      "ar": "الكنعد الأبيض",
      "es": "Carite lusitánico",
      "it": "Sgombro reale africano"
    },
    "nickname": "THAZARD",
    "scientific": "Scomberomorus tritor",
    "image": "/uploads/thazard-blanc.webp",
    "maxLength": 100,
    "maxWeight": 6,
    "depth": "0 – 40 m",
    "habitat": [
      "pelagic",
      "coastal"
    ],
    "techniques": [
      "trolling",
      "livebait",
      "spinning"
    ],
    "season": [],
    "seas": [
      "atlantique",
      "mediterranee"
    ],
    "description": {
      "fr": "Le « Spanish mackerel » de l'Atlantique africain : corps fuselé, taches dorées et dents tranchantes comme des rasoirs. Rapide et nerveux à la traîne.",
      "en": "The Spanish mackerel of the African Atlantic: torpedo body, golden spots and razor-sharp teeth. Fast and nervous on the troll.",
      "ar": "الكنعد الإسباني للأطلسي الإفريقي: جسم انسيابي وبقع ذهبية وأسنان حادة كالشفرات. سريع وعصبي على الجر."
    },
    "art": {
      "shape": "wahoo",
      "back": "#2f5f8f",
      "belly": "#eaf0f5",
      "fin": "#2a5a85",
      "accent": "#d8b24a",
      "spots": true
    }
  }),
  F({
    "slug": "orphie",
    "rarity": "common",
    "zone": "maroc",
    "names": {
      "fr": "Orphie",
      "en": "Garfish",
      "ar": "سمك الإبرة",
      "es": "Aguja",
      "it": "Aguglia"
    },
    "nickname": "NEEDLEFISH",
    "scientific": "Belone belone",
    "maxLength": 94,
    "maxWeight": 1.3,
    "depth": "0 – 10 m",
    "habitat": [
      "pelagic",
      "coastal"
    ],
    "techniques": [
      "spinning"
    ],
    "season": [],
    "seas": [
      "atlantique",
      "mediterranee"
    ],
    "description": {
      "fr": "Long poisson-aiguille au bec effilé garni de petites dents, au dos vert-bleu et aux arêtes vertes. Il chasse en surface et enchaîne les sauts une fois ferré.",
      "en": "A long needle-shaped fish with a thin beak full of small teeth, a blue-green back and green bones. It hunts at the surface and leaps again and again once hooked.",
      "ar": "سمكة طويلة على شكل إبرة بمنقار رفيع مليء بأسنان صغيرة وظهر أخضر مزرق وعظام خضراء. تصطاد على السطح وتقفز مرارًا بعد علوقها."
    },
    "image": "/uploads/orphie.webp",
    "art": {
      "shape": "barracuda",
      "back": "#2f6a6a",
      "belly": "#e8eef0",
      "fin": "#9aa38a",
      "accent": "#4a8a8a"
    }
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
    slug: "loup-mouchete",
    rarity: "prized",
    zone: "maroc",
    names: {"fr": "Loup moucheté", "en": "Spotted seabass", "ar": "القاروس المرقط", "es": "Baila", "it": "Spigola maculata"},
    nickname: "LOUP MOUCHETÉ",
    scientific: "Dicentrarchus punctatus",
    maxLength: 70,
    maxWeight: 5,
    depth: "0 – 30 m",
    habitat: ["coastal", "surf"],
    techniques: ["spinning", "livebait"],
    season: [],
    seas: ["atlantique", "mediterranee"],
    description: {"fr": "Le cousin tacheté du bar, couvert de points noirs sur le dos. Il chasse dans les vagues et les estuaires, très présent sur les côtes marocaines.", "en": "The spotted cousin of the seabass, covered in black dots on its back. It hunts in the surf and estuaries and is common on Moroccan coasts.", "ar": "القريب المرقط للقاروس، تغطي ظهره نقاط سوداء. يصطاد في الأمواج والمصبات ويكثر على السواحل المغربية."},
    image: "/uploads/loup-mouchete-v2.png",
    art: {"shape": "bass", "back": "#7a8578", "belly": "#eef1ee", "fin": "#8e978c", "accent": "#1d2320", "spots": true},
  }),
  F({
    slug: 'sar', rarity: 'common', zone: 'maroc',
    names: { fr: 'Sar commun', en: 'White seabream', ar: 'الشرغو', es: 'Sargo', it: 'Sarago maggiore' },
    nickname: 'SAR',
    scientific: 'Diplodus sargus',
    image: '/uploads/sar.png',
    maxLength: 45, maxWeight: 1.9, depth: '0 – 50 m',
    habitat: ['coastal', 'reef'], techniques: ['bottom', 'spinning'], season: [],
    description: {
      fr: "Le combattant des roches battues par l'écume, rayé de noir. Petit mais teigneux.",
      en: 'The black-barred fighter of foam-beaten rocks. Small but feisty.',
    },
    art: { shape: 'bream', back: '#8f99a3', belly: '#f2f4f6', fin: '#2a2f35', accent: '#1d2125', bars: true },
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
    slug: "dorade-grise",
    rarity: "common",
    zone: "maroc",
    names: {"fr": "Dorade grise", "en": "Black seabream", "ar": "الدوراد الرمادي", "es": "Chopa", "it": "Tanuta"},
    nickname: "ORATA",
    scientific: "Spondyliosoma cantharus",
    maxLength: 60,
    maxWeight: 1.8,
    depth: "0 – 300 m",
    habitat: ["coastal", "reef"],
    techniques: ["bottom", "spinning"],
    season: [],
    seas: ["atlantique", "mediterranee"],
    description: {"fr": "La cousine grise de la dorade royale, au dos sombre rayé de fines lignes dorées. Elle vit en bancs près des roches et des herbiers : une pêche fine et nerveuse.", "en": "The grey cousin of the gilthead, with a dark back lined in fine golden stripes. It schools near rocks and seagrass: delicate, lively fishing.", "ar": "القريبة الرمادية للدوراد الملكي، بظهر داكن تزينه خطوط ذهبية رفيعة. تعيش في أسراب قرب الصخور والأعشاب البحرية."},
    image: "/uploads/dorade-grise.png",
    art: {"shape": "bream", "back": "#5c5f5a", "belly": "#d9dbd6", "fin": "#4d504b", "accent": "#a69a6c"},
  }),
  F({
    slug: "abadeche",
    rarity: "prized",
    zone: "maroc",
    names: {"fr": "Abadèche", "en": "Wreckfish", "ar": "الأبادش", "es": "Cherna", "it": "Cernia di fondale"},
    nickname: "ABADÈCHE",
    scientific: "Polyprion americanus",
    maxLength: 210,
    maxWeight: 100,
    depth: "40 – 600 m",
    habitat: ["reef", "pelagic"],
    techniques: ["bottom", "jigging", "livebait"],
    season: [],
    seas: ["atlantique", "mediterranee"],
    description: {"fr": "Le cerbère des épaves et des tombants profonds : massif, gris argenté, il peut dépasser les 50 kg. Une pêche lourde, au fond, qui se mérite.", "en": "The guardian of deep wrecks and drop-offs: massive and silver-grey, it can top 50 kg. Heavy deep fishing that has to be earned.", "ar": "حارس الحطام والمنحدرات العميقة: ضخم ورمادي فضي، قد يتجاوز 50 كغ. صيد ثقيل في القاع يحتاج إلى صبر."},
    image: "/uploads/abadeche-v2.png",
    art: {"shape": "grouper", "back": "#5d6470", "belly": "#c9ced6", "fin": "#4b525d", "accent": "#8d949e"},
  }),
  F({
    slug: "saint-pierre-metallise",
    rarity: "prized",
    zone: "maroc",
    names: {"fr": "Saint-Pierre Métallisé", "en": "Silvery John Dory", "ar": "سمك القديس بطرس الفضي", "es": "Pez de San Pedro plateado", "it": "Pesce San Pietro argentato"},
    nickname: "SILVER DORY",
    scientific: "Zenopsis conchifer",
    maxLength: 80,
    maxWeight: null,
    depth: "50 – 600 m",
    habitat: ["pelagic"],
    techniques: ["bottom", "jigging"],
    season: [],
    seas: ["atlantique", "mediterranee"],
    description: {"fr": "Le cousin argenté du Saint-Pierre, à la robe métallique et aux longs rayons dorsaux. Il vit plus profond, sur les tombants du large.", "en": "The silver cousin of the John Dory, with a metallic coat and long dorsal spines. It lives deeper, on offshore drop-offs.", "ar": "القريب الفضي لسمك القديس بطرس، بلون معدني وأشواك ظهرية طويلة. يعيش في أعماق أكبر على المنحدرات البحرية."},
    image: "/uploads/saint-pierre-metallise.png",
    art: {"shape": "bream", "back": "#8b939c", "belly": "#e9edf0", "fin": "#5e656d", "accent": "#c9d0d6", "deep": true},
  }),
  F({
    slug: "saint-pierre",
    rarity: "prized",
    zone: "maroc",
    names: {"fr": "Saint-Pierre", "en": "John Dory", "ar": "سمك القديس بطرس", "es": "Pez de San Pedro", "it": "Pesce San Pietro"},
    nickname: "JOHN DORY",
    scientific: "Zeus faber",
    maxLength: 90,
    maxWeight: 8,
    depth: "5 – 400 m",
    habitat: ["coastal", "reef"],
    techniques: ["bottom", "jigging", "livebait"],
    season: [],
    seas: ["atlantique", "mediterranee"],
    description: {"fr": "Reconnaissable entre mille à la tache noire sur son flanc, l'« empreinte du pouce de saint Pierre ». Corps plat, grande bouche qui se projette pour aspirer ses proies : un chasseur à l'affût.", "en": "Instantly recognisable by the black spot on its flank, \"Saint Peter's thumbprint\". Flat body and a huge mouth that shoots forward to suck in prey: an ambush hunter.", "ar": "يُعرف فورًا بالبقعة السوداء على جانبه، «بصمة إبهام القديس بطرس». جسم مسطح وفم كبير يندفع إلى الأمام لابتلاع فرائسه: صياد يتربص."},
    image: "/uploads/saint-pierre.png",
    art: {"shape": "bream", "back": "#6b5a3a", "belly": "#c9b48a", "fin": "#5a4a30", "accent": "#141414", "deep": true},
  }),
  F({
    slug: "turbot",
    rarity: "prized",
    zone: "maroc",
    names: {"fr": "Turbot", "en": "Turbot", "ar": "سمك الترس", "es": "Rodaballo", "it": "Rombo chiodato"},
    nickname: "TURBOT",
    scientific: "Scophthalmus maximus",
    maxLength: 100,
    maxWeight: 25,
    depth: "0 – 100 m",
    habitat: ["coastal", "surf"],
    techniques: ["bottom", "livebait"],
    season: [],
    seas: ["atlantique", "mediterranee"],
    description: {"fr": "Poisson plat aux deux yeux du même côté, posé sur le sable et parfaitement camouflé. L'un des poissons les plus prisés de la table.", "en": "A flatfish with both eyes on one side, lying on the sand perfectly camouflaged. One of the most prized fish on the table.", "ar": "سمكة مسطحة عيناها في الجانب نفسه، ترقد على الرمل متخفية تمامًا. من أثمن الأسماك على المائدة."},
    image: "/uploads/turbot.png",
    art: {"shape": "bream", "back": "#8a7a5e", "belly": "#c4b38f", "fin": "#7a6b51", "accent": "#4b4232", "deep": true, "spots": true},
  }),
  F({
    "slug": "fletan-geant",
    "rarity": "legend",
    "zone": "monde",
    "names": {
      "fr": "Flétan géant",
      "en": "Giant Atlantic halibut",
      "ar": "الهلبوت العملاق",
      "es": "Fletán gigante",
      "it": "Ippoglosso gigante"
    },
    "nickname": "GIANT HALIBUT",
    "scientific": "Hippoglossus hippoglossus / H. stenolepis",
    "maxLength": 470,
    "maxWeight": 320,
    "depth": "50 – 2000 m",
    "habitat": [],
    "techniques": [
      "bottom",
      "jigging",
      "livebait"
    ],
    "season": [],
    "seas": [
      "atlantique"
    ],
    "description": {"fr": "Le géant des poissons plats : jusqu'à 4,7 m et plus de 300 kg. Il chasse sur le fond, les deux yeux sur la face sombre, et livre des combats interminables à la verticale.", "en": "The giant of the flatfish: up to 4.7 m and over 300 kg. It hunts on the bottom with both eyes on its dark side, and fights endlessly straight down.", "ar": "عملاق الأسماك المسطحة: يصل طوله إلى 4.7 م ووزنه إلى أكثر من 300 كغ. يصطاد في القاع وعيناه على جانبه الداكن، ويخوض معارك طويلة نحو العمق."},
    "image": "/uploads/fletan-atlantique.webp",
    "art": {
      "shape": "bream",
      "back": "#6b6a3e",
      "belly": "#e8e4d6",
      "fin": "#5c5a35",
      "accent": "#3c3b25",
      "deep": true,
      "spots": true
    }
  }),
  F({
    "slug": "raie-bouclee",
    "rarity": "common",
    "zone": "maroc",
    "names": {
      "fr": "Raie bouclée",
      "en": "Thornback ray",
      "ar": "الراية الشوكية",
      "es": "Raya de clavos",
      "it": "Razza chiodata"
    },
    "nickname": "THORNBACK RAY",
    "scientific": "Raja clavata",
    "maxLength": 105,
    "maxWeight": 18,
    "depth": "10 – 300 m",
    "habitat": [
      "coastal"
    ],
    "techniques": [
      "bottom"
    ],
    "season": [],
    "seas": [
      "atlantique",
      "mediterranee"
    ],
    "description": {
      "fr": "Raie au disque losangique brun tacheté de clair, le dos et la queue hérissés de « boucles » épineuses. Elle colle au fond et se défend en faisant ventouse.",
      "en": "A ray with a brown diamond-shaped disc spotted with cream, its back and tail covered with thorny bucklers. It sticks to the bottom and fights by suctioning down.",
      "ar": "راية بقرص معيني بني مرقط بنقاط فاتحة، وظهر وذيل مغطيان بأشواك. تلتصق بالقاع وتقاوم بالالتصاق كالكأس."
    },
    "image": "/uploads/raie-bouclee.webp",
    "art": {
      "shape": "bream",
      "back": "#8a7a50",
      "belly": "#e8dcc0",
      "fin": "#6b5e3c",
      "accent": "#f0e6c8",
      "spots": true,
      "deep": true
    }
  }),
  F({
    slug: "grondin-perlon",
    rarity: "common",
    zone: "maroc",
    names: {"fr": "Grondin perlon", "en": "Striped searobin", "ar": "سمك الغرنين", "es": "Bejel", "it": "Capone gallinella"},
    nickname: "STRIPED SEAROBIN",
    scientific: "Chelidonichthys lucerna",
    maxLength: 75,
    maxWeight: 6,
    depth: "20 – 300 m",
    habitat: ["coastal"],
    techniques: ["bottom", "jigging"],
    season: [],
    seas: ["atlantique", "mediterranee"],
    description: {"fr": "Il « marche » sur le fond grâce aux rayons de ses nageoires et déploie de grandes ailes pectorales bordées de bleu. Il grogne même quand on le sort de l'eau !", "en": "It \"walks\" on the bottom on its fin rays and spreads huge blue-edged pectoral wings. It even grunts when pulled out of the water!", "ar": "يمشي على القاع بأشعة زعانفه ويفرد زعانف صدرية كبيرة كالأجنحة. بل يصدر صوت همهمة عند إخراجه من الماء!"},
    image: "/uploads/searobin.png",
    art: {"shape": "bass", "back": "#8a4b2c", "belly": "#efe2d6", "fin": "#e07a3c", "accent": "#1d1d1d", "spots": true},
  }),
  F({
    "slug": "lotte",
    "rarity": "prized",
    "zone": "maroc",
    "names": {
      "fr": "Lotte (Baudroie)",
      "en": "Monkfish",
      "ar": "سمك الشيطان",
      "es": "Rape",
      "it": "Rana pescatrice"
    },
    "nickname": "MONKFISH",
    "scientific": "Lophius piscatorius",
    "maxLength": 200,
    "maxWeight": 57,
    "depth": "20 – 1000 m",
    "habitat": [
      "coastal"
    ],
    "techniques": [
      "bottom",
      "jigging"
    ],
    "season": [],
    "seas": [
      "atlantique",
      "mediterranee"
    ],
    "description": {
      "fr": "Une tête énorme, une gueule immense et un leurre naturel sur le front pour attirer ses proies. Posée sur le fond, la lotte avale tout ce qui passe devant elle.",
      "en": "A huge head, an enormous mouth and a natural lure on its forehead to attract prey. Lying on the bottom, the monkfish swallows anything that passes in front of it.",
      "ar": "رأس ضخم وفم هائل وطُعم طبيعي على الجبهة لجذب الفرائس. يرقد سمك الشيطان في القاع ويبتلع كل ما يمر أمامه."
    },
    "image": "/uploads/lotte.webp",
    "art": {
      "shape": "grouper",
      "back": "#5e3328",
      "belly": "#c79a8a",
      "fin": "#4a2820",
      "accent": "#e8c8b8",
      "deep": true
    }
  }),
  F({
    "slug": "carangue-gros-yeux",
    "rarity": "prized",
    "zone": "monde",
    "names": {
      "fr": "Carangue à gros yeux",
      "en": "Bigeye trevally",
      "ar": "الكارانكس كبير العينين",
      "es": "Jurel ojón",
      "it": "Carango occhiogrosso"
    },
    "nickname": "BIGEYE TREVALLY",
    "scientific": "Caranx sexfasciatus",
    "maxLength": 120,
    "maxWeight": 18,
    "depth": "0 – 150 m",
    "habitat": [
      "reef",
      "pelagic"
    ],
    "techniques": [
      "popping",
      "jigging",
      "spinning",
      "livebait"
    ],
    "season": [],
    "seas": [
      "mer-rouge",
      "mer-oman",
      "golfe",
      "indonesie"
    ],
    "description": {
      "fr": "Reconnaissable à son gros œil doré, elle forme de grands bancs tournoyants le long des tombants le jour et chasse surtout à l'aube et la nuit. Puissante et têtue au popper comme au jig.",
      "en": "Easy to spot by its big golden eye, it forms huge milling schools along drop-offs by day and hunts mostly at dawn and at night. Powerful and stubborn on poppers and jigs.",
      "ar": "يُعرف بعينه الذهبية الكبيرة، ويشكل أسرابًا ضخمة تدور حول الجروف نهارًا ويصطاد غالبًا عند الفجر وليلًا. قوي وعنيد على البوبر والجيغ."
    },
    "image": "/uploads/carangue-gros-yeux.webp",
    "art": {
      "shape": "jack",
      "back": "#3f6b7c",
      "belly": "#e6ecee",
      "fin": "#8a7a4a",
      "accent": "#f2b31b"
    }
  }),
  F({
    slug: 'carangue-gt', rarity: 'legend', zone: 'monde',
    names: { fr: 'Carangue GT', en: 'Giant trevally', ar: 'الكراكس العملاق', es: 'Jurel gigante', it: 'Carango gigante' },
    nickname: 'GT',
    scientific: 'Caranx ignobilis',
    image: '/uploads/gt.png',
    maxLength: 170, maxWeight: 80, depth: '0 – 190 m',
    habitat: ['reef'], techniques: ['popping', 'jigging'], season: [],
    description: {
      fr: 'Le bulldozer des récifs. Il explose sur les poppers et tente tout pour casser dans le corail.',
      en: 'The bulldozer of the reef. It explodes on poppers and does anything to break you off in the coral.',
    },
    art: { shape: 'jack', back: '#3b4048', belly: '#cfd4da', fin: '#23272d', accent: '#5c6470', deep: true },
  }),
  F({
    "slug": "jack-crevalle",
    "rarity": "prized",
    "zone": "maroc",
    "names": {
      "fr": "Jack Crevalle",
      "en": "Jack Crevalle",
      "ar": "الكارانكس الكريفالي",
      "es": "Jurel común",
      "it": "Carangide crevalle"
    },
    "nickname": "CREVALLE",
    "scientific": "Caranx hippos",
    "maxLength": 124,
    "maxWeight": 32,
    "depth": "1 – 350 m",
    "habitat": [
      "coastal",
      "surf",
      "pelagic"
    ],
    "techniques": [
      "popping",
      "spinning",
      "livebait"
    ],
    "season": [],
    "seas": [
      "atlantique"
    ],
    "description": {
      "fr": "Carangue argentée au front bombé et à la tache noire sur l'opercule. En bancs, elle explose sur les poppers près des plages et des estuaires, et ne lâche jamais.",
      "en": "A silvery trevally with a blunt head and a black spot on the gill cover. In schools it blows up on poppers near beaches and estuaries, and never gives up.",
      "ar": "كارانكس فضي برأس منتفخ وبقعة سوداء على غطاء الخياشيم. في أسراب ينقض على البوبر قرب الشواطئ والمصبات ولا يستسلم أبدًا."
    },
    "image": "/uploads/jack-crevalle.webp",
    "art": {
      "shape": "jack",
      "back": "#5f7f8a",
      "belly": "#e6ecef",
      "fin": "#c8b84a",
      "accent": "#202428",
      "deep": true
    }
  }),
  F({
    "slug": "carangue-ferdau",
    "rarity": "prized",
    "zone": "monde",
    "names": {
      "fr": "Carangue ferdau",
      "en": "Barred trevally",
      "ar": "الكارانكس المخطط",
      "es": "Jurel ferdau",
      "it": "Carangide ferdau"
    },
    "nickname": "BARRED TREVALLY",
    "scientific": "Carangoides ferdau",
    "maxLength": 70,
    "maxWeight": 8,
    "depth": "1 – 60 m",
    "habitat": [
      "reef",
      "coastal"
    ],
    "techniques": [
      "popping",
      "jigging",
      "spinning"
    ],
    "season": [],
    "seas": [
      "mer-rouge",
      "mer-oman",
      "golfe",
      "indonesie"
    ],
    "description": {
      "fr": "Carangue argentée reconnaissable à ses barres verticales sombres. Elle patrouille en petits groupes le long des récifs et des plages, et attaque les poppers et petits jigs avec énergie.",
      "en": "A silvery trevally easy to spot by its dark vertical bars. It patrols reefs and beaches in small groups and hits poppers and small jigs hard.",
      "ar": "كارانكس فضي يُعرف بخطوطه العمودية الداكنة. يجوب الشعاب والشواطئ في مجموعات صغيرة ويهاجم البوبر والجيغ الصغير بقوة."
    },
    "image": "/uploads/carangue-ferdau.webp",
    "art": {
      "shape": "jack",
      "back": "#9aa7b2",
      "belly": "#eef2f5",
      "fin": "#b9b9a0",
      "accent": "#3f4650",
      "bars": true
    }
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
  F({
    "slug": "cordonnier-bossu",
    "rarity": "prized",
    "zone": "maroc",
    "names": {
      "fr": "Cordonnier bossu",
      "en": "Alexandria pompano",
      "ar": "البومبانو الإسكندراني",
      "es": "Pámpano de Alejandría",
      "it": "Carangide d'Alessandria"
    },
    "nickname": "ALEXANDRIA POMPANO",
    "scientific": "Alectis alexandrina",
    "maxLength": 100,
    "maxWeight": 7,
    "depth": "10 – 100 m",
    "habitat": [
      "reef",
      "coastal"
    ],
    "techniques": [
      "jigging",
      "livebait"
    ],
    "season": [],
    "seas": [
      "atlantique",
      "mediterranee"
    ],
    "description": {
      "fr": "Une carangue au profil anguleux, argentée et iridescente. Les jeunes portent de longs filaments aux nageoires, qui raccourcissent avec l'âge. Puissante et nerveuse au jig.",
      "en": "An angular, silvery and iridescent trevally. Juveniles carry long filaments on their fins, which shorten with age. Strong and nervous on the jig.",
      "ar": "كارانكس بجسم زاوي فضي متلألئ. تحمل الصغار خيوطًا طويلة على الزعانف تقصر مع التقدم في العمر. قوية وعصبية على الجيغ."
    },
    "image": "/uploads/cordonnier-bossu.webp",
    "art": {
      "shape": "jack",
      "back": "#7f9fc0",
      "belly": "#e6ecef",
      "fin": "#556070",
      "accent": "#d8e4f0",
      "deep": true
    }
  }),
  F({
    "slug": "roosterfish",
    "rarity": "legend",
    "zone": "monde",
    "names": {
      "fr": "Roosterfish",
      "en": "Roosterfish",
      "ar": "سمكة الديك",
      "es": "Pez gallo",
      "it": "Pesce gallo"
    },
    "nickname": "PEZ GALLO",
    "scientific": "Nematistius pectoralis",
    "maxLength": 160,
    "maxWeight": 52,
    "depth": "0 – 60 m",
    "habitat": [
      "coastal",
      "surf"
    ],
    "techniques": [
      "popping",
      "livebait",
      "spinning"
    ],
    "season": [],
    "seas": [],
    "description": {
      "fr": "Reconnaissable entre tous à sa crête de sept longs rayons, dressée quand il chasse. Il patrouille le long des plages du Pacifique Est : un rêve de pêcheur du bord.",
      "en": "Unmistakable with its crest of seven long rays, raised when it hunts. It patrols the beaches of the Eastern Pacific: a shore angler's dream.",
      "ar": "لا يُخطئ بعرفه المكوّن من سبعة أشعة طويلة يرفعه عند الصيد. يجوب شواطئ شرق الهادئ: حلم صياد الشاطئ."
    },
    "image": "/uploads/roosterfish.webp",
    "art": {
      "shape": "jack",
      "back": "#3a8a9a",
      "belly": "#e8f0f2",
      "fin": "#1a2a30",
      "accent": "#2a3a40",
      "bars": true
    }
  }),
  F({
    slug: "rascasse",
    rarity: "common",
    zone: "maroc",
    names: {"fr": "Rascasse", "en": "Scorpionfish", "ar": "سمك العقرب", "es": "Cabracho", "it": "Scorfano rosso"},
    nickname: "SCORPIONFISH",
    scientific: "Scorpaena scrofa",
    maxLength: 50,
    maxWeight: 3,
    depth: "20 – 500 m",
    habitat: ["reef"],
    techniques: ["bottom", "jigging"],
    season: [],
    seas: ["atlantique", "mediterranee"],
    description: {"fr": "La reine de la bouillabaisse, camouflée dans les roches avec ses franges et sa robe rouge. Attention : ses épines dorsales sont venimeuses !", "en": "The queen of bouillabaisse, camouflaged among the rocks with its fringes and red coat. Careful: its dorsal spines are venomous!", "ar": "ملكة حساء السمك، متخفية بين الصخور بزوائدها ولونها الأحمر. انتبه: أشواكها الظهرية سامة!"},
    image: "/uploads/rascasse-v2.webp",
    art: {"shape": "grouper", "back": "#b8452d", "belly": "#f0c4a6", "fin": "#d4553e", "accent": "#3a1d14", "blotches": true, "spots": true},
  }),
  F({
    "slug": "murene",
    "rarity": "prized",
    "zone": "maroc",
    "names": {
      "fr": "Murène",
      "en": "Mediterranean moray",
      "ar": "سمك الموراي",
      "es": "Morena",
      "it": "Murena"
    },
    "nickname": "MORAY",
    "scientific": "Muraena helena",
    "maxLength": 150,
    "maxWeight": 15,
    "depth": "0 – 80 m",
    "habitat": [
      "reef"
    ],
    "techniques": [
      "bottom",
      "livebait"
    ],
    "season": [],
    "seas": [
      "atlantique",
      "mediterranee"
    ],
    "description": {
      "fr": "Corps de serpent tacheté, gueule armée de dents pointues : la murène guette depuis son trou dans la roche et s'y enroule dès qu'elle est piquée. Un combat court mais musclé.",
      "en": "A spotted snake-like body and a mouth full of sharp teeth: the moray waits in its hole in the rocks and wraps itself inside as soon as it is hooked. A short but brutal fight.",
      "ar": "جسم ثعباني مرقط وفم مسلح بأسنان حادة: تتربص الموراي من جحرها في الصخر وتلتف بداخله بمجرد علوقها. معركة قصيرة لكنها عنيفة."
    },
    "image": "/uploads/murene.webp",
    "art": {
      "shape": "barracuda",
      "back": "#6b3f2a",
      "belly": "#b08a6a",
      "fin": "#5a3322",
      "accent": "#e8d3b0",
      "spots": true
    }
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
];

export function seedFish() {
  // fish species first, then the sharks; each gets the seas where it lives
  const all = [...SPECIES, ...SHARKS.map((x) => F(x))].map((x) => ({ seas: SEAS_BY_SLUG[x.slug] ?? x.seas ?? [], range: RANGES[x.slug] ?? {}, ...x, ...(SHARK_PHOTOS[x.slug] ?? {}) }));
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
      trophies: [{"image": "/uploads/trophee-jebel-sifah-equipe.webp", "label": {"fr": "2ᵉ place par équipe", "en": "2nd Place Team", "ar": "المركز الثاني للفرق", "es": "2.º puesto por equipos", "it": "2° posto a squadre"}}, {"image": "/uploads/trophee-jebel-sifah-top-angler.webp", "label": {"fr": "2ᵉ meilleur pêcheur", "en": "2nd Top Angler", "ar": "ثاني أفضل صياد", "es": "2.º mejor pescador", "it": "2° miglior pescatore"}}, {"image": "/uploads/trophee-jebel-sifah-biggest-catch.webp", "label": {"fr": "2ᵉ plus grosse prise", "en": "2nd Biggest Catch", "ar": "ثاني أكبر صيد", "es": "2.ª captura más grande", "it": "2ª cattura più grande"}}],
      champion: "/uploads/jebel-sifah-champion.webp",
    },
    {
      "id": "jig-tanger",
      "date": "2022-04",
      "place": 3,
      "award": {
        "fr": "3ᵉ place sur 17 bateaux",
        "en": "3rd place out of 17 boats",
        "ar": "المركز الثالث من بين 17 قاربًا",
        "es": "3.er puesto de 17 barcos",
        "it": "3° posto su 17 barche"
      },
      "title": {"fr": "Compétition par équipes de pêche libre verticale en bateau", "en": "Team Vertical Jigging Boat Competition", "ar": "مسابقة الفرق للصيد العمودي الحر بالقارب", "es": "Competición por equipos de pesca vertical libre en barco", "it": "Gara a squadre di pesca verticale libera in barca"},
      "location": "Cap Spartel · Tanger Med, Maroc",
      "organizer": "Royal Yacht Club Tanger · 1ʳᵉ édition",
      "description": {
        "fr": "Face à 17 bateaux engagés au large de Tanger, Omar décroche la 3ᵉ place de cette compétition de jigging organisée au Royal Yacht Club Tanger. Une journée de jig vertical intense, conclue sur le podium avec le trophée en main. TANTOUNI !",
        "en": "Up against 17 boats off Tangier, Omar took 3rd place in this jigging competition hosted by the Royal Yacht Club Tanger. An intense day of vertical jigging, finished on the podium with the trophy in hand. TANTOUNI!",
        "ar": "في مواجهة 17 قاربًا قبالة طنجة، حصل عمر على المركز الثالث في مسابقة الجيغ التي نظمها النادي الملكي لليخوت بطنجة. يوم مكثف من الجيغ العمودي انتهى على منصة التتويج والكأس في يده. طنطوني!"
      },
      "photos": [
        "/uploads/jig-tanger-podium.jpg",
        "/uploads/jig-tanger-trophee.jpg",
        "/uploads/jig-tanger-mer.jpg"
      ],
      "trophies": [{"image": "/uploads/trophee-tanger-jig-3e.webp", "label": {"fr": "3ᵉ prix", "en": "3rd prize", "ar": "الجائزة الثالثة", "es": "3.er premio", "it": "3° premio"}}],
      "champion": "/uploads/jig-tanger-champion.webp",
      "video": ""
    }
  ];
}
