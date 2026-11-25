import { notFound } from 'next/navigation';
import { locales, islands, type Locale, type Island } from '@/lib/types';
import { getPOIs, getSections, getMunicipios } from '@/lib/content';
import { getPhotoCredits, type PhotoCreditGroup } from '@/lib/image-credits';
import { getIslandDisplayName } from '@/lib/i18n';
import { MapScreen } from '@/components/map-screen';
import type { Metadata } from 'next';

// El mapa es una app interactiva (SPA): no aporta contenido indexable propio.
// La estrategia SEO vive en las páginas de isla y categoría, que enlazan aquí.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; island: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, island: rawIsland } = await params;
  const locale = rawLocale as Locale;
  const island = rawIsland as Island;
  if (!(islands as readonly string[]).includes(island)) return {};
  const name = getIslandDisplayName(island, locale);
  return {
    title: `${name} — Mapa | CanaryRoutes`,
    robots: { index: false, follow: true },
  };
}

export async function generateStaticParams() {
  return locales.flatMap((locale) => islands.map((island) => ({ locale, island })));
}

export default async function IslandMapPage({
  params,
}: {
  params: Promise<{ locale: string; island: string }>;
}) {
  const { locale: rawLocale, island: rawIsland } = await params;
  const locale = rawLocale as Locale;
  const island = rawIsland as Island;
  if (!(islands as readonly string[]).includes(island)) notFound();

  const poisByIsland: Record<Island, ReturnType<typeof getPOIs>> = {
    'gran-canaria': getPOIs(locale, 'gran-canaria'),
    tenerife: getPOIs(locale, 'tenerife'),
  };
  const sectionsByIsland: Record<Island, ReturnType<typeof getSections>> = {
    'gran-canaria': getSections(locale, 'gran-canaria'),
    tenerife: getSections(locale, 'tenerife'),
  };
  const municipiosByIsland = {
    'gran-canaria': getMunicipios('gran-canaria', locale),
    tenerife: getMunicipios('tenerife', locale),
  };

  // Créditos fotográficos para la ficha de detalle (POIs + municipios).
  const photoCreditsBySlug: Record<string, PhotoCreditGroup[]> = {};
  for (const islandPois of Object.values(poisByIsland)) {
    for (const p of islandPois) {
      if (!photoCreditsBySlug[p.slug]) photoCreditsBySlug[p.slug] = getPhotoCredits(p.images);
    }
  }
  for (const munis of Object.values(municipiosByIsland)) {
    for (const m of munis) {
      if (m.images && !photoCreditsBySlug[m.slug]) photoCreditsBySlug[m.slug] = getPhotoCredits(m.images);
    }
  }

  return (
    <MapScreen
      locale={locale}
      island={island}
      poisByIsland={poisByIsland}
      sectionsByIsland={sectionsByIsland}
      municipiosByIsland={municipiosByIsland}
      islandName={getIslandDisplayName(island, locale)}
      photoCreditsBySlug={photoCreditsBySlug}
    />
  );
}
