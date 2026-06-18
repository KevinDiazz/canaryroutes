'use client';

import { useEffect, useState } from 'react';
import { GYG_PARTNER_ID, GYG_CURRENCY, getGygLocaleCode } from '@/lib/affiliates';
import type { Locale } from '@/lib/types';

interface AvailabilityWidgetProps {
  /** GetYourGuide tour ID, e.g. "430098" */
  tourId: string;
  locale: Locale;
  /** Layout orientation. "vertical" works well inside the POI detail sheet. */
  variant?: 'horizontal' | 'vertical';
  /** URL shown in the "Powered by GetYourGuide" attribution link. */
  attributionHref?: string;
}

/** Bloque de skeleton estático reutilizable */
function Bone({ w = '100%', h = 16, radius = 8, mb = 0, warm = false }: {
  w?: string | number; h?: number; radius?: number; mb?: number; warm?: boolean;
}) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: warm ? '#ffe0d9' : '#e9eef4',
      marginBottom: mb, flexShrink: 0,
    }} />
  );
}

/** Skeleton que imita la silueta del widget GYG mientras carga */
function WidgetSkeleton() {
  return (
    <div style={{ padding: '4px 0', display: 'flex', flexDirection: 'column' }}>
      <Bone h={168} radius={14} mb={14} />
      <Bone w="75%" h={15} mb={6} />
      <Bone w="50%" h={15} mb={16} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Bone w={60} h={24} radius={20} />
        <Bone w={80} h={24} radius={20} />
        <Bone w={50} h={24} radius={20} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <Bone w={90} h={28} radius={8} />
        <Bone w={60} h={16} radius={6} />
      </div>
      <Bone h={48} radius={12} mb={10} />
      <Bone h={48} radius={12} mb={16} />
      <Bone h={50} radius={12} warm />
      <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
        <Bone w={140} h={12} radius={6} />
      </div>
    </div>
  );
}

/**
 * Embeds the GetYourGuide "Availability" widget for a single activity.
 *
 * IMPORTANTE: renderizar con `key={tourId}` en el punto de llamada para
 * garantizar que React desmonte/remonte el componente al cambiar de tour.
 * Esto es necesario porque el script de GYG inicializa el widget una sola vez
 * al escanear el DOM, y NO detecta cambios de atributos en elementos ya inicializados.
 *
 * Relies on the global GYG widget script loaded once via
 * `GygTrackingScript` in the root layout.
 */
export function AvailabilityWidget({
  tourId,
  locale,
  variant = 'horizontal',
  attributionHref = 'https://www.getyourguide.com/',
}: AvailabilityWidgetProps) {
  // Skeleton durante los primeros 2.5 s; se resetea automáticamente en cada remount
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      {/* Skeleton — visible mientras el widget no ha cargado */}
      <div
        style={{
          opacity: isReady ? 0 : 1,
          transition: 'opacity 0.3s ease',
          pointerEvents: isReady ? 'none' : 'auto',
          position: isReady ? 'absolute' : 'relative',
          inset: 0,
        }}
      >
        <WidgetSkeleton />
      </div>

      {/* Widget real — empieza invisible, aparece con fade cuando está listo */}
      <div
        style={{
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
        data-gyg-href="https://widget.getyourguide.com/default/availability.frame"
        data-gyg-tour-id={tourId}
        data-gyg-locale-code={getGygLocaleCode(locale)}
        data-gyg-currency={GYG_CURRENCY}
        data-gyg-widget="availability"
        data-gyg-variant={variant}
        data-gyg-partner-id={GYG_PARTNER_ID}
      >
        <span>
          Powered by{' '}
          <a target="_blank" rel="sponsored noopener" href={attributionHref}>
            GetYourGuide
          </a>
        </span>
      </div>
    </div>
  );
}
