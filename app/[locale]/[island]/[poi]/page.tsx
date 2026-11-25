import { locales, islands, type Locale, type Island } from '@/lib/types';
import { getPOI, getAllPOISlugs, getPOIs } from '@/lib/content';
import { getIslandDisplayName, withTrailingSlash } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PoiDetailPageClient } from './client';
import { CategoryHubPage } from '@/components/hub-pages';
import { CATEGORY_SEO } from '@/lib/category-seo';
import { HUB_CATEGORY_SLUGS } from '@/lib/poi-utils';
import { CATEGORY_LABELS, POI_CATEGORY_TO_SLUG } from '@/lib/categories';
import { TouristAttractionJsonLd, BreadcrumbJsonLd } from '@/components/json-ld';
import { Breadcrumb } from '@/components/breadcrumb';
import { getPhotoCredits } from '@/lib/image-credits';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; island: string; poi: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, island: rawIsland, poi: slug } = await params;
  const locale = rawLocale as Locale;
  const island = rawIsland as Island;
  const islandName = getIslandDisplayName(island, locale);

  if (HUB_CATEGORY_SLUGS.includes(slug)) {
    const seoCopy = CATEGORY_SEO[slug]?.[locale]?.[island];
    const label = CATEGORY_LABELS[slug] ?? slug;
    const title = seoCopy ? `${seoCopy.h1} | CanaryRoutes` : `${label} en ${islandName} | CanaryRoutes`;
    const description = seoCopy?.description ?? `Descubre los mejores lugares de ${label.toLowerCase()} en ${islandName}. Planifica tu ruta con CanaryRoutes.`;
    const url = withTrailingSlash(`${SITE_URL}/${locale}/${island}/${slug}`);
    return {
      title,
      description,
      alternates: {
        canonical: url,
        languages: {
          ...Object.fromEntries(locales.map((l) => [l, withTrailingSlash(`${SITE_URL}/${l}/${island}/${slug}`)])),
          'x-default': withTrailingSlash(`${SITE_URL}/es/${island}/${slug}`),
        },
      },
      openGraph: {
        title, description, url, siteName: 'CanaryRoutes', type: 'website',
        images: [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630, alt: title }],
      },
      twitter: { card: 'summary_large_image', title, description, images: [`${SITE_URL}/og-default.png`] },
    };
  }

  const poi = getPOI(locale, island, slug);
  if (!poi) return {};
  const title = `${poi.name} — ${islandName} | CanaryRoutes`;
  const description = poi.shortDescription || poi.description.slice(0, 155);
  // Canonical points to the canonical category URL to avoid duplicate content
  const poiCatSlug = POI_CATEGORY_TO_SLUG[poi.category] ?? 'actividades';
  const canonicalUrl = withTrailingSlash(`${SITE_URL}/${locale}/${island}/${poiCatSlug}/${poi.slug}`);
  const heroImage = poi.images?.hero ? `${SITE_URL}${poi.images.hero}` : `${SITE_URL}/og-default.png`;
  return {
    title,
    description,
    // Ruta heredada /isla/poi/: duplica la URL canónica /isla/categoria/poi/
    robots: { index: false, follow: true },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, withTrailingSlash(`${SITE_URL}/${l}/${island}/${poiCatSlug}/${poi.slug}`)])),
        'x-default': withTrailingSlash(`${SITE_URL}/es/${island}/${poiCatSlug}/${poi.slug}`),
      },
    },
    openGraph: {
      title, description, url: canonicalUrl, siteName: 'CanaryRoutes', locale, type: 'article',
      images: [{ url: heroImage, width: 1200, height: 630, alt: poi.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title, description,
      images: [heroImage],
    },
  };
}

export async function generateStaticParams() {
  const poiParams = locales.flatMap((locale) =>
    islands.flatMap((island) =>
      getAllPOISlugs(island).map((poi) => ({ locale, island, poi }))
    )
  );
  const categoryParams = locales.flatMap((locale) =>
    islands.flatMap((island) =>
      HUB_CATEGORY_SLUGS.map((poi) => ({ locale, island, poi }))
    )
  );
  return [...poiParams, ...categoryParams];
}

export default async function SlugPage({
  params,
}: {
  params: Promise<{ locale: string; island: string; poi: string }>;
}) {
  const { locale: rawLocale, island: rawIsland, poi: slug } = await params;
  const locale = rawLocale as Locale;
  const island = rawIsland as Island;

  // Category page → página de contenido (SEO). El mapa vive en /mapa/
  if (HUB_CATEGORY_SLUGS.includes(slug)) {
    return <CategoryHubPage locale={locale} island={island} categorySlug={slug} />;
  }

  // POI page
  const poi = getPOI(locale, island, slug);
  if (!poi) notFound();
  const allPois = getPOIs(locale, island);
  // Show bubbles for same-group POIs.
  // Top POIs → only top POIs. Otherwise → same category group.
  const ACTIVITY_CATS = ['viewpoint', 'food', 'other'];
  const pois = poi.top
    ? allPois.filter((p) => !!p.top)
    : allPois.filter((p) =>
        ACTIVITY_CATS.includes(poi.category)
          ? ACTIVITY_CATS.includes(p.category)
          : p.category === poi.category
      );

  const islandLabel2 = getIslandDisplayName(island, locale);
  const poiCategorySlug = POI_CATEGORY_TO_SLUG[poi.category] ?? 'actividades';
  const categoryLabel2 = CATEGORY_LABELS[poiCategorySlug] ?? poiCategorySlug;

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
      <TouristAttractionJsonLd poi={poi} island={island} locale={locale} categorySlug={poiCategorySlug} />
      <BreadcrumbJsonLd items={[
        { name: 'CanaryRoutes', href: withTrailingSlash('/' + locale) },
        { name: islandLabel2, href: withTrailingSlash('/' + locale + '/' + island) },
        { name: categoryLabel2, href: withTrailingSlash('/' + locale + '/' + island + '/' + poiCategorySlug) },
        { name: poi.name, href: withTrailingSlash('/' + locale + '/' + island + '/' + poiCategorySlug + '/' + poi.slug) },
      ]} />
      <Breadcrumb srOnly items={[
        { name: 'CanaryRoutes', href: withTrailingSlash('/' + locale) },
        { name: islandLabel2, href: withTrailingSlash('/' + locale + '/' + island) },
        { name: categoryLabel2, href: withTrailingSlash('/' + locale + '/' + island + '/' + poiCategorySlug) },
        { name: poi.name, href: withTrailingSlash('/' + locale + '/' + island + '/' + poiCategorySlug + '/' + poi.slug) },
      ]} />
      <div className="app-shell" style={{ height: '100svh' }}>
        <PoiDetailPageClient
          poi={poi}
          pois={pois}
          locale={locale}
          island={island}
          backUrl={`/${locale}/${island}/mapa/?cat=${poiCategorySlug}`}
          basePath={`/${locale}/${island}/${poiCategorySlug}`}
          photoCreditsBySlug={photoCreditsBySlug}
        />
      </div>
    </div>
  );
}
