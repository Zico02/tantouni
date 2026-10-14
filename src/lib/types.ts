export type Lang = 'fr' | 'en' | 'ar' | 'es' | 'it';

export type FishShape =
  | 'tuna' | 'marlin' | 'sword' | 'sailfish' | 'shark' | 'grouper' | 'bream'
  | 'bass' | 'barracuda' | 'mahi' | 'jack' | 'corvina' | 'wahoo';

export interface FishArt {
  shape: FishShape;
  back: string;
  belly: string;
  fin: string;
  accent: string;
  stripe?: boolean;
  backStripes?: boolean;
  bars?: boolean;
  spots?: boolean;
  blotches?: boolean;
  goldBand?: boolean;
  band?: boolean;
  wavyLine?: boolean;
  longPec?: boolean;
  deep?: boolean;
}

export type Habitat = 'pelagic' | 'reef' | 'coastal' | 'surf';
export type Technique = 'jigging' | 'trolling' | 'livebait' | 'popping' | 'spinning' | 'bottom';
export type Rarity = 'common' | 'prized' | 'legend';

export interface Fish {
  id: string;
  slug: string;
  order: number;
  names: Record<Lang, string>;
  nickname?: string;
  scientific: string;
  maxLength: number | null;
  maxWeight: number | null;
  depth: string;
  habitat: Habitat[];
  techniques: Technique[];
  season: number[];
  description: Partial<Record<Lang, string>>;
  caught: boolean;
  catch: { date: string; weight: string; length: string; location: string; notes: string };
  youtube: string;
  image: string;
  art: FishArt;
  rarity: Rarity;
  zone: 'maroc' | 'monde';
}

export interface DayAvailability {
  blocked: boolean;
  weather?: boolean;
  boatsLeft: number[];
  left: number;
}

export interface Reservation {
  id: string;
  ref: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  date: string;
  people: number;
  lang: Lang;
  allocation: { boat: number; seats: number }[];
  total: number;
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  createdAt: string;
  adminNotes?: string;
}

export interface BlockedDay {
  date: string;
  reason: string;
  type?: 'blocked' | 'weather';
}

export interface Achievement {
  id: string;
  date: string;
  place: number | null;
  award: Partial<Record<Lang, string>>;
  title: Partial<Record<Lang, string>>;
  location: string;
  organizer: string;
  description: Partial<Record<Lang, string>>;
  photos: string[];
  video?: string;
}
