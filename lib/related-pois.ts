import type { POI } from './types';
import { POI_CATEGORY_TO_SLUG } from './categories';

export interface RelatedPOI {
  slug: string;
  name: string;
  category: POI['category'];
  thumb?: string;
  href: string;
}

/**
 * Returns up to `limit` related POIs for a given POI.
 * Priority: same category first, then same municipio, then top POIs.
 * Never includes the current POI.
 */
export function getRelatedPois(
  currentPoi: POI,
  allPois: POI[],
  locale: string,
  island: string,
  limit = 4,
): RelatedPOI[] {
  const others = allPois.filter((p) => p.slug !== currentPoi.slug);

  // Score each POI
  const scored = others.map((p) => {
    let score = 0;
    if (p.category === currentPoi.category) score += 3;
    if (
      currentPoi.municipio &&
      p.municipio === currentPoi.municipio &&
      p.category !== currentPoi.category
    ) score += 2;
    if (p.top) score += 1;
    return { poi: p, score };
  });

  const sorted = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.poi);

  // Fallback: if not enough scored, add random top POIs
  if (sorted.length < limit) {
    const slugsSoFar = new Set(sorted.map((p) => p.slug));
    const tops = others
      .filter((p) => p.top && !slugsSoFar.has(p.slug))
      .slice(0, limit - sorted.length);
    sorted.push(...tops);
  }

  return sorted.slice(0, limit).map((p) => ({
    slug: p.slug,
    name: p.name,
    category: p.category,
    thumb: p.images?.hero,
    href: `/${locale}/${island}/${POI_CATEGORY_TO_SLUG[p.category] ?? 'actividades'}/${p.slug}`,
  }));
}
