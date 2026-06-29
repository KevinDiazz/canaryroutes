import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const locales = ['es', 'en', 'de', 'no', 'da', 'fi', 'sv'] as const;
const islands = ['gran-canaria', 'tenerife'] as const;
const MAX_POI_SHORT_DESCRIPTION_LENGTH = 186;

const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const POISchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(10),
  shortDescription: z.string().min(5).max(MAX_POI_SHORT_DESCRIPTION_LENGTH),
  island: z.enum(islands),
  category: z.enum(['nature', 'beach', 'culture', 'hiking', 'viewpoint', 'food', 'other', 'transport']),
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
  visitDuration: z.string().nullish(),
  difficulty: z.enum(['easy', 'moderate', 'hard']).nullish(),
  emoji: z.string().optional(),
  gygTourId: z.string().optional(),
  gygUrl: z.string().optional(),
});

const urlLike = z.string().url();

const ImageLicenseCC0Schema = z.object({
  type: z.literal('CC0'),
  author: z.string().min(1).optional(),
  authorUrl: urlLike.optional(),
  sourceUrl: urlLike.optional(),
  licenseUrl: urlLike.optional(),
  modified: z.boolean().optional(),
});

const ImageLicenseCCBYSchema = z.object({
  type: z.enum(['CC-BY-2.0', 'CC-BY-2.5', 'CC-BY-3.0', 'CC-BY-4.0']),
  author: z.string().min(1),
  authorUrl: urlLike.optional(),
  sourceUrl: urlLike,
  licenseUrl: urlLike,
  modified: z.boolean().optional(),
});

const ImageLicenseCCBYSASchema = z.object({
  type: z.enum(['CC-BY-SA-2.0', 'CC-BY-SA-2.5', 'CC-BY-SA-3.0', 'CC-BY-SA-4.0']),
  author: z.string().min(1),
  authorUrl: urlLike.optional(),
  sourceUrl: urlLike,
  licenseUrl: urlLike,
  modified: z.boolean().optional(),
});

const ImageLicenseOwnSchema = z.object({
  type: z.literal('OWN'),
  author: z.string().min(1).optional(),
});

const ImageLicenseSchema = z.discriminatedUnion('type', [
  ImageLicenseCC0Schema,
  ImageLicenseCCBYSchema,
  ImageLicenseCCBYSASchema,
  ImageLicenseOwnSchema,
]);

const ImageCreditSchema = z.object({
  alt: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  title: z.string().optional(),
  sourceName: z.string().optional(),
  modifications: z.string().optional(),
  license: ImageLicenseSchema,
});

const ImageCreditsRegistrySchema = z.record(z.string(), ImageCreditSchema);

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

// Validate the centralized image-credits registry and cross-check that
// every image referenced by a POI/route has a license entry.
console.log('\n🔍 Validating image-credits registry...\n');
let warnings = 0;
const creditsPath = path.join(contentDir, 'image-credits.json');
let imageCredits: Record<string, unknown> = {};

if (!fs.existsSync(creditsPath)) {
  console.error(`❌ Missing: ${creditsPath}`);
  errors++;
} else {
  try {
    imageCredits = JSON.parse(fs.readFileSync(creditsPath, 'utf-8'));
    const result = ImageCreditsRegistrySchema.safeParse(imageCredits);
    if (!result.success) {
      console.error(`❌ ${creditsPath}:`, JSON.stringify(result.error.flatten(), null, 2));
      errors++;
    } else {
      console.log(`✅ ${creditsPath} (${Object.keys(imageCredits).length} entries)`);
    }
  } catch (e) {
    console.error(`❌ JSON parse error in ${creditsPath}:`, e);
    errors++;
  }
}

console.log('\n🔍 Cross-checking POI images against image-credits registry...\n');
for (const locale of requiredLocales) {
  for (const island of islands) {
    const poisPath = path.join(contentDir, locale, island, 'pois.json');
    if (!fs.existsSync(poisPath)) continue;

    const poisData = JSON.parse(fs.readFileSync(poisPath, 'utf-8'));
    for (const poi of poisData.pois as { slug: string; images?: { hero?: string; gallery?: string[] } }[]) {
      const imagePaths = [poi.images?.hero, ...(poi.images?.gallery ?? [])].filter(
        (src): src is string => Boolean(src)
      );
      for (const src of imagePaths) {
        if (!(src in imageCredits)) {
          console.warn(`⚠️  ${locale}/${island}/pois.json: POI "${poi.slug}" usa "${src}" sin entrada en image-credits.json`);
          warnings++;
        }
      }
    }
  }
}

console.log(`\n${errors > 0 ? '❌' : '✅'} Checked ${checked} items across ${requiredLocales.length * islands.length * 2} files`);
if (warnings > 0) {
  console.log(`⚠️  ${warnings} imagen(es) sin licencia registrada en image-credits.json (no bloquea el build)`);
}

if (errors > 0) {
  console.error(`❌ ${errors} error(s) found. Fix before building.\n`);
  process.exit(1);
} else {
  console.log('✅ All content valid! Ready to build.\n');
}
