import type { Locale } from './types';

/**
 * Configuración centralizada del programa de afiliados de GetYourGuide (GYG).
 *
 * Toda la integración (Integration Analyzer + widgets) se apoya en el script
 * oficial `pa.umd.production.min.js`, que GYG inyecta una sola vez y que
 * escanea el DOM en busca de elementos `[data-gyg-widget]`.
 */

export const GYG_PARTNER_ID = 'RRMXJXQ';

export const GYG_WIDGET_SCRIPT_SRC = 'https://widget.getyourguide.com/dist/pa.umd.production.min.js';

/**
 * Convierte el locale interno de CanaryRoutes al código de idioma que
 * espera el widget de GetYourGuide.
 */
export function getGygLocaleCode(locale: Locale): string {
  const map: Record<Locale, string> = {
    es: 'es-ES',
    en: 'en-US',
    de: 'de-DE',
  };
  return map[locale] ?? 'en-US';
}

/** Moneda mostrada en los widgets. Las Islas Canarias usan EUR. */
export const GYG_CURRENCY = 'EUR';
