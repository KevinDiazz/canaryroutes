import { locales, islands, type Locale, type Island } from '@/lib/types';
import { getRoute, getAllRouteSlugs, getPOI } from '@/lib/content';
import { getIslandDisplayName } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/language-switcher';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; island: string; route: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, island: rawIsland, route: routeSlug } = await params;
  const locale = rawLocale as Locale;
  const island = rawIsland as Island;
  const route = getRoute(locale, island, routeSlug);
  if (!route) return {};
  const islandName = getIslandDisplayName(island, locale);
  const title = route.name + ' — ' + islandName + ' | CanaryRoutes';
  const description = route.description?.slice(0, 155) ?? ('Ruta ' + route.name + ' en ' + islandName + '. ' + route.duration + ', ' + route.distance + '.');
  const url = SITE_URL + '/' + locale + '/' + island + '/routes/' + routeSlug;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(locales.map((l) => [l, SITE_URL + '/' + l + '/' + island + '/routes/' + routeSlug])),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'CanaryRoutes',
      locale,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}


export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    islands.flatMap((island) =>
      getAllRouteSlugs(island).map((route) => ({ locale, island, route }))
    )
  );
}

export default async function RoutePage({
  params,
}: {
  params: Promise<{ locale: string; island: string; route: string }>;
}) {
  const { locale: rawLocale, island: rawIsland, route: routeSlug } = await params;
  const locale = rawLocale as Locale;
  const island = rawIsland as Island;
  const route = getRoute(locale, island, routeSlug);
  if (!route) notFound();

  const islandName = getIslandDisplayName(island, locale);
  const pois = route.pois
    .map((slug) => getPOI(locale, island, slug))
    .filter(Boolean);

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <nav style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px' }}>
          <Link href={`/${locale}`} style={{ color: '#1f9d61', textDecoration: 'none' }}>Mapa</Link>
          <span style={{ color: '#d1d5db' }}>›</span>
          <Link href={`/${locale}/${island}`} style={{ color: '#1f9d61', textDecoration: 'none' }}>{islandName}</Link>
          <span style={{ color: '#d1d5db' }}>›</span>
          <span style={{ color: '#6b7280' }}>{route.name}</span>
        </nav>
        <LanguageSwitcher currentLocale={locale} />
      </div>

      <h1 style={{
        fontSize: '42px',
        fontWeight: '700',
        fontFamily: "'Cormorant Garamond', serif",
        marginBottom: '8px',
        color: '#1f2937',
        lineHeight: 1.2,
      }}>
        {route.name}
      </h1>

      {/* Meta */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>🕐 {route.duration}</span>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>📏 {route.distance}</span>
        <span style={{ fontSize: '14px', color: '#6b7280', textTransform: 'capitalize' }}>🚗 {route.type}</span>
        <span style={{
          padding: '4px 14px',
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '20px',
          fontSize: '15px',
          fontWeight: '700',
          color: '#1f9d61',
        }}>
          €{route.price}
        </span>
      </div>

      {/* Audio languages */}
      <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {route.audioLanguages.map((lang) => (
          <span key={lang} style={{
            padding: '2px 8px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#1d4ed8',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: '700',
            textTransform: 'uppercase',
          }}>
            {lang}
          </span>
        ))}
      </div>

      {/* Description */}
      <p style={{ marginTop: '24px', lineHeight: '1.8', fontSize: '17px', color: '#374151' }}>
        {route.description}
      </p>

      {/* POI stops */}
      {pois.length > 0 && (
        <section style={{ marginTop: '40px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '600', marginBottom: '16px', fontFamily: "'Cormorant Garamond', serif" }}>
            Paradas de la ruta
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pois.map((poi, idx) => poi && (
              <Link key={poi.slug} href={`/${locale}/${island}/${poi.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  transition: 'box-shadow 0.2s',
                }}>
                  <span style={{
                    width: '32px',
                    height: '32px',
                    background: '#1f9d61',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '14px',
                    flexShrink: 0,
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: '24px', flexShrink: 0 }}>{poi.emoji ?? '📍'}</span>
                  <div>
                    <p style={{ fontWeight: '600', color: '#1f2937', fontSize: '16px', margin: 0 }}>{poi.name}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, marginTop: '2px' }}>{poi.shortDescription}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Premium purchase CTA */}
      <div style={{
        marginTop: '48px',
        padding: '32px',
        background: 'linear-gradient(135deg, #1f9d61, #47c987)',
        borderRadius: '20px',
        color: 'white',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', fontFamily: "'Cormorant Garamond', serif" }}>
          Desbloquea la audioguía completa
        </h2>
        <p style={{ marginBottom: '8px', opacity: 0.9, fontSize: '16px' }}>
          {pois.length} paradas · {route.duration} · {route.distance}
        </p>
        <p style={{ marginBottom: '24px', opacity: 0.85, fontSize: '14px' }}>
          Pago único · Sin suscripción · Disponible para siempre
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {route.audioLanguages.slice(0, 4).map((lang) => (
            <span key={lang} style={{
              padding: '3px 10px',
              background: 'rgba(255,255,255,0.25)',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '700',
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase',
            }}>
              {lang}
            </span>
          ))}
          {route.audioLanguages.length > 4 && (
            <span style={{ fontSize: '12px', opacity: 0.8 }}>+{route.audioLanguages.length - 4} more</span>
          )}
        </div>
        <button style={{
          marginTop: '24px',
          padding: '16px 40px',
          background: 'white',
          color: '#1f9d61',
          border: 'none',
          borderRadius: '12px',
          fontWeight: '700',
          fontSize: '20px',
          cursor: 'pointer',
          fontFamily: "'JetBrains Mono', monospace",
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}>
          Comprar por €{route.price}
        </button>
        <p style={{ marginTop: '12px', fontSize: '12px', opacity: 0.75 }}>
          Pago seguro con Stripe · Acceso inmediato
        </p>
      </div>
    </main>
  );
}
