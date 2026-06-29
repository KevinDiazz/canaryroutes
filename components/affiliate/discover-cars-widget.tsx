'use client';

import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/types';

// ── Skeleton ─────────────────────────────────────────────────────────────────
function Bone({ w = '100%', h = 16, r = 8, mb = 0 }: {
  w?: string | number; h?: number; r?: number; mb?: number;
}) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: '#e9eef4', marginBottom: mb, flexShrink: 0,
    }} />
  );
}

function DiscoverCarsSkeleton() {
  return (
    <div style={{ padding: '4px 0', display: 'flex', flexDirection: 'column' }}>
      {/* Título */}
      <Bone h={22} r={6} mb={16} w="80%" />
      {/* Campo pickup */}
      <Bone h={52} r={12} mb={8} />
      {/* Campo fechas */}
      <Bone h={52} r={12} mb={8} />
      {/* Campo hora */}
      <Bone h={52} r={12} mb={16} />
      {/* Botón buscar */}
      <Bone h={54} r={12} mb={20} />
      {/* Logos proveedores */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <Bone w={60} h={20} r={6} />
        <Bone w={60} h={20} r={6} />
        <Bone w={60} h={20} r={6} />
        <Bone w={60} h={20} r={6} />
      </div>
    </div>
  );
}

// ── i18n helpers ─────────────────────────────────────────────────────────────
const TITLE: Record<string, string> = {
  es: '¡Compara coches de alquiler y ahorra hasta un 70%!',
  en: 'Search and compare car rentals and save up to 70%!',
  de: 'Vergleiche Mietwagen und spare bis zu 70%!',
};
const DESC: Record<string, string> = {
  es: 'Hemos seleccionado las mejores ofertas de alquiler para Canarias.',
  en: "We've selected the best car rental deals in the Canary Islands.",
  de: 'Die besten Mietwagendeals auf den Kanarischen Inseln.',
};
const SUBMIT: Record<string, string> = {
  es: 'Buscar ahora',
  en: 'Search now',
  de: 'Jetzt suchen',
};
const LANG: Record<string, string> = { es: 'es', en: 'en', de: 'de' };

// ── Component ─────────────────────────────────────────────────────────────────
interface DiscoverCarsWidgetProps {
  /** DiscoverCars location slug, e.g. "spain-canary-islands/gran-canaria" */
  location: string;
  locale: Locale;
}

/**
 * Embeds the DiscoverCars search widget for a specific location.
 *
 * Use `key={location}` at the call site to force remount on location change.
 * The widget script reads its config from data-* attributes on the <script> tag itself,
 * so we inject the element imperatively via useEffect.
 */
export function DiscoverCarsWidget({ location, locale }: DiscoverCarsWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  const lang = LANG[locale] ?? 'en';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Eliminar cualquier instancia previa — script + HTML renderizado
    document.getElementById('dchwidget')?.remove();
    // DiscoverCars puede haber inyectado el widget fuera del contenedor (e.g. hermano del script).
    // Buscamos cualquier wrapper conocido por su clase/atributo y lo eliminamos.
    document.querySelectorAll('.dch-widget-wrapper, [data-dch], .dch-container').forEach(el => el.remove());
    container.innerHTML = '';
    setIsReady(false);

    const script = document.createElement('script');
    script.id = 'dchwidget';
    script.src = 'https://www.discovercars.com/widget.js?v1';
    script.async = true;

    // Set all data attributes using setAttribute (mix of hyphens and underscores
    // as required by the DiscoverCars widget API)
    const attrs: Record<string, string> = {
      'data-dev-env':                   'com',
      'data-location':                  location,
      'data-lang':                      lang,
      'data-currency':                  'eur',
      'data-utm-source':                'canaryroutes',
      'data-utm-medium':                'widget',
      'data-aff-code':                  'a_aid',
      'data-autocomplete':              'on',
      // Estilos del formulario
      'data-style-submit-bg-color':     '#007ac2',
      'data-style-submit-font-color':   '#ffffff',
      'data-style-form-bg-color':       '#fcd34d',
      'data-style-form-font-color':     '#000000',
      'data-style-submit-text':         SUBMIT[locale] ?? SUBMIT.en,
      'data-style-title-color':         '#000000',
      'data-title-text':                TITLE[locale] ?? TITLE.en,
      // Layout
      'data-style_rounded_corners':     'on',
      'data-layout_benefits':           'on',
      'data-layout_description':        'on',
      'data-layout_description_text':   DESC[locale] ?? DESC.en,
      'data-layout_logo_style':         'on dark',
      'data-layout_powered_by':         'on',
      'data-layout_style_form_bg_color':'#007ac2',
      'data-layout_title':              'on',
      'data-layout_supplier_logos':     'on',
    };

    Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));
    container.appendChild(script);

    // Show widget after script has had time to render
    const timer = setTimeout(() => setIsReady(true), 2500);

    return () => {
      clearTimeout(timer);
      document.getElementById('dchwidget')?.remove();
      // Limpiar el HTML renderizado por DiscoverCars dentro del contenedor
      // (necesario para evitar duplicados en React StrictMode / remounts)
      if (container) container.innerHTML = '';
    };
  }, [location, lang]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'relative' }}>
      {/* Skeleton visible mientras carga */}
      <div style={{
        opacity: isReady ? 0 : 1,
        transition: 'opacity 0.3s ease',
        pointerEvents: isReady ? 'none' : 'auto',
        position: isReady ? 'absolute' : 'relative',
        inset: 0,
      }}>
        <DiscoverCarsSkeleton />
      </div>

      {/* Contenedor del widget */}
      <div
        ref={containerRef}
        style={{ opacity: isReady ? 1 : 0, transition: 'opacity 0.3s ease' }}
      />
    </div>
  );
}
