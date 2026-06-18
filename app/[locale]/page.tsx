import Image from 'next/image';
import { locales, type Locale } from '@/lib/types';
import { LanguageSwitcher } from '@/components/language-switcher';
import { IslandSelector } from '@/components/island-selector';
import type { Metadata } from 'next';
import { OrganizationJsonLd } from '@/components/json-ld';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';

const HOME_META: Record<string, { title: string; description: string }> = {
  es: {
    title: 'CanaryRoutes — Explora las Islas Canarias',
    description: 'Descubre Gran Canaria y Tenerife: playas, senderos, cultura y naturaleza. Planifica tu viaje con mapas interactivos y rutas personalizadas.',
  },
  en: {
    title: 'CanaryRoutes — Explore the Canary Islands',
    description: 'Discover Gran Canaria and Tenerife: beaches, hikes, culture and nature. Plan your trip with interactive maps and personalised routes.',
  },
  de: {
    title: 'CanaryRoutes — Erkunde die Kanarischen Inseln',
    description: 'Entdecke Gran Canaria und Teneriffa: Straende, Wanderwege, Kultur und Natur. Plane deine Reise mit interaktiven Karten und personalisierten Routen.',
  },
};

const HERO_TEXT: Record<Locale, {
  eyebrow: string;
  headline: string;
  sub: string;
  stats: string[];
}> = {
  es: {
    eyebrow: 'Tu guía de viaje digital',
    headline: 'Descubre las\nIslas Canarias',
    sub: 'Mapas interactivos · Rutas personalizadas · Experiencias únicas',
    stats: ['8 islas', '500+ lugares', 'Mapas interactivos'],
  },
  en: {
    eyebrow: 'Your digital travel guide',
    headline: 'Discover the\nCanary Islands',
    sub: 'Interactive maps · Personal routes · Unique experiences',
    stats: ['8 islands', '500+ places', 'Interactive maps'],
  },
  de: {
    eyebrow: 'Dein digitaler Reiseführer',
    headline: 'Entdecke die\nKanarischen Inseln',
    sub: 'Interaktive Karten · Persönliche Routen · Einzigartige Erlebnisse',
    stats: ['8 Inseln', '500+ Orte', 'Interaktive Karten'],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const meta = HOME_META[locale] ?? HOME_META.es;
  const url = SITE_URL + '/' + locale;
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, SITE_URL + '/' + l])),
        'x-default': SITE_URL + '/es',
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: 'CanaryRoutes',
      type: 'website',
      locale,
      images: [{ url: SITE_URL + '/og-default.svg', width: 1200, height: 630, alt: 'CanaryRoutes' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [SITE_URL + '/og-default.svg'],
    },
  };
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const hero = HERO_TEXT[locale] ?? HERO_TEXT.es;

  return (
    <div className="desktop-wrapper">
      <OrganizationJsonLd locale={locale} />
      <main
        className="app-shell app-shell-home"
        style={{ background: '#f0f7fa', display: 'flex', flexDirection: 'column' }}
      >
        {/* ── Nav ─────────────────────────────────────────────────────── */}
        <nav style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'white',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
          flexShrink: 0,
        }}>
          <Image
            src="/logo/file.png"
            alt="CanaryRoutes"
            width={160}
            height={40}
            style={{ height: '75px', width: 'auto' }}
            priority
            unoptimized
          />
          <svg viewBox="0 0 200 30" style={{ flex: 1, height: '30px' }} preserveAspectRatio="xMidYMid meet">
            <path
              d="M0,15 Q25,6 50,15 Q75,24 100,15 Q125,6 150,15 Q175,22 200,15"
              fill="none" stroke="#2090c0" strokeWidth="1.8" strokeDasharray="5,7"
              strokeLinecap="round" opacity="0.35"
            />
            <circle cx="40" cy="13" r="5" fill="white" stroke="#f5c518" strokeWidth="1.5" opacity="0.5"/>
            <circle cx="40" cy="13" r="2.5" fill="#f5c518" opacity="0.7"/>
            <circle cx="100" cy="15" r="5" fill="white" stroke="#f5c518" strokeWidth="1.5" opacity="0.5"/>
            <circle cx="100" cy="15" r="2.5" fill="#f5c518" opacity="0.7"/>
            <circle cx="168" cy="18" r="5" fill="white" stroke="#f5c518" strokeWidth="1.5" opacity="0.5"/>
            <circle cx="168" cy="18" r="2.5" fill="#f5c518" opacity="0.7"/>
          </svg>
          <LanguageSwitcher currentLocale={locale} />
        </nav>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        {/*
          Imagen hero: coloca el archivo en /public/images/hero-home.avif
          (Unsplash: https://unsplash.com/photos/uItqquFqYJI)
          Si no existe, se muestra el gradiente de fallback.
        */}
        <section
          style={{
            position: 'relative',
            minHeight: '290px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: 'linear-gradient(145deg, #0d1b4a 0%, #0e4f72 55%, #0d9488 100%)',
            flexShrink: 0,
          }}
        >
          {/* Imagen de fondo */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'url(/images/hero-home.avif), url(/images/hero-home.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center 35%',
            }}
          />
          {/* Overlay oscuro */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(10,22,60,0.38) 0%, rgba(10,22,60,0.72) 100%)',
            }}
          />
          {/* Contenido */}
          <div style={{
            position: 'relative', zIndex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '40px 28px 36px', textAlign: 'center', gap: '0',
          }}>
            <span style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '11px', fontWeight: '600',
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.65)', marginBottom: '14px', display: 'block',
            }}>
              {hero.eyebrow}
            </span>
            <h1 style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 'clamp(42px, 11vw, 58px)',
              fontWeight: '700',
              color: 'white',
              margin: '0 0 14px',
              lineHeight: '1.08',
              whiteSpace: 'pre-line',
              textShadow: '0 2px 24px rgba(0,0,0,0.45)',
              letterSpacing: '-0.01em',
            }}>
              {hero.headline}
            </h1>
            <p style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '14px', fontWeight: '400',
              color: 'rgba(255,255,255,0.75)',
              margin: '0 0 22px', letterSpacing: '0.02em',
            }}>
              {hero.sub}
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '28px', padding: '8px 20px',
              border: '1px solid rgba(255,255,255,0.18)',
            }}>
              {hero.stats.map((stat, i) => (
                <span key={stat} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.92)', whiteSpace: 'nowrap' }}>
                    {stat}
                  </span>
                  {i < hero.stats.length - 1 && (
                    <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>·</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Island selector ──────────────────────────────────────────── */}
        <IslandSelector locale={locale} />
      </main>
    </div>
  );
}
