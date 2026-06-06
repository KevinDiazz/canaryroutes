import { locales, islands, type Locale, type Island } from '@/lib/types';
import { getPOIs, getSections, getMunicipios } from '@/lib/content';
import { IslandMap } from '@/components/island-map';
import { getIslandDisplayName } from '@/lib/i18n';

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
    'gran-canaria': getMunicipios('gran-canaria'),
    'tenerife': getMunicipios('tenerife'),
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
