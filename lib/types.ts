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

/* ------------------------------------------------------------------ */
/* Licencias de imágenes (Creative Commons + contenido propio)         */
/* ------------------------------------------------------------------ */

/** Licencias soportadas para imágenes de POIs/rutas. */
export type ImageLicenseType =
  | 'CC0'
  | 'CC-BY-2.0'
  | 'CC-BY-2.5'
  | 'CC-BY-3.0'
  | 'CC-BY-4.0'
  | 'CC-BY-SA-2.0'
  | 'CC-BY-SA-2.5'
  | 'CC-BY-SA-3.0'
  | 'CC-BY-SA-4.0'
  | 'OWN';

interface ImageLicenseBase {
  /** true si la imagen ha sido recortada, editada, recoloreada, etc. */
  modified?: boolean;
}

/** Dominio público / CC0. Atribución opcional pero recomendada. */
export interface ImageLicenseCC0 extends ImageLicenseBase {
  type: 'CC0';
  author?: string;
  authorUrl?: string;
  sourceUrl?: string;
  licenseUrl?: string;
}

/** CC BY: requiere atribución, enlace a la fuente y a la licencia. */
export interface ImageLicenseCCBY extends ImageLicenseBase {
  type: 'CC-BY-2.0' | 'CC-BY-2.5' | 'CC-BY-3.0' | 'CC-BY-4.0';
  author: string;
  authorUrl?: string;
  sourceUrl: string;
  licenseUrl: string;
}

/**
 * CC BY-SA: igual que CC BY, pero además implica "compartir igual" sobre
 * el archivo de imagen derivado (ver docs/poi-image-licensing.md).
 */
export interface ImageLicenseCCBYSA extends ImageLicenseBase {
  type: 'CC-BY-SA-2.0' | 'CC-BY-SA-2.5' | 'CC-BY-SA-3.0' | 'CC-BY-SA-4.0';
  author: string;
  authorUrl?: string;
  sourceUrl: string;
  licenseUrl: string;
}

/** Contenido propio de CanaryRoutes. Sin atribución externa. */
export interface ImageLicenseOwn {
  type: 'OWN';
  /** Opcional: autor/fotógrafo interno, para créditos editoriales. */
  author?: string;
}

export type ImageLicense =
  | ImageLicenseCC0
  | ImageLicenseCCBY
  | ImageLicenseCCBYSA
  | ImageLicenseOwn;

/**
 * Entrada del registro centralizado `content/image-credits.json`.
 * Se indexa por ruta de imagen (`src`), de forma que una misma imagen
 * usada desde varios POIs y/o idiomas (es/en/de) solo define su licencia
 * una vez.
 */
export interface ImageCredit {
  /** Texto alternativo por defecto (puede sobreescribirse en el contenido del POI). */
  alt?: string;
  width?: number;
  height?: number;
  /** Título original de la obra (p.ej. nombre de archivo en Wikimedia Commons). Opcional. */
  title?: string;
  /** Nombre legible de la fuente (p.ej. "Wikimedia Commons", "Flickr"). Opcional. */
  sourceName?: string;
  /** Descripción breve de los cambios realizados (p.ej. "Convertida a AVIF y optimizada para web"). */
  modifications?: string;
  license: ImageLicense;
}

/** Mapa `src` -> metadatos de licencia. */
export type ImageCreditsRegistry = Record<string, ImageCredit>;

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
  /** Direct Google Maps place URL (e.g. https://maps.app.goo.gl/...) — when present,
   *  the "Open in Maps" button opens the exact place with its info and photos */
  mapsUrl?: string;
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
