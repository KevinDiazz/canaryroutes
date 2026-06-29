import { locales, islands, type Locale, type Island } from '@/lib/types';
import { getPOI, getAllPOISlugs, getPOIs, getSections, getMunicipios } from '@/lib/content';
import { getIslandDisplayName } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PoiDetailPageClient } from './client';
import { IslandMap } from '@/components/island-map';
import { ALL_CATEGORY_SLUGS, CATEGORY_URL_TO_FILTER, CATEGORY_LABELS, POI_CATEGORY_TO_SLUG } from '@/lib/categories';
import { TouristAttractionJsonLd, BreadcrumbJsonLd } from '@/components/json-ld';
import { Breadcrumb } from '@/components/breadcrumb';
import { getPhotoCredits } from '@/lib/image-credits';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';

// SEO copy per category, language and island
type SeoCopy = { h1: string; description: string };
const CATEGORY_SEO: Record<string, Record<string, Record<string, SeoCopy>>> = {
  playas: {
    es: {
      'gran-canaria': { h1: 'Playas de Gran Canaria', description: 'Descubre las mejores playas de Gran Canaria: desde las dunas de Maspalomas hasta las calas escondidas del norte. Planifica tu ruta costera con CanaryRoutes.' },
      tenerife: { h1: 'Playas de Tenerife', description: 'Explora las playas mas bonitas de Tenerife, con arenas negras volcanicas y aguas cristalinas. Crea tu itinerario playero con CanaryRoutes.' },
    },
    en: {
      'gran-canaria': { h1: 'Beaches of Gran Canaria', description: 'Discover the best beaches in Gran Canaria: from the Maspalomas dunes to hidden coves in the north. Plan your coastal route with CanaryRoutes.' },
      tenerife: { h1: 'Beaches of Tenerife', description: 'Explore the most beautiful beaches in Tenerife, with black volcanic sands and crystal-clear waters. Build your beach itinerary with CanaryRoutes.' },
    },
    de: {
      'gran-canaria': { h1: 'Straende auf Gran Canaria', description: 'Entdecke die schoensten Straende Gran Canarias: von den Duenen von Maspalomas bis zu versteckten Buchten im Norden. Plane deine Kuestenroute mit CanaryRoutes.' },
      tenerife: { h1: 'Straende auf Teneriffa', description: 'Erkunde die schoensten Straende Teneriffas mit schwarzem Vulkansand und kristallklarem Wasser. Erstelle deine Strand-Route mit CanaryRoutes.' },
    },
  },
  senderos: {
    es: {
      'gran-canaria': { h1: 'Senderos de Gran Canaria', description: 'Rutas de senderismo en Gran Canaria: barrancos, cumbres y paisajes unicos. Planifica tu trekking con CanaryRoutes.' },
      tenerife: { h1: 'Senderos de Tenerife', description: 'Senderismo en Tenerife: desde el Teide hasta los bosques de laurisilva. Descubre las mejores rutas con CanaryRoutes.' },
    },
    en: {
      'gran-canaria': { h1: 'Hiking trails in Gran Canaria', description: 'Hiking routes in Gran Canaria: ravines, mountain peaks and unique landscapes. Plan your trekking with CanaryRoutes.' },
      tenerife: { h1: 'Hiking trails in Tenerife', description: 'Hiking in Tenerife: from Mount Teide to laurel forests. Discover the best trails with CanaryRoutes.' },
    },
    de: {
      'gran-canaria': { h1: 'Wanderwege auf Gran Canaria', description: 'Wanderrouten auf Gran Canaria: Schluchten, Berggipfel und einzigartige Landschaften. Plane deine Trekkingtour mit CanaryRoutes.' },
      tenerife: { h1: 'Wanderwege auf Teneriffa', description: 'Wandern auf Teneriffa: vom Teide bis zu den Lorbeerwaeldern. Entdecke die besten Routen mit CanaryRoutes.' },
    },
  },
  cultura: {
    es: {
      'gran-canaria': { h1: 'Cultura en Gran Canaria', description: 'Museos, cascos historicos y patrimonio cultural de Gran Canaria. Disena tu ruta cultural con CanaryRoutes.' },
      tenerife: { h1: 'Cultura en Tenerife', description: 'Arte, historia y tradiciones de Tenerife. Explora el patrimonio de la isla con CanaryRoutes.' },
    },
    en: {
      'gran-canaria': { h1: 'Culture in Gran Canaria', description: 'Museums, historic centers and cultural heritage of Gran Canaria. Design your cultural route with CanaryRoutes.' },
      tenerife: { h1: 'Culture in Tenerife', description: 'Art, history and traditions of Tenerife. Explore the island heritage with CanaryRoutes.' },
    },
    de: {
      'gran-canaria': { h1: 'Kultur auf Gran Canaria', description: 'Museen, historische Altstaedte und kulturelles Erbe Gran Canarias. Gestalte deine Kulturroute mit CanaryRoutes.' },
      tenerife: { h1: 'Kultur auf Teneriffa', description: 'Kunst, Geschichte und Traditionen Teneriffas. Entdecke das Kulturerbe der Insel mit CanaryRoutes.' },
    },
  },
  naturaleza: {
    es: {
      'gran-canaria': { h1: 'Naturaleza en Gran Canaria', description: 'Reservas naturales, dunas, bosques y espacios protegidos de Gran Canaria. Conectate con la naturaleza con CanaryRoutes.' },
      tenerife: { h1: 'Naturaleza en Tenerife', description: 'Parques naturales, volcanes y biodiversidad unica de Tenerife. Explora la naturaleza canaria con CanaryRoutes.' },
    },
    en: {
      'gran-canaria': { h1: 'Nature in Gran Canaria', description: 'Nature reserves, dunes, forests and protected areas of Gran Canaria. Connect with nature using CanaryRoutes.' },
      tenerife: { h1: 'Nature in Tenerife', description: 'Natural parks, volcanoes and unique biodiversity of Tenerife. Explore Canarian nature with CanaryRoutes.' },
    },
    de: {
      'gran-canaria': { h1: 'Natur auf Gran Canaria', description: 'Naturschutzgebiete, Duenen, Waelder und geschuetzte Bereiche Gran Canarias. Erlebe die Natur mit CanaryRoutes.' },
      tenerife: { h1: 'Natur auf Teneriffa', description: 'Naturparks, Vulkane und einzigartige Artenvielfalt Teneriffas. Entdecke die kanarische Natur mit CanaryRoutes.' },
    },
  },
  actividades: {
    es: {
      'gran-canaria': { h1: 'Actividades en Gran Canaria', description: 'Miradores, gastronomia y actividades al aire libre en Gran Canaria. Organiza tu aventura con CanaryRoutes.' },
      tenerife: { h1: 'Actividades en Tenerife', description: 'Gastronomia local, miradores y experiencias unicas en Tenerife. Planifica tu viaje con CanaryRoutes.' },
    },
    en: {
      'gran-canaria': { h1: 'Activities in Gran Canaria', description: 'Viewpoints, gastronomy and outdoor activities in Gran Canaria. Organise your adventure with CanaryRoutes.' },
      tenerife: { h1: 'Activities in Tenerife', description: 'Local gastronomy, viewpoints and unique experiences in Tenerife. Plan your trip with CanaryRoutes.' },
    },
    de: {
      'gran-canaria': { h1: 'Aktivitaeten auf Gran Canaria', description: 'Aussichtspunkte, Gastronomie und Outdoor-Aktivitaeten auf Gran Canaria. Organisiere dein Abenteuer mit CanaryRoutes.' },
      tenerife: { h1: 'Aktivitaeten auf Teneriffa', description: 'Lokale Gastronomie, Aussichtspunkte und einzigartige Erlebnisse auf Teneriffa. Plane deine Reise mit CanaryRoutes.' },
    },
  },
  transporte: {
    es: {
      'gran-canaria': { h1: 'Cómo moverse por Gran Canaria', description: 'Guaguas, ferries, alquiler de coche y tranvía en Gran Canaria. Todo lo que necesitas para moverte por la isla con CanaryRoutes.' },
      tenerife: { h1: 'Cómo moverse por Tenerife', description: 'Tranvía, guaguas TITSA, ferries y alquiler de coche en Tenerife. Descubre la mejor forma de explorar la isla con CanaryRoutes.' },
    },
    en: {
      'gran-canaria': { h1: 'Getting around Gran Canaria', description: 'Buses, ferries, car rental and tram in Gran Canaria. Everything you need to get around the island with CanaryRoutes.' },
      tenerife: { h1: 'Getting around Tenerife', description: 'Tram, TITSA buses, ferries and car rental in Tenerife. Find the best way to explore the island with CanaryRoutes.' },
    },
    de: {
      'gran-canaria': { h1: 'Fortbewegung auf Gran Canaria', description: 'Busse, Faehren, Mietwagen und Strassenbahn auf Gran Canaria. Alles, was du brauchst, um die Insel zu erkunden — mit CanaryRoutes.' },
      tenerife: { h1: 'Fortbewegung auf Teneriffa', description: 'Strassenbahn, TITSA-Busse, Faehren und Mietwagen auf Teneriffa. Entdecke die beste Art, die Insel zu erkunden — mit CanaryRoutes.' },
    },
  },
  top: {
    es: {
      'gran-canaria': { h1: 'Lo mejor de Gran Canaria', description: 'Los lugares imprescindibles de Gran Canaria seleccionados por CanaryRoutes. No te pierdas ninguno.' },
      tenerife: { h1: 'Lo mejor de Tenerife', description: 'Los rincones imprescindibles de Tenerife segun CanaryRoutes. Crea tu lista de favoritos.' },
    },
    en: {
      'gran-canaria': { h1: 'Best of Gran Canaria', description: 'The must-see places in Gran Canaria selected by CanaryRoutes. Do not miss a single one.' },
      tenerife: { h1: 'Best of Tenerife', description: 'The must-see spots in Tenerife according to CanaryRoutes. Build your favourites list.' },
    },
    de: {
      'gran-canaria': { h1: 'Das Beste von Gran Canaria', description: 'Die Highlights Gran Canarias, ausgewaehlt von CanaryRoutes. Verpasse keinen einzigen.' },
      tenerife: { h1: 'Das Beste von Teneriffa', description: 'Die Highlights Teneriffas laut CanaryRoutes. Erstelle deine Favoritenliste.' },
    },
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; island: string; poi: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, island: rawIsland, poi: slug } = await params;
  const locale = rawLocale as Locale;
  const island = rawIsland as Island;
  const islandName = getIslandDisplayName(island, locale);

  if (ALL_CATEGORY_SLUGS.includes(slug)) {
    const seoCopy = CATEGORY_SEO[slug]?.[locale]?.[island];
    const label = CATEGORY_LABELS[slug] ?? slug;
    const title = seoCopy ? `${seoCopy.h1} | CanaryRoutes` : `${label} en ${islandName} | CanaryRoutes`;
    const description = seoCopy?.description ?? `Descubre los mejores lugares de ${label.toLowerCase()} en ${islandName}. Planifica tu ruta con CanaryRoutes.`;
    const url = `${SITE_URL}/${locale}/${island}/${slug}`;
    return {
      title,
      description,
      alternates: {
        canonical: url,
        languages: {
          ...Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}/${island}/${slug}`])),
          'x-default': `${SITE_URL}/es/${island}/${slug}`,
        },
      },
      openGraph: {
        title, description, url, siteName: 'CanaryRoutes', type: 'website',
        images: [{ url: `${SITE_URL}/og-default.png`, width: 1200, height: 630, alt: title }],
      },
      twitter: { card: 'summary_large_image', title, description, images: [`${SITE_URL}/og-default.png`] },
    };
  }

  const poi = getPOI(locale, island, slug);
  if (!poi) return {};
  const title = `${poi.name} — ${islandName} | CanaryRoutes`;
  const description = poi.shortDescription || poi.description.slice(0, 155);
  // Canonical points to the canonical category URL to avoid duplicate content
  const poiCatSlug = POI_CATEGORY_TO_SLUG[poi.category] ?? 'actividades';
  const canonicalUrl = `${SITE_URL}/${locale}/${island}/${poiCatSlug}/${poi.slug}`;
  const heroImage = poi.images?.hero ? `${SITE_URL}${poi.images.hero}` : `${SITE_URL}/og-default.png`;
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}/${island}/${poiCatSlug}/${poi.slug}`])),
        'x-default': `${SITE_URL}/es/${island}/${poiCatSlug}/${poi.slug}`,
      },
    },
    openGraph: {
      title, description, url: canonicalUrl, siteName: 'CanaryRoutes', locale, type: 'article',
      images: [{ url: heroImage, width: 1200, height: 630, alt: poi.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title, description,
      images: [heroImage],
    },
  };
}

export async function generateStaticParams() {
  const poiParams = locales.flatMap((locale) =>
    islands.flatMap((island) =>
      getAllPOISlugs(island).map((poi) => ({ locale, island, poi }))
    )
  );
  const categoryParams = locales.flatMap((locale) =>
    islands.flatMap((island) =>
      ALL_CATEGORY_SLUGS.map((poi) => ({ locale, island, poi }))
    )
  );
  return [...poiParams, ...categoryParams];
}

export default async function SlugPage({
  params,
}: {
  params: Promise<{ locale: string; island: string; poi: string }>;
}) {
  const { locale: rawLocale, island: rawIsland, poi: slug } = await params;
  const locale = rawLocale as Locale;
  const island = rawIsland as Island;

  // Category page
  if (ALL_CATEGORY_SLUGS.includes(slug)) {
    const filterId = CATEGORY_URL_TO_FILTER[slug];
    const poisByIsland: Record<Island, ReturnType<typeof getPOIs>> = {
      'gran-canaria': getPOIs(locale, 'gran-canaria'),
      tenerife: getPOIs(locale, 'tenerife'),
    };
    const sectionsByIsland: Record<Island, ReturnType<typeof getSections>> = {
      'gran-canaria': getSections(locale, 'gran-canaria'),
      tenerife: getSections(locale, 'tenerife'),
    };
    const municipiosByIsland = {
      'gran-canaria': getMunicipios('gran-canaria', locale),
      tenerife: getMunicipios('tenerife', locale),
    };
    const islandName = getIslandDisplayName(island, locale);
    const seoCopy = CATEGORY_SEO[slug]?.[locale]?.[island] ?? CATEGORY_SEO[slug]?.es?.[island];

    const allIslandPois = getPOIs(locale, island);
    const catMap: Record<string, string[]> = {
      beach: ['beach'], hiking: ['hiking'], culture: ['culture'],
      nature: ['nature'], activities: ['viewpoint', 'food', 'other'],
      transport: ['transport'],
    };
    const categoryPois = filterId === 'top'
      ? allIslandPois.filter((p) => !!p.top)
      : (catMap[filterId] ? allIslandPois.filter((p) => catMap[filterId].includes(p.category)) : []);

    // Créditos fotográficos de todos los POIs del mapa, para que la ficha de
    // detalle (PoiDetailSheet) los muestre al seleccionar cualquier POI.
    const photoCreditsBySlug: Record<string, ReturnType<typeof getPhotoCredits>> = {};
    for (const islandPois of Object.values(poisByIsland)) {
      for (const p of islandPois) {
        if (!photoCreditsBySlug[p.slug]) {
          photoCreditsBySlug[p.slug] = getPhotoCredits(p.images);
        }
      }
    }
    // Créditos de municipios: al hacer click en un marcador de municipio se crea
    // un POI sintético con su mismo slug, por lo que sus créditos deben estar aquí.
    for (const munis of Object.values(municipiosByIsland)) {
      for (const m of munis) {
        if (m.images && !photoCreditsBySlug[m.slug]) {
          photoCreditsBySlug[m.slug] = getPhotoCredits(m.images);
        }
      }
    }

    return (
      <div className="desktop-wrapper">
        {/* SSR content for SEO - visually hidden via srOnly, accessible to crawlers and screen readers */}
        <div
          style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}
        >
          {seoCopy && <h1>{seoCopy.h1}</h1>}
          {seoCopy && <p>{seoCopy.description}</p>}
          <ul>
            {categoryPois.map((p) => (
              <li key={p.slug}>
                <a href={`/${locale}/${island}/${slug}/${p.slug}`}>
                  {p.name}{p.shortDescription ? ` — ${p.shortDescription}` : ''}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="app-shell" style={{ height: '100svh' }}>
          <IslandMap
            locale={locale}
            poisByIsland={poisByIsland}
            sectionsByIsland={sectionsByIsland}
            municipiosByIsland={municipiosByIsland}
            initialIsland={island}
            initialFilter={filterId}
            islandName={islandName}
            photoCreditsBySlug={photoCreditsBySlug}
          />
        </div>
      </div>
    );
  }

  // POI page
  const poi = getPOI(locale, island, slug);
  if (!poi) notFound();
  const allPois = getPOIs(locale, island);
  // Show bubbles for same-group POIs.
  // Top POIs → only top POIs. Otherwise → same category group.
  const ACTIVITY_CATS = ['viewpoint', 'food', 'other'];
  const pois = poi.top
    ? allPois.filter((p) => !!p.top)
    : allPois.filter((p) =>
        ACTIVITY_CATS.includes(poi.category)
          ? ACTIVITY_CATS.includes(p.category)
          : p.category === poi.category
      );

  const islandLabel2 = getIslandDisplayName(island, locale);
  const poiCategorySlug = POI_CATEGORY_TO_SLUG[poi.category] ?? 'actividades';
  const categoryLabel2 = CATEGORY_LABELS[poiCategorySlug] ?? poiCategorySlug;

  // Créditos fotográficos de todos los POIs que pueden mostrarse en las
  // burbujas de navegación, para que el carrusel los muestre al cambiar de POI.
  const photoCreditsBySlug: Record<string, ReturnType<typeof getPhotoCredits>> = {};
  for (const p of [poi, ...pois]) {
    if (!photoCreditsBySlug[p.slug]) {
      photoCreditsBySlug[p.slug] = getPhotoCredits(p.images);
    }
  }

  return (
    <div className="desktop-wrapper">
      <TouristAttractionJsonLd poi={poi} island={island} locale={locale} categorySlug={poiCategorySlug} />
      <BreadcrumbJsonLd items={[
        { name: 'CanaryRoutes', href: '/' + locale },
        { name: islandLabel2, href: '/' + locale + '/' + island },
        { name: categoryLabel2, href: '/' + locale + '/' + island + '/' + poiCategorySlug },
        { name: poi.name, href: '/' + locale + '/' + island + '/' + poiCategorySlug + '/' + poi.slug },
      ]} />
      <Breadcrumb srOnly items={[
        { name: 'CanaryRoutes', href: '/' + locale },
        { name: islandLabel2, href: '/' + locale + '/' + island },
        { name: categoryLabel2, href: '/' + locale + '/' + island + '/' + poiCategorySlug },
        { name: poi.name, href: '/' + locale + '/' + island + '/' + poiCategorySlug + '/' + poi.slug },
      ]} />
      <div className="app-shell" style={{ height: '100svh' }}>
        <PoiDetailPageClient
          poi={poi}
          pois={pois}
          locale={locale}
          island={island}
          photoCreditsBySlug={photoCreditsBySlug}
        />
      </div>
    </div>
  );
}
