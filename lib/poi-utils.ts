import fs from 'fs';
import path from 'path';
import type { POI } from './types';
import { CATEGORY_URL_TO_FILTER } from './categories';

/** Categorías de POI que pertenecen a cada filtro del mapa. */
const FILTER_TO_POI_CATEGORIES: Record<string, POI['category'][]> = {
  beach: ['beach'],
  hiking: ['hiking'],
  culture: ['culture'],
  nature: ['nature'],
  activities: ['viewpoint', 'food', 'other'],
  transport: ['transport'],
};

/** Slugs de categoría que tienen página de contenido (todas menos "top"). */
export const HUB_CATEGORY_SLUGS = Object.keys(CATEGORY_URL_TO_FILTER).filter((c) => c !== 'top');

/** POIs de una categoría (por slug de URL: playas, senderos...). Top primero. */
export function getPoisByCategorySlug(pois: POI[], categorySlug: string): POI[] {
  const cats = FILTER_TO_POI_CATEGORIES[CATEGORY_URL_TO_FILTER[categorySlug]] ?? [];
  return pois
    .filter((p) => cats.includes(p.category) && !p.sectionOnly)
    .sort((a, b) => Number(!!b.top) - Number(!!a.top));
}

/** Texto plano (sin markdown) a partir de la descripción de un POI. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Un POI es "fino" si tiene muy poco texto propio. Esas fichas se marcan
 * noindex,follow para no diluir la autoridad de las páginas de categoría.
 * (Hoy todos los POIs superan de sobra el umbral.)
 */
export const THIN_POI_MIN_CHARS = 500;
export function isThinPoi(poi: POI): boolean {
  return stripMarkdown(poi.description ?? '').length < THIN_POI_MIN_CHARS;
}

/**
 * Miniatura para tarjetas: usa la thumb pre-generada (.webp) si existe en
 * /public; si no, la foto original. Se comprueba en build (solo servidor).
 */
export function getCardThumb(heroUrl: string): string {
  if (!heroUrl.startsWith('/images/')) return heroUrl;
  const parts = heroUrl.split('/');
  if (parts.length < 5) return heroUrl;
  const category = parts[parts.length - 2];
  if (category === 'municipios') return heroUrl;
  const filename = parts[parts.length - 1].replace(/\.[^.]+$/, '.webp');
  const island = parts[parts.length - 3];
  const thumb = `/images/${island}/thumbs/${category}/${filename}`;
  return fs.existsSync(path.join(process.cwd(), 'public', thumb)) ? thumb : heroUrl;
}
