'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { IslandMap } from '@/components/island-map';
import { CATEGORY_URL_TO_FILTER } from '@/lib/categories';
import type { Locale, Island, POI, Section, Municipio } from '@/lib/types';
import type { PhotoCreditGroup } from '@/lib/image-credits';

interface Props {
  locale: Locale;
  island: Island;
  poisByIsland: Record<Island, POI[]>;
  sectionsByIsland: Record<Island, Section[]>;
  municipiosByIsland: Record<Island, Municipio[]>;
  islandName: string;
  photoCreditsBySlug: Record<string, PhotoCreditGroup[]>;
}

/** Lee ?cat=playas (slug de URL) y lo traduce al filtro interno del mapa. */
function MapWithFilter({ locale, island, ...rest }: Props) {
  const cat = useSearchParams().get('cat');
  const initialFilter = cat ? CATEGORY_URL_TO_FILTER[cat] : undefined;
  return (
    <div className="desktop-wrapper">
      <div className="app-shell" style={{ height: '100svh' }}>
        <IslandMap
          locale={locale}
          initialIsland={island}
          initialFilter={initialFilter}
          {...rest}
        />
      </div>
    </div>
  );
}

export function MapScreen(props: Props) {
  // useSearchParams en export estático exige un límite Suspense.
  return (
    <Suspense fallback={null}>
      <MapWithFilter {...props} />
    </Suspense>
  );
}
