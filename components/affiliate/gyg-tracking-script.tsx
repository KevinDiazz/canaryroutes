import Script from 'next/script';
import { GYG_PARTNER_ID, GYG_WIDGET_SCRIPT_SRC } from '@/lib/affiliates';

/**
 * GetYourGuide Integration Analyzer.
 *
 * Carga el script oficial de widgets/tracking de GetYourGuide una única vez
 * para toda la web. Es necesario para que cualquier `ActivityWidget` (y las
 * estadísticas de Analítica en el panel de afiliados) funcionen.
 *
 * Se carga con `lazyOnload` para no penalizar LCP/INP.
 */
export function GygTrackingScript() {
  return (
    <Script
      id="gyg-widget-script"
      src={GYG_WIDGET_SCRIPT_SRC}
      strategy="lazyOnload"
      data-gyg-partner-id={GYG_PARTNER_ID}
    />
  );
}
