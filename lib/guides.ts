import path from 'path';
import fs from 'fs';
import type { Locale, Island } from './types';

// ── Types ──────────────────────────────────────────────────────────────────

export interface GuideSection {
  rank: number;
  name: string;
  /** Matches the POI slug for internal linking */
  poiSlug: string;
  /**
   * POI category override for internal link generation.
   * When omitted, falls back to the guide-level `category`.
   * Needed for cross-category guides like car-rental, where sections link
   * to nature/beach/culture POIs but the guide itself is `transport`.
   */
  poiCategory?: string;
  municipio: string;
  summary: string;
  content: string;
  tips: string[];
  image?: string;
  gygActivityId?: string;
}

export interface GuideFAQ {
  question: string;
  answer: string;
}

/**
 * Simple chronological calendar entry — used for guides like the romerías
 * calendar where every date needs to be listed but not every date has a
 * matching POI to link to. Rendered as a plain readable list, no internal
 * links, so it never risks generating a broken or miscategorized URL.
 */
export interface GuideCalendarEntry {
  /** ISO date, e.g. "2026-05-02" */
  date: string;
  name: string;
  municipio: string;
}

export interface GuideAffiliate {
  cars?: {
    text: string;
    location: string;
    /**
     * Relative path segment for the in-guide CTA link.
     * e.g. "transporte/alquiler-coche-gran-canaria"
     * Injected at content-level so the page is island-agnostic.
     */
    poiPath?: string;
  };
  tours?: {
    text: string;
    gygQuery: string;
    /**
     * Relative path segment for the in-guide CTA link.
     * e.g. "actividades/crucero-catamaran-puerto-rico"
     * Injected at content-level so the page is island-agnostic.
     */
    poiPath?: string;
  };
}

export interface GuideHub {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroImage?: string;
  category: string;
  updatedAt: string;
  intro: string;
  sections: GuideSection[];
  /** Optional full chronological listing, rendered below the map preview. */
  calendar?: GuideCalendarEntry[];
  faq: GuideFAQ[];
  affiliate?: GuideAffiliate;
}

// ── Loader ─────────────────────────────────────────────────────────────────

const contentDir = path.join(process.cwd(), 'content');

export function getGuide(
  locale: Locale,
  island: Island,
  slug: string,
): GuideHub | undefined {
  const locales: Locale[] = [locale, 'es', 'en'];
  for (const l of locales) {
    try {
      const filePath = path.join(contentDir, l, island, 'guides', `${slug}.json`);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as GuideHub;
      }
    } catch {
      // continue
    }
  }
  return undefined;
}

/** Returns guide slugs for a specific locale (falls back to 'es' if the locale dir has no guides). */
export function getAllGuideSlugs(island: Island, locale: Locale = 'es'): string[] {
  try {
    const dir = path.join(contentDir, locale, island, 'guides');
    if (fs.existsSync(dir)) {
      const slugs = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
      if (slugs.length > 0) return slugs;
    }
    // Fallback to Spanish slugs
    const fallbackDir = path.join(contentDir, 'es', island, 'guides');
    if (!fs.existsSync(fallbackDir)) return [];
    return fs
      .readdirSync(fallbackDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''));
  } catch {
    return [];
  }
}

export function getGuides(locale: Locale, island: Island): GuideHub[] {
  const slugs = getAllGuideSlugs(island, locale);
  return slugs
    .map((slug) => getGuide(locale, island, slug))
    .filter((g): g is GuideHub => g !== undefined);
}
