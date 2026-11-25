import type { MetadataRoute } from 'next';
import { locales, islands } from '@/lib/types';
import { HUB_CATEGORY_SLUGS } from '@/lib/poi-utils';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';

export const dynamic = 'force-static';

// El sitio usa trailingSlash: true (next.config.ts) y redirige toda URL sin
// barra final a su versión canónica con barra final. Todas las URLs del
// sitemap deben incluir esa barra para no generar redirecciones al rastrear.
const withSlash = (url: string) => (url.endsWith('/') ? url : url + '/');

// Estrategia SEO: el sitemap solo lista lo que queremos posicionar.
//   · Home e islas (portadas)            → prioridad alta
//   · Páginas de categoría por isla      → núcleo del SEO
// Quedan fuera (noindex): el mapa (/mapa/) y las fichas de POI, que alimentan
// las guías por categoría pero no se posicionan por sí solas.
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  const alternatesFor = (build: (l: string) => string) => ({
    languages: Object.fromEntries(locales.map((l) => [l, withSlash(build(l))])),
  });

  // Home por idioma
  for (const locale of locales) {
    entries.push({
      url: withSlash(`${SITE_URL}/${locale}`),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates: alternatesFor((l) => `${SITE_URL}/${l}`),
    });
  }

  // Portada de cada isla
  for (const locale of locales) {
    for (const island of islands) {
      entries.push({
        url: withSlash(`${SITE_URL}/${locale}/${island}`),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.95,
        alternates: alternatesFor((l) => `${SITE_URL}/${l}/${island}`),
      });
    }
  }

  // Páginas de categoría (playas, senderos, cultura, naturaleza, actividades, transporte)
  for (const locale of locales) {
    for (const island of islands) {
      for (const category of HUB_CATEGORY_SLUGS) {
        entries.push({
          url: withSlash(`${SITE_URL}/${locale}/${island}/${category}`),
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.9,
          alternates: alternatesFor((l) => `${SITE_URL}/${l}/${island}/${category}`),
        });
      }
    }
  }

  return entries;
}
