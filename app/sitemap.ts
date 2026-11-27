import type { MetadataRoute } from 'next';
import { locales, islands } from '@/lib/types';
import { getPOIs } from '@/lib/content';
import { CATEGORY_URL_TO_FILTER } from '@/lib/categories';
import { HUB_CATEGORY_SLUGS } from '@/lib/poi-utils';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';

export const dynamic = 'force-static';

const CAT_MAP: Record<string, string[]> = {
  beach: ['beach'], hiking: ['hiking'], culture: ['culture'],
  nature: ['nature'], activities: ['viewpoint', 'food', 'other'],
  transport: ['transport'],
};

// El sitio usa trailingSlash: true (next.config.ts) y redirige toda URL sin
// barra final a su versión canónica con barra final. Todas las URLs del
// sitemap deben incluir esa barra para no generar redirecciones al rastrear.
const withSlash = (url: string) => (url.endsWith('/') ? url : url + '/');

// Quedan fuera: el mapa (/mapa/, noindex) y /top/ (redirige al mapa).
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Home pages per locale
  for (const locale of locales) {
    entries.push({
      url: withSlash(SITE_URL + '/' + locale),
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, withSlash(SITE_URL + '/' + l)])) },
    });
  }

  // Island pages
  for (const locale of locales) {
    for (const island of islands) {
      entries.push({
        url: withSlash(SITE_URL + '/' + locale + '/' + island),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: { languages: Object.fromEntries(locales.map((l) => [l, withSlash(SITE_URL + '/' + l + '/' + island)])) },
      });
    }
  }

  // Category pages
  for (const locale of locales) {
    for (const island of islands) {
      for (const category of HUB_CATEGORY_SLUGS) {
        entries.push({
          url: withSlash(SITE_URL + '/' + locale + '/' + island + '/' + category),
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.85,
          alternates: { languages: Object.fromEntries(locales.map((l) => [l, withSlash(SITE_URL + '/' + l + '/' + island + '/' + category)])) },
        });
      }
    }
  }

  // Canonical POI pages (category/poi)
  // 'top' is excluded here (HUB_CATEGORY_SLUGS no lo incluye).
  // Top POIs are accessible under their real category (e.g. /playas/{slug}).
  for (const island of islands) {
    const pois = getPOIs('es', island);
    for (const category of HUB_CATEGORY_SLUGS) {
      const filterId = CATEGORY_URL_TO_FILTER[category];
      const cats = CAT_MAP[filterId] ?? [];
      const filtered = pois.filter((p) => cats.includes(p.category));
      for (const poi of filtered) {
        for (const locale of locales) {
          entries.push({
            url: withSlash(SITE_URL + '/' + locale + '/' + island + '/' + category + '/' + poi.slug),
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.75,
            alternates: { languages: Object.fromEntries(locales.map((l) => [l, withSlash(SITE_URL + '/' + l + '/' + island + '/' + category + '/' + poi.slug)])) },
          });
        }
      }
    }
  }

  return entries;
}
