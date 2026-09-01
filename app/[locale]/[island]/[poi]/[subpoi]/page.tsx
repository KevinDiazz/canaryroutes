import { locales, islands, type Locale, type Island } from '@/lib/types';
import { getPOI, getAllPOISlugs, getPOIs } from '@/lib/content';
import { getIslandDisplayName, withTrailingSlash } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PoiDetailPageClient } from '../client';
import { ALL_CATEGORY_SLUGS, CATEGORY_URL_TO_FILTER, CATEGORY_LABELS } from '@/lib/categories';
import { TouristAttractionJsonLd, BreadcrumbJsonLd } from '@/components/json-ld';
import { Breadcrumb } from '@/components/breadcrumb';
import { getPhotoCredits } from '@/lib/image-credits';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; island: string; poi: string; subpoi: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, island: rawIsland, poi: categorySlug, subpoi: poiSlug } = await params;
  const locale = rawLocale as Locale;
  const island = rawIsland as Island;
  const poi = getPOI(locale, island, poiSlug);
  if (!poi) return {};
  const islandName = getIslandDisplayName(island, locale);
  const title = `${poi.name} — ${islandName} | CanaryRoutes`;
  const description = poi.shortDescription || poi.description.slice(0, 155);
  const url = withTrailingSlash(`${SITE_URL}/${locale}/${island}/${categorySlug}/${poi.slug}`);
  const heroImage = poi.images?.hero
    ? `${SITE_URL}${poi.images.hero}`
    : `${SITE_URL}/og-default.png`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, withTrailingSlash(`${SITE_URL}/${l}/${island}/${categorySlug}/${poi.slug}`)])),
        'x-default': withTrailingSlash(`${SITE_URL}/es/${island}/${categorySlug}/${poi.slug}`),
      },
    },
    openGraph: {
      title, description, url, siteName: 'CanaryRoutes', locale, type: 'article',
      images: [{ url: heroImage, width: 1200, height: 630, alt: poi.name }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [heroImage] },
  };
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    islands.flatMap((island) =>
      ALL_CATEGORY_SLUGS.flatMap((categorySlug) => {
        const filterId = CATEGORY_URL_TO_FILTER[categorySlug];
        const allPois = getPOIs(locale, island);
        return getAllPOISlugs(island)
          .filter((poiSlug) => {
            // Only include POIs that belong to this category
            const poi = allPois.find((p) => p.slug === poiSlug);
            if (!poi) return false;
            const chip: Record<string, (c: string) => boolean> = {
              beach: (c) => c === 'beach',
              hiking: (c) => c === 'hiking',
              culture: (c) => c === 'culture',
              nature: (c) => c === 'nature',
              activities: (c) => ['viewpoint', 'food', 'other'].includes(c),
              transport: (c) => c === 'transport',
            };
            return chip[filterId]?.(poi.category) ?? false;
          })
          .map((subpoi) => ({ locale, island, poi: categorySlug, subpoi }));
      })
    )
  );
}

export default async function CategoryPoiPage({
  params,
}: {
  params: Promise<{ locale: string; island: string; poi: string; subpoi: string }>;
}) {
  const { locale: rawLocale, island: rawIsland, poi: categorySlug, subpoi: poiSlug } = await params;
  const locale = rawLocale as Locale;
  const island = rawIsland as Island;

  // Validate category
  if (!ALL_CATEGORY_SLUGS.includes(categorySlug)) notFound();

  const poi = getPOI(locale, island, poiSlug);
  if (!poi) notFound();

  // POIs de la misma categoría para los bubbles en la sheet
  const filterId = CATEGORY_URL_TO_FILTER[categorySlug];
  const allIslandPois = getPOIs(locale, island);
  const catMap: Record<string, string[]> = {
    beach: ['beach'], hiking: ['hiking'], culture: ['culture'],
    nature: ['nature'], activities: ['viewpoint', 'food', 'other'],
    transport: ['transport'],
  };
  const pois = filterId === 'top'
    ? allIslandPois.filter((p) => !!p.top)
    : (catMap[filterId] ? allIslandPois.filter((p) => catMap[filterId].includes(p.category)) : [poi]);

  const islandLabel = getIslandDisplayName(island, locale);
  const categoryLabel = CATEGORY_LABELS[categorySlug] ?? categorySlug;

  // Créditos fotográficos de todos los POIs que pueden mostrarse en las
  // burbujas de navegación, para que el carrusel los muestre al cambiar de POI.
  const photoCreditsBySlug: Record<string, ReturnType<typeof getPhotoCredits>> = {};
  for (const p of [poi, ...pois]) {
    if (!photoCreditsBySlug[p.slug]) {
      photoCreditsBySlug[p.slug] = getPhotoCredits(p.images);
    }
  }

  return (
    <div className="desktop-wrapper">
      <TouristAttractionJsonLd poi={poi} island={island} locale={locale} categorySlug={categorySlug} />
      <BreadcrumbJsonLd items={[
        { name: 'CanaryRoutes', href: withTrailingSlash('/' + locale) },
        { name: islandLabel, href: withTrailingSlash('/' + locale + '/' + island) },
        { name: categoryLabel, href: withTrailingSlash('/' + locale + '/' + island + '/' + categorySlug) },
        { name: poi.name, href: withTrailingSlash('/' + locale + '/' + island + '/' + categorySlug + '/' + poi.slug) },
      ]} />
      <Breadcrumb srOnly items={[
        { name: 'CanaryRoutes', href: withTrailingSlash('/' + locale) },
        { name: islandLabel, href: withTrailingSlash('/' + locale + '/' + island) },
        { name: categoryLabel, href: withTrailingSlash('/' + locale + '/' + island + '/' + categorySlug) },
        { name: poi.name, href: withTrailingSlash('/' + locale + '/' + island + '/' + categorySlug + '/' + poi.slug) },
      ]} />
      <div className="app-shell" style={{ height: '100svh' }}>
        <PoiDetailPageClient
          poi={poi}
          pois={pois}
          locale={locale}
          island={island}
          backUrl={`/${locale}/${island}/${categorySlug}`}
          photoCreditsBySlug={photoCreditsBySlug}
        />
      </div>
    </div>
  );
}
