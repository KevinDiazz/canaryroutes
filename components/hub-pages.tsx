import Image from 'next/image';
import { LanguageSwitcher } from '@/components/language-switcher';
import { HomeFooter } from '@/components/home-footer';
import { BreadcrumbJsonLd } from '@/components/json-ld';
import { getPOIs } from '@/lib/content';
import { getIslandDisplayName, withTrailingSlash } from '@/lib/i18n';
import { CATEGORY_SEO } from '@/lib/category-seo';
import { HUB_CATEGORY_SLUGS, getPoisByCategorySlug, getCardThumb, stripMarkdown } from '@/lib/poi-utils';
import { POI_CATEGORY_TO_SLUG } from '@/lib/categories';
import type { Locale, Island, POI } from '@/lib/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';

// ── Textos ────────────────────────────────────────────────────────────────────

const T: Record<Locale, {
  home: string; viewMap: string; viewMapAll: string; places: string; mustSee: string;
  allPlaces: string; otherCategories: string; categories: string; explore: string;
  inWord: string; openMap: string;
}> = {
  es: {
    home: 'Inicio', viewMap: 'Ver en el mapa', viewMapAll: 'Abrir el mapa interactivo',
    places: 'lugares', mustSee: 'Imprescindibles', allPlaces: 'Todos los lugares',
    otherCategories: 'Más categorías', categories: 'Explora por categoría', explore: 'Explorar',
    inWord: 'en', openMap: 'Mapa',
  },
  en: {
    home: 'Home', viewMap: 'View on the map', viewMapAll: 'Open the interactive map',
    places: 'places', mustSee: 'Must-sees', allPlaces: 'All places',
    otherCategories: 'More categories', categories: 'Explore by category', explore: 'Explore',
    inWord: 'in', openMap: 'Map',
  },
  de: {
    home: 'Startseite', viewMap: 'Auf der Karte ansehen', viewMapAll: 'Interaktive Karte öffnen',
    places: 'Orte', mustSee: 'Highlights', allPlaces: 'Alle Orte',
    otherCategories: 'Weitere Kategorien', categories: 'Nach Kategorie entdecken', explore: 'Entdecken',
    inWord: 'auf', openMap: 'Karte',
  },
};

const CATEGORY_LABEL: Record<Locale, Record<string, string>> = {
  es: { playas: 'Playas', senderos: 'Senderos', cultura: 'Cultura', naturaleza: 'Naturaleza', actividades: 'Actividades', transporte: 'Transporte' },
  en: { playas: 'Beaches', senderos: 'Hiking', cultura: 'Culture', naturaleza: 'Nature', actividades: 'Activities', transporte: 'Transport' },
  de: { playas: 'Strände', senderos: 'Wanderwege', cultura: 'Kultur', naturaleza: 'Natur', actividades: 'Aktivitäten', transporte: 'Verkehr' },
};

const CATEGORY_EMOJI: Record<string, string> = {
  playas: '🏖️', senderos: '🥾', cultura: '🏛️', naturaleza: '🌋', actividades: '🎯', transporte: '🚌',
};

const ISLAND_INTRO: Record<Island, Record<Locale, string>> = {
  'gran-canaria': {
    es: 'Gran Canaria condensa en una sola isla dunas, barrancos, bosques de pinos y más de 60 km de playas. Aquí tienes los lugares organizados por categoría, con enlace directo al mapa interactivo para planificar tu ruta.',
    en: 'Gran Canaria packs dunes, ravines, pine forests and over 60 km of beaches into a single island. Here are the places organised by category, with a direct link to the interactive map so you can plan your route.',
    de: 'Gran Canaria vereint Dünen, Schluchten, Kiefernwälder und über 60 km Strand auf einer Insel. Hier findest du die Orte nach Kategorie sortiert, mit direktem Link zur interaktiven Karte für deine Routenplanung.',
  },
  tenerife: {
    es: 'Tenerife reúne el Teide, bosques de laurisilva, playas de arena negra y pueblos históricos. Aquí tienes los lugares organizados por categoría, con enlace directo al mapa interactivo para planificar tu ruta.',
    en: 'Tenerife brings together Mount Teide, laurel forests, black-sand beaches and historic towns. Here are the places organised by category, with a direct link to the interactive map so you can plan your route.',
    de: 'Teneriffa vereint den Teide, Lorbeerwälder, schwarze Sandstrände und historische Städte. Hier findest du die Orte nach Kategorie sortiert, mit direktem Link zur interaktiven Karte für deine Routenplanung.',
  },
};

// ── Utilidades ────────────────────────────────────────────────────────────────

const path = (...segments: string[]) => withTrailingSlash('/' + segments.join('/'));
const mapUrl = (locale: Locale, island: Island, cat?: string) =>
  path(locale, island, 'mapa') + (cat ? `?cat=${cat}` : '');

function plainSnippet(poi: POI, max = 160): string {
  const base = poi.shortDescription || stripMarkdown(poi.description);
  return base.length > max ? base.slice(0, max - 1).trimEnd() + '…' : base;
}

const font = "'Outfit', sans-serif";
const mono = "'JetBrains Mono', monospace";

// ── Estructura común ──────────────────────────────────────────────────────────

function HubShell({
  locale, island, crumbs, children,
}: {
  locale: Locale;
  island: Island;
  crumbs: { name: string; href: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="desktop-wrapper">
      <BreadcrumbJsonLd items={crumbs} />
      <div style={{ background: '#f8fafc', minHeight: '100svh', display: 'flex', flexDirection: 'column', fontFamily: font }}>
        <nav style={{
          padding: '0 16px', height: '60px', display: 'flex', alignItems: 'center', gap: '12px',
          borderBottom: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.95)',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <a href={path(locale)} aria-label="CanaryRoutes" style={{ flexShrink: 0, lineHeight: 0 }}>
            <Image src="/logo/logoByN-removebg-preview.png" alt="CanaryRoutes" width={52} height={52} style={{ height: '52px', width: 'auto' }} unoptimized />
          </a>
          <div style={{ flex: 1 }} />
          <a
            href={mapUrl(locale, island)}
            style={{
              textDecoration: 'none', background: '#0e7cc2', color: 'white', borderRadius: '8px',
              padding: '8px 14px', fontSize: '11px', fontWeight: 800, fontFamily: mono, letterSpacing: '0.06em',
            }}
          >
            {T[locale].openMap.toUpperCase()}
          </a>
          <LanguageSwitcher currentLocale={locale} />
        </nav>

        <main style={{ maxWidth: '1040px', width: '100%', margin: '0 auto', padding: '24px 20px 64px', flex: 1 }}>
          <ol style={{
            display: 'flex', flexWrap: 'wrap', gap: '6px', listStyle: 'none', margin: '0 0 20px', padding: 0,
            fontSize: '13px', color: '#475569',
          }}>
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={c.href} style={{ display: 'flex', gap: '6px' }}>
                  {last
                    ? <span aria-current="page" style={{ color: '#0f172a', fontWeight: 600 }}>{c.name}</span>
                    : <><a href={c.href} style={{ color: '#0e6aa6', textDecoration: 'none' }}>{c.name}</a><span aria-hidden="true">›</span></>}
                </li>
              );
            })}
          </ol>
          {children}
        </main>

        <HomeFooter locale={locale} />
      </div>
    </div>
  );
}

function PoiCard({ poi, locale, island, categorySlug }: { poi: POI; locale: Locale; island: Island; categorySlug: string }) {
  return (
    <li style={{ listStyle: 'none' }}>
      <a
        href={path(locale, island, categorySlug, poi.slug)}
        style={{
          display: 'flex', gap: '14px', alignItems: 'center', textDecoration: 'none', color: 'inherit',
          background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '12px',
          boxShadow: '0 1px 6px rgba(14,79,114,0.06)', height: '100%', boxSizing: 'border-box',
        }}
      >
        <img
          src={getCardThumb(poi.images.hero)}
          alt={poi.name}
          width={72}
          height={72}
          loading="lazy"
          decoding="async"
          style={{ width: 72, height: 72, borderRadius: '12px', objectFit: 'cover', flexShrink: 0, background: '#e2e8f0' }}
        />
        <span style={{ minWidth: 0 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>
            {poi.top ? '⭐ ' : ''}{poi.name}
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>{plainSnippet(poi)}</p>
        </span>
      </a>
    </li>
  );
}

const gridStyle: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px', padding: 0, margin: 0,
};

const h2Style: React.CSSProperties = {
  fontSize: 'clamp(20px, 3.4vw, 26px)', fontWeight: 800, color: '#0a1628', margin: '36px 0 14px', letterSpacing: '-0.01em',
};

function CategoryNav({ locale, island, exclude }: { locale: Locale; island: Island; exclude?: string }) {
  return (
    <nav aria-label={T[locale].categories}>
      <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', listStyle: 'none', padding: 0, margin: 0 }}>
        {HUB_CATEGORY_SLUGS.filter((c) => c !== exclude).map((c) => (
          <li key={c}>
            <a
              href={path(locale, island, c)}
              style={{
                display: 'inline-block', textDecoration: 'none', background: 'white', border: '1px solid #cbd5e1',
                color: '#0f172a', borderRadius: '999px', padding: '9px 16px', fontSize: '14px', fontWeight: 600,
              }}
            >
              {CATEGORY_EMOJI[c]} {CATEGORY_LABEL[locale][c]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function MapCta({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', background: '#0e7cc2',
        color: 'white', borderRadius: '12px', padding: '13px 22px', fontSize: '14px', fontWeight: 800,
        fontFamily: mono, letterSpacing: '0.04em', boxShadow: '0 4px 14px rgba(14,124,194,0.35)',
      }}
    >
      🗺️ {label}
    </a>
  );
}

function ItemListJsonLd({ name, url, items }: { name: string; url: string; items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: it.url })),
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// ── Página de categoría (p. ej. /es/gran-canaria/playas/) ─────────────────────

export function CategoryHubPage({ locale, island, categorySlug }: { locale: Locale; island: Island; categorySlug: string }) {
  const t = T[locale];
  const islandName = getIslandDisplayName(island, locale);
  const seo = CATEGORY_SEO[categorySlug]?.[locale]?.[island] ?? CATEGORY_SEO[categorySlug]?.es?.[island];
  const label = CATEGORY_LABEL[locale][categorySlug];
  const pois = getPoisByCategorySlug(getPOIs(locale, island), categorySlug);
  const top = pois.filter((p) => p.top);
  const rest = pois.filter((p) => !p.top);
  const h1 = seo?.h1 ?? `${label} — ${islandName}`;
  const pageUrl = SITE_URL + path(locale, island, categorySlug);

  const crumbs = [
    { name: 'CanaryRoutes', href: path(locale) },
    { name: islandName, href: path(locale, island) },
    { name: label, href: path(locale, island, categorySlug) },
  ];

  return (
    <HubShell locale={locale} island={island} crumbs={crumbs}>
      <ItemListJsonLd
        name={h1}
        url={pageUrl}
        items={pois.map((p) => ({ name: p.name, url: SITE_URL + path(locale, island, categorySlug, p.slug) }))}
      />
      <header>
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 44px)', fontWeight: 800, color: '#0a1628', margin: '0 0 12px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          {CATEGORY_EMOJI[categorySlug]} {h1}
        </h1>
        <p style={{ margin: '0 0 8px', fontSize: '17px', lineHeight: 1.7, color: '#334155', maxWidth: '760px' }}>{seo?.description}</p>
        <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#64748b', fontFamily: mono }}>
          {pois.length} {t.places} · {islandName}
        </p>
        <MapCta href={mapUrl(locale, island, categorySlug)} label={`${t.viewMap} (${pois.length})`} />
      </header>

      {top.length > 0 && (
        <section aria-labelledby="must-see">
          <h2 id="must-see" style={h2Style}>⭐ {t.mustSee}</h2>
          <ul style={gridStyle}>
            {top.map((p) => <PoiCard key={p.slug} poi={p} locale={locale} island={island} categorySlug={categorySlug} />)}
          </ul>
        </section>
      )}

      {rest.length > 0 && (
        <section aria-labelledby="all-places">
          <h2 id="all-places" style={h2Style}>{top.length > 0 ? t.allPlaces : `${label} — ${islandName}`}</h2>
          <ul style={gridStyle}>
            {rest.map((p) => <PoiCard key={p.slug} poi={p} locale={locale} island={island} categorySlug={categorySlug} />)}
          </ul>
        </section>
      )}

      <section aria-labelledby="more-cats" style={{ marginTop: '12px' }}>
        <h2 id="more-cats" style={h2Style}>{t.otherCategories}</h2>
        <CategoryNav locale={locale} island={island} exclude={categorySlug} />
        <div style={{ marginTop: '28px' }}>
          <MapCta href={mapUrl(locale, island, categorySlug)} label={t.viewMap} />
        </div>
      </section>
    </HubShell>
  );
}

// ── Página de isla (p. ej. /es/gran-canaria/) ─────────────────────────────────

export function IslandHubPage({ locale, island, title }: { locale: Locale; island: Island; title: string }) {
  const t = T[locale];
  const islandName = getIslandDisplayName(island, locale);
  const allPois = getPOIs(locale, island);
  const pageUrl = SITE_URL + path(locale, island);

  const categories = HUB_CATEGORY_SLUGS.map((slug) => ({
    slug,
    label: CATEGORY_LABEL[locale][slug],
    pois: getPoisByCategorySlug(allPois, slug),
  }));
  const featured = allPois.filter((p) => p.top && !p.sectionOnly).slice(0, 12);

  const crumbs = [
    { name: 'CanaryRoutes', href: path(locale) },
    { name: islandName, href: path(locale, island) },
  ];

  return (
    <HubShell locale={locale} island={island} crumbs={crumbs}>
      <ItemListJsonLd
        name={title}
        url={pageUrl}
        items={categories.map((c) => ({ name: `${c.label} — ${islandName}`, url: SITE_URL + path(locale, island, c.slug) }))}
      />
      <header>
        <h1 style={{ fontSize: 'clamp(30px, 6.5vw, 48px)', fontWeight: 800, color: '#0a1628', margin: '0 0 12px', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
          {islandName}
        </h1>
        <p style={{ margin: '0 0 22px', fontSize: '17px', lineHeight: 1.7, color: '#334155', maxWidth: '760px' }}>
          {ISLAND_INTRO[island][locale]}
        </p>
        <MapCta href={mapUrl(locale, island)} label={t.viewMapAll} />
      </header>

      <section aria-labelledby="by-category">
        <h2 id="by-category" style={h2Style}>{t.categories}</h2>
        <ul style={{ ...gridStyle, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {categories.map((c) => (
            <li key={c.slug} style={{ listStyle: 'none' }}>
              <a
                href={path(locale, island, c.slug)}
                style={{
                  display: 'block', textDecoration: 'none', color: 'inherit', background: 'white',
                  border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px', height: '100%', boxSizing: 'border-box',
                  boxShadow: '0 1px 6px rgba(14,79,114,0.06)',
                }}
              >
                <span style={{ fontSize: '30px' }} aria-hidden="true">{CATEGORY_EMOJI[c.slug]}</span>
                <h3 style={{ margin: '8px 0 4px', fontSize: '19px', fontWeight: 800, color: '#0a1628' }}>
                  {c.label} {t.inWord} {islandName}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontFamily: mono }}>{c.pois.length} {t.places}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="featured">
          <h2 id="featured" style={h2Style}>⭐ {t.mustSee}</h2>
          <ul style={gridStyle}>
            {featured.map((p) => (
              <PoiCard key={p.slug} poi={p} locale={locale} island={island} categorySlug={POI_CATEGORY_TO_SLUG[p.category] ?? 'actividades'} />
            ))}
          </ul>
        </section>
      )}
    </HubShell>
  );
}
