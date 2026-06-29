import path from 'path';
import fs from 'fs';
import type { Locale, Island } from './types';

// ── Types ──────────────────────────────────────────────────────────────────

export interface GuideSection {
  rank: number;
  name: string;
  /** Matches the POI slug for internal linking */
  poiSlug: string;
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

export interface GuideAffiliate {
  cars?: {
    text: string;
    location: string;
  };
  tours?: {
    text: string;
    gygQuery: string;
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
