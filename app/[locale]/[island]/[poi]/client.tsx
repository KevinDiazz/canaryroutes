'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PoiDetailSheet } from '@/components/poi-detail-sheet';
import type { POI, Locale, Island } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';

interface Props {
  poi: POI;
  pois: POI[];
  locale: Locale;
  island: Island;
  backUrl?: string;
}

export function PoiDetailPageClient({ poi, pois, locale, island, backUrl }: Props) {
  const router = useRouter();
  const cart = useCart();
  const [selectedPoi, setSelectedPoi] = useState<POI>(poi);

  // Si Next.js conserva esta instancia del cliente al cambiar de idioma
  // (navegación suave dentro de [locale]/layout), `poi` llega actualizado
  // con los datos/fotos del nuevo idioma pero `selectedPoi` quedaría
  // anclado al valor inicial. Lo resincronizamos cuando cambia el slug.
  useEffect(() => {
    setSelectedPoi(poi);
  }, [poi]);

  const handleClose = useCallback(() => {
    router.push(backUrl ?? `/${locale}/${island}`);
  }, [router, locale, island, backUrl]);

  const handlePoiChange = useCallback((newPoi: POI) => {
    setSelectedPoi(newPoi);
    // replaceState instead of router.replace — avoids full page remount,
    // preserving bubble scroll position and preventing flash-to-first.
    const newPath = backUrl
      ? `${backUrl}/${newPoi.slug}/`
      : `/${locale}/${island}/${newPoi.slug}/`;
    window.history.replaceState(null, '', newPath);
  }, [locale, island, backUrl]);

  const handleAddToCart = useCallback((p: POI) => {
    cart.addPoi(p);
  }, [cart]);

 return (
    <PoiDetailSheet
      pois={pois}
      selectedPoi={selectedPoi}
      onPoiChange={handlePoiChange}
      onClose={handleClose}
      cart={cart}
      onAddToCart={handleAddToCart}
      locale={locale}
    />
  );
}
