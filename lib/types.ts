export const locales = ['es', 'en', 'de'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';

export const islands = [
  'gran-canaria',
  // 'tenerife', // TODO: not developed yet
] as const;
export type Island = typeof islands[number];

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface POIImages {
  hero: string;
  gallery: string[];
}

export interface POI {
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  island: Island;
  category: 'nature' | 'beach' | 'culture' | 'hiking' | 'viewpoint' | 'food' | 'other';
  coordinates?: Coordinates;
  images: POIImages;
  audioPreview?: string;
  audioTranscript?: string;
  hasPremiumAudio: boolean;
  premiumRouteId?: string;
  tags: string[];
  visitDuration?: string;
  difficulty?: 'easy' | 'moderate' | 'hard';
  emoji?: string;
  /** GetYourGuide tour ID — when present, the POI sheet shows a booking widget */
  gygTourId?: string;
  /** Full GetYourGuide affiliate URL for the "Reservar" button */
  gygUrl?: string;
  /** When true, the POI appears only in section cards — not as a map marker */
  sectionOnly?: boolean;
  /** Slug of the municipality this POI belongs to (e.g. "las-palmas", "mogan") */
  municipio?: string;
  /** When true, appears in the Top filter on the map */
  top?: boolean;
  /** Hiking track data */
  track?: {
    mapsUrl: string;
    startCoordinates?: { lat: number; lng: number };
    distance?: string;
    duration?: string;
    code?: string;
    type?: 'circular' | 'lineal' | 'ida-vuelta';
    elevationGain?: number;
    maxAltitude?: number;
    tips?: string;
  };
}

export interface RouteImages {
  hero: string;
}

export interface Route {
  slug: string;
  name: string;
  description: string;
  island: Island;
  pois: string[];
  duration: string;
  distance: string;
  type: 'driving' | 'walking' | 'cycling' | 'mixed';
  price: number;
  currency: string;
  audioLanguages: Locale[];
  images: RouteImages;
}

export interface Section {
  id: string;
  label: string;
  emoji: string;
  color: string;
  pois: string[]; // slugs de POI
}

export interface Municipio {
  slug: string;
  name: string;
  emoji?: string;
  coordinates: Coordinates;
  description?: string;
  shortDescription?: string;
  /** @deprecated use `images.hero` instead */
  heroImage?: string;
  images?: POIImages;
}

export interface POIsFile {
  pois: POI[];
  sections?: Section[];
  municipios?: Municipio[];
}

export interface RoutesFile {
  routes: Route[];
}
