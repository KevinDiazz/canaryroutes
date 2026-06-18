import type { POI, Island, Locale } from '@/lib/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';

// ── TouristAttraction ─────────────────────────────────────────────────────────
interface TouristAttractionProps {
  poi: POI;
  island: Island;
  locale: Locale;
  categorySlug?: string;
}

export function TouristAttractionJsonLd({ poi, island, locale, categorySlug }: TouristAttractionProps) {
  const url = categorySlug
    ? `${SITE_URL}/${locale}/${island}/${categorySlug}/${poi.slug}`
    : `${SITE_URL}/${locale}/${island}/${poi.slug}`;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: poi.name,
    description: poi.shortDescription || poi.description.slice(0, 200),
    url,
    image: poi.images?.hero ? `${SITE_URL}${poi.images.hero}` : undefined,
    touristType: categoryToTouristType(poi.category),
    isAccessibleForFree: true,
  };

  if (poi.coordinates) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: poi.coordinates.lat,
      longitude: poi.coordinates.lng,
    };
    schema.hasMap = `https://www.google.com/maps?q=${poi.coordinates.lat},${poi.coordinates.lng}`;
  }

  schema.containedInPlace = {
    '@type': 'Island',
    name: island === 'gran-canaria' ? 'Gran Canaria' : 'Tenerife',
    containedInPlace: {
      '@type': 'Country',
      name: 'Spain',
    },
  };

  // Clean undefined values
  const clean = JSON.parse(JSON.stringify(schema));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(clean) }}
    />
  );
}

// ── BreadcrumbList ────────────────────────────────────────────────────────────
interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.href.startsWith('http') ? item.href : `${SITE_URL}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Organization (home) ───────────────────────────────────────────────────────
export function OrganizationJsonLd({ locale }: { locale: Locale }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CanaryRoutes',
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/logo/file.png`,
    description: 'Plataforma turistica premium para descubrir las Islas Canarias.',
    areaServed: {
      '@type': 'Place',
      name: 'Islas Canarias',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function categoryToTouristType(category: POI['category']): string {
  const map: Record<POI['category'], string> = {
    beach:     'Beach lover',
    hiking:    'Hiker',
    culture:   'Culture enthusiast',
    nature:    'Nature lover',
    viewpoint: 'Sightseer',
    food:      'Foodie',
    other:     'Tourist',
  };
  return map[category] ?? 'Tourist';
}
