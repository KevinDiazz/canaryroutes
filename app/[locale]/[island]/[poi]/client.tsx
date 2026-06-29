'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PoiDetailSheet } from '@/components/poi-detail-sheet';
import type { POI, Locale, Island } from '@/lib/types';
import type { PhotoCreditGroup } from '@/lib/image-credits';
import { useCart } from '@/hooks/use-cart';

interface Props {
  poi: POI;
  pois: POI[];
  locale: Locale;
  island: Island;
  backUrl?: string;
  photoCreditsBySlug?: Record<string, PhotoCreditGroup[]>;
}

export function PoiDetailPageClient({ poi, pois, locale, island, backUrl, photoCreditsBySlug }: Props) {
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

  const mapUrl = backUrl ?? `/${locale}/${island}`;

  const handleClose = useCallback(() => {
    router.push(mapUrl);
  }, [router, mapUrl]);

  // Interceptar el botón Atrás / gesto de retroceso en mobile.
  //
  // Usamos una ref para que el efecto solo se registre UNA VEZ al montar.
  // Si el efecto tuviera [mapUrl, router] como deps podría re-ejecutarse y
  // empujar múltiples estados ficticios, obligando al usuario a pulsar Atrás
  // varias veces.
  //
  // window.location.replace es más fiable que router.push dentro de popstate
  // porque evita conflictos con el router interno de Next.js.
  useEffect(() => {
    // Garantizar que el mapa esté en el historial justo antes del POI.
    // Técnica: replaceState cambia la entrada actual a la URL del mapa,
    // luego pushState restaura la URL del POI como nueva entrada encima.
    //
    // Historial resultante: [..., /isla (mapa), /isla/poi (actual)]
    //
    // Al pulsar Atrás, el navegador va al mapa y Next.js lo renderiza
    // de forma natural — sin listeners de popstate ni conflictos con el router.
    const poiUrl = window.location.href;
    window.history.replaceState(null, '', mapUrl);
    window.history.pushState(null, '', poiUrl);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      photoCreditGroups={photoCreditsBySlug?.[selectedPoi.slug]}
    />
  );
}
