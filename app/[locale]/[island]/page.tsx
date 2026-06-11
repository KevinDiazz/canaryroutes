import { locales, islands, type Locale, type Island } from '@/lib/types';
import { getPOIs, getSections, getMunicipios } from '@/lib/content';
import { IslandMap } from '@/components/island-map';
import { getIslandDisplayName } from '@/lib/i18n';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';

const islandDescriptions: Record<string, Record<string, string>> = {
  'gran-canaria': {
    es: 'Explora Gran Canaria: playas, senderos, miradores y cultura. Crea tu ruta personalizada con CanaryRoutes.',
    en: 'Explore Gran Canaria: beaches, hikes, viewpoints and culture. Build your custom route with CanaryRoutes.',
    de: 'Entdecke Gran Canaria: Strände, Wanderwege, Aussichtspunkte und Kultur. Erstelle deine Route mit CanaryRoutes.',
  },
  tenerife: {
    es: 'Descubre Tenerife: playas, rutas de senderismo, el Teide y mas. Planifica tu viaje con CanaryRoutes.',
    en: 'Discover Tenerife: beaches, hiking trails, Teide and more. Plan your trip with CanaryRoutes.',
    de: 'Entdecke Teneriffa: Strände, Wanderwege, den Teide und mehr. Plane deine Reise mit CanaryRoutes.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; island: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, island: rawIsland } = await params;
  const locale = rawLocale as Locale;
  const island = rawIsland as Island;
  const islandName = getIslandDisplayName(island, locale);
  const desc = islandDescriptions[island]?.[locale] ?? islandDescriptions[island]?.['en'] ?? '';
  const title = `${islandName} — Mapa de viaje | CanaryRoutes`;
  const url = `${SITE_URL}/${locale}/${island}`;

  return {
    title,
    description: desc,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}/${island}`])),
        'x-default': `${SITE_URL}/es/${island}`,
      },
    },
    openGraph: {
      title,
      description: desc,
      url,
      siteName: 'CanaryRoutes',
      locale,
      type: 'website',
      images: [{ url: SITE_URL + '/og-default.svg', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [SITE_URL + '/og-default.svg'],
    },
  };
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    islands.map((island) => ({ locale, island }))
  );
}

export default async function IslandPage({
  params,
}: {
  params: Promise<{ locale: string; island: string }>;
}) {
  const { locale: rawLocale, island: rawIsland } = await params;
  const locale = rawLocale as Locale;
  const island = rawIsland as Island;

  const poisByIsland: Record<Island, ReturnType<typeof getPOIs>> = {
    'gran-canaria': getPOIs(locale, 'gran-canaria'),
    'tenerife': getPOIs(locale, 'tenerife'),
  };

  const sectionsByIsland: Record<Island, ReturnType<typeof getSections>> = {
    'gran-canaria': getSections(locale, 'gran-canaria'),
    'tenerife': getSections(locale, 'tenerife'),
  };

  const municipiosByIsland = {
    'gran-canaria': getMunicipios('gran-canaria', locale),
    'tenerife': getMunicipios('tenerife', locale),
  };

  const islandName = getIslandDisplayName(island, locale);

  return (
    <div className="desktop-wrapper">
      <div className="app-shell" style={{ height: '100svh' }}>
        <IslandMap
          locale={locale}
          poisByIsland={poisByIsland}
          sectionsByIsland={sectionsByIsland}
          municipiosByIsland={municipiosByIsland}
          initialIsland={island}
          islandName={islandName}
        />
      </div>
    </div>
  );
}
