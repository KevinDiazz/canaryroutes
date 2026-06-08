import type { MetadataRoute } from 'next';
import { locales, islands } from '@/lib/types';
import { getAllPOISlugs, getAllRouteSlugs, getPOIs } from '@/lib/content';
import { ALL_CATEGORY_SLUGS, CATEGORY_URL_TO_FILTER } from '@/lib/categories';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';

const CAT_MAP: Record<string, string[]> = {
  beach: ['beach'], hiking: ['hiking'], culture: ['culture'],
  nature: ['nature'], activities: ['viewpoint', 'food', 'other'],
  top: ['top'],
};

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  // Home pages per locale
  for (const locale of locales) {
    entries.push({
      url: SITE_URL + '/' + locale,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, SITE_URL + '/' + l])) },
    });
  }

  // Island pages
  for (const locale of locales) {
    for (const island of islands) {
      entries.push({
        url: SITE_URL + '/' + locale + '/' + island,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
        alternates: { languages: Object.fromEntries(locales.map((l) => [l, SITE_URL + '/' + l + '/' + island])) },
      });
    }
  }

  // Category pages
  for (const locale of locales) {
    for (const island of islands) {
      for (const category of ALL_CATEGORY_SLUGS) {
        entries.push({
          url: SITE_URL + '/' + locale + '/' + island + '/' + category,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.85,
          alternates: { languages: Object.fromEntries(locales.map((l) => [l, SITE_URL + '/' + l + '/' + island + '/' + category])) },
        });
      }
    }
  }

  // POI pages (direct)
  for (const island of islands) {
    const slugs = getAllPOISlugs(island);
    for (const slug of slugs) {
      for (const locale of locales) {
        entries.push({
          url: SITE_URL + '/' + locale + '/' + island + '/' + slug,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
          alternates: { languages: Object.fromEntries(locales.map((l) => [l, SITE_URL + '/' + l + '/' + island + '/' + slug])) },
        });
      }
    }
  }

  // Subpoi pages (category/poi)
  for (const island of islands) {
    const pois = getPOIs('es', island);
    for (const category of ALL_CATEGORY_SLUGS) {
      const filterId = CATEGORY_URL_TO_FILTER[category];
      const cats = CAT_MAP[filterId] ?? [];
      const filtered = filterId === 'top'
        ? pois.filter((p) => !!p.top)
        : pois.filter((p) => cats.includes(p.category));
      for (const poi of filtered) {
        for (const locale of locales) {
          entries.push({
            url: SITE_URL + '/' + locale + '/' + island + '/' + category + '/' + poi.slug,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.75,
            alternates: { languages: Object.fromEntries(locales.map((l) => [l, SITE_URL + '/' + l + '/' + island + '/' + category + '/' + poi.slug])) },
          });
        }
      }
    }
  }

  // Route pages
  for (const island of islands) {
    const slugs = getAllRouteSlugs(island);
    for (const slug of slugs) {
      for (const locale of locales) {
        entries.push({
          url: SITE_URL + '/' + locale + '/' + island + '/routes/' + slug,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.8,
          alternates: { languages: Object.fromEntries(locales.map((l) => [l, SITE_URL + '/' + l + '/' + island + '/routes/' + slug])) },
        });
      }
    }
  }

  return entries;
}
