import fs from 'fs';
import path from 'path';
import type { ImageCredit, ImageCreditsRegistry, ImageLicense, POIImages } from './types';

/** Archivos de créditos: el principal + uno por isla. Se fusionan en orden. */
const CREDITS_FILES = [
  path.join(process.cwd(), 'content', 'image-credits.json'),
  path.join(process.cwd(), 'content', 'image-credits-tenerife.json'),
];

let cache: ImageCreditsRegistry | null = null;

/**
 * Carga (y cachea) el registro de créditos fusionando todos los archivos
 * de `CREDITS_FILES`. Permite mantener los créditos de cada isla separados
 * sin romper el sistema existente.
 *
 * Es el mismo dato para los 3 idiomas: una imagen usada en `es`, `en` y
 * `de` solo necesita una entrada en cualquiera de los archivos.
 */
export function getImageCreditsRegistry(): ImageCreditsRegistry {
  if (cache) return cache;
  cache = {};
  for (const filePath of CREDITS_FILES) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(raw) as ImageCreditsRegistry;
      Object.assign(cache, parsed);
    } catch {
      // Archivo no encontrado, vacío o JSON inválido — se ignora
    }
  }
  return cache;
}

/** Devuelve los metadatos de licencia de una imagen por su `src`, o `undefined` si no está registrada. */
export function getImageCredit(src: string): ImageCredit | undefined {
  return getImageCreditsRegistry()[src];
}

/** Devuelve true si la licencia exige mostrar atribución visible. */
export function requiresAttribution(license: ImageLicense): boolean {
  switch (license.type) {
    case 'OWN':
    case 'CC0':
      return Boolean(license.author);
    default:
      return true;
  }
}

/**
 * Genera el texto de crédito a mostrar bajo la imagen, siguiendo el
 * formato recomendado por Creative Commons: "Autor, Licencia".
 * Devuelve `null` si no hace falta mostrar nada (OWN o CC0 sin autor).
 */
export function getAttributionText(license: ImageLicense): string | null {
  switch (license.type) {
    case 'OWN':
      return license.author ? `© CanaryRoutes — ${license.author}` : null;
    case 'CC0':
      return license.author ? `${license.author} (CC0)` : null;
    case 'CC-BY-2.0':
    case 'CC-BY-2.5':
    case 'CC-BY-3.0':
    case 'CC-BY-4.0':
    case 'CC-BY-SA-2.0':
    case 'CC-BY-SA-2.5':
    case 'CC-BY-SA-3.0':
    case 'CC-BY-SA-4.0': {
      const modified = license.modified ? ' (modificada)' : '';
      return `${license.author}${modified} — ${license.type}`;
    }
    default:
      return null;
  }
}

/** Etiqueta legible de la licencia para mostrar al usuario (p.ej. "CC BY-SA 3.0"). */
export function getLicenseLabel(license: ImageLicense): string | undefined {
  switch (license.type) {
    case 'CC0':
      return 'CC0';
    case 'CC-BY-2.0':
      return 'CC BY 2.0';
    case 'CC-BY-2.5':
      return 'CC BY 2.5';
    case 'CC-BY-3.0':
      return 'CC BY 3.0';
    case 'CC-BY-4.0':
      return 'CC BY 4.0';
    case 'CC-BY-SA-2.0':
      return 'CC BY-SA 2.0';
    case 'CC-BY-SA-2.5':
      return 'CC BY-SA 2.5';
    case 'CC-BY-SA-3.0':
      return 'CC BY-SA 3.0';
    case 'CC-BY-SA-4.0':
      return 'CC BY-SA 4.0';
    case 'OWN':
      return undefined;
    default:
      return undefined;
  }
}

/**
 * Una entrada de crédito agrupable: una o varias imágenes (posiciones
 * 1-based dentro de hero+gallery) que comparten exactamente los mismos
 * datos de atribución (autor, licencia, fuente, modificaciones).
 */
export interface PhotoCreditGroup {
  /** Posiciones 1-based dentro de [hero, ...gallery] (1 = hero). */
  positions: number[];
  /** Solo presente si el grupo tiene una única imagen y esta tiene `title`. */
  title?: string;
  author?: string;
  licenseLabel?: string;
  licenseUrl?: string;
  sourceUrl?: string;
  sourceName?: string;
  modifications?: string;
  modified?: boolean;
  isOwn: boolean;
}

/**
 * Construye los grupos de créditos fotográficos para un POI, a partir de
 * `images.hero` + `images.gallery` y el registro `content/image-credits.json`.
 *
 * Imágenes consecutivas con exactamente los mismos datos de atribución se
 * agrupan en una sola entrada ("Imágenes 1-4: Autor — Licencia — Fuente").
 * Devuelve solo las imágenes cuya licencia requiere atribución visible
 * (CC BY / CC BY-SA siempre, CC0 / OWN solo si tienen `author`).
 */
export function getPhotoCredits(images: POIImages): PhotoCreditGroup[] {
  const registry = getImageCreditsRegistry();
  const srcs = [images.hero, ...images.gallery].filter(Boolean);

  const groups: PhotoCreditGroup[] = [];

  srcs.forEach((src, i) => {
    const credit = registry[src];
    if (!credit) return;
    const { license } = credit;
    if (!requiresAttribution(license)) return;

    const entry = {
      title: credit.title,
      author: license.type === 'OWN' ? license.author : license.author,
      licenseLabel: getLicenseLabel(license),
      licenseUrl: 'licenseUrl' in license ? license.licenseUrl : undefined,
      sourceUrl: 'sourceUrl' in license ? license.sourceUrl : undefined,
      sourceName: credit.sourceName,
      modifications: credit.modifications,
      modified: 'modified' in license ? license.modified : undefined,
      isOwn: license.type === 'OWN',
    };

    const last = groups[groups.length - 1];
    const sameAsLast =
      last &&
      last.author === entry.author &&
      last.licenseLabel === entry.licenseLabel &&
      last.licenseUrl === entry.licenseUrl &&
      last.sourceUrl === entry.sourceUrl &&
      last.sourceName === entry.sourceName &&
      last.modifications === entry.modifications &&
      last.modified === entry.modified &&
      last.isOwn === entry.isOwn;

    if (sameAsLast && last) {
      last.positions.push(i + 1);
      last.title = undefined; // varias imágenes -> no mostrar título individual
    } else {
      groups.push({ positions: [i + 1], ...entry });
    }
  });

  return groups;
}
