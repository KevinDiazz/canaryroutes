import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const locales = ['es', 'en', 'de', 'no', 'da', 'fi', 'sv'] as const;
const islands = ['gran-canaria', 'tenerife'] as const;
const MAX_POI_DESCRIPTION_LENGTH = 186;

const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const POISchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(10).max(MAX_POI_DESCRIPTION_LENGTH),
  shortDescription: z.string().min(5),
  island: z.enum(islands),
  category: z.enum(['nature', 'beach', 'culture', 'hiking', 'viewpoint', 'food', 'other']),
  coordinates: CoordinatesSchema.optional(),
  images: z.object({
    hero: z.string(),
    gallery: z.array(z.string()),
  }),
  audioPreview: z.string().optional(),
  audioTranscript: z.string().optional(),
  hasPremiumAudio: z.boolean(),
  premiumRouteId: z.string().optional(),
  tags: z.array(z.string()),
  visitDuration: z.string().optional(),
  difficulty: z.enum(['easy', 'moderate', 'hard']).optional(),
  emoji: z.string().optional(),
  gygTourId: z.string().optional(),
  gygUrl: z.string().optional(),
});

const RouteSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(10),
  island: z.enum(islands),
  pois: z.array(z.string()),
  duration: z.string(),
  distance: z.string(),
  type: z.enum(['driving', 'walking', 'cycling', 'mixed']),
  price: z.number().positive(),
  currency: z.string(),
  audioLanguages: z.array(z.string()),
  images: z.object({ hero: z.string() }),
});

let errors = 0;
let checked = 0;

function validate(filePath: string, schema: z.ZodSchema, key: 'pois' | 'routes') {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing: ${filePath}`);
    errors++;
    return;
  }

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const data = raw[key] as unknown[];
    if (!Array.isArray(data)) {
      console.error(`❌ ${filePath}: expected array at key "${key}"`);
      errors++;
      return;
    }
    data.forEach((item: unknown, i: number) => {
      const result = schema.safeParse(item);
      if (!result.success) {
        console.error(`❌ ${filePath}[${i}]:`, JSON.stringify(result.error.flatten(), null, 2));
        errors++;
      }
    });
    checked += data.length;
    console.log(`✅ ${filePath} (${data.length} ${key})`);
  } catch (e) {
    console.error(`❌ JSON parse error in ${filePath}:`, e);
    errors++;
  }
}

const contentDir = path.join(process.cwd(), 'content');

// Validate es and en (required locales for MVP)
const requiredLocales = ['es', 'en'] as const;

console.log('\n🔍 Validating content files...\n');

for (const locale of requiredLocales) {
  for (const island of islands) {
    validate(path.join(contentDir, locale, island, 'pois.json'), POISchema, 'pois');
    validate(path.join(contentDir, locale, island, 'routes.json'), RouteSchema, 'routes');
  }
}

// Cross-check: POIs referenced in routes actually exist
console.log('\n🔍 Cross-checking route → POI references...\n');
for (const locale of requiredLocales) {
  for (const island of islands) {
    const poisPath = path.join(contentDir, locale, island, 'pois.json');
    const routesPath = path.join(contentDir, locale, island, 'routes.json');
    if (!fs.existsSync(poisPath) || !fs.existsSync(routesPath)) continue;

    const poisData = JSON.parse(fs.readFileSync(poisPath, 'utf-8'));
    const routesData = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));
    const poiSlugs = new Set((poisData.pois as { slug: string }[]).map((p) => p.slug));

    for (const route of routesData.routes as { slug: string; pois: string[] }[]) {
      for (const poiSlug of route.pois) {
        if (!poiSlugs.has(poiSlug)) {
          console.error(`❌ Route "${route.slug}" references unknown POI "${poiSlug}" in ${locale}/${island}`);
          errors++;
        }
      }
    }
  }
}

console.log(`\n${errors > 0 ? '❌' : '✅'} Checked ${checked} items across ${requiredLocales.length * islands.length * 2} files`);

if (errors > 0) {
  console.error(`❌ ${errors} error(s) found. Fix before building.\n`);
  process.exit(1);
} else {
  console.log('✅ All content valid! Ready to build.\n');
}
