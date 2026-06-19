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
    sub: 'Tu guía de viaje digital',
    stats: ['7 islas', '+500 lugares', 'Mapas interactivos'],
  },
  en: {
    eyebrow: 'Your digital travel guide',
    headline: 'Discover the\nCanary Islands',
    sub: 'Your digital travel guide',
    stats: ['7 islands', '+500 places', 'Interactive maps'],
  },
  de: {
    eyebrow: 'Dein digitaler Reiseführer',
    headline: 'Entdecke die\nKanarischen Inseln',
    sub: 'Dein digitaler Reiseführer',
    stats: ['7 Inseln', '+500 Orte', 'Interaktive Karten'],
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
        style={{ background: '#ffffff', display: 'flex', flexDirection: 'column' }}
      >
        {/* ── Nav ─────────────────────────────────────────────────────── */}
        <nav style={{
          padding: '0 20px 0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'white',
          borderRadius: '16px',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 4px 8px -2px rgba(0,0,0,0.10), 0 2px 12px rgba(0,0,0,0.08)',
          position: 'absolute',
          top: '15px', left: '16px', right: '16px',
          zIndex: 20,
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <Image
            src="/logo/logoByN-removebg-preview.png"
            alt="CanaryRoutes"
            width={160}
            height={40}
            style={{ height: '75px', width: 'auto' }}
            priority
            unoptimized
          />
          <div style={{ flex: 1 }} />
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
            minHeight: 'clamp(480px, 60vh, 680px)',
            display: 'flex',
            alignItems: 'flex-start',
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
              backgroundImage: 'url(/images/gran-canaria-for-nomad-list-uItqquFqYJI-unsplash.avif)',
              backgroundSize: 'cover',
              backgroundPosition: 'center 35%',
            }}
          />
          {/* Overlay oscuro arriba */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(10,22,60,0.45) 0%, rgba(10,22,60,0.05) 75%, rgba(10,22,60,0) 100%)',
            }}
          />
          {/* Ola SVG — transición entre foto y sección siguiente */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: 'absolute',
              bottom: -1,
              left: 0,
              width: '100%',
              height: '80px',
              zIndex: 2,
              display: 'block',
            }}
          >
            <path
              d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
              fill="#ffffff"
            />
          </svg>
          {/* Contenido */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            paddingTop: 'clamp(120px, 16vh, 180px)',
            textAlign: 'center',
            paddingLeft: '24px',
            paddingRight: '24px',
          }}>
            {/* Título */}
            <h1 style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 'clamp(42px, 11vw, 88px)',
              fontWeight: '700',
              color: 'white',
              margin: '0',
              lineHeight: '1.05',
              whiteSpace: 'pre-line',
              letterSpacing: '-0.01em',
              textShadow: '0 2px 32px rgba(0,0,0,0.45)',
            }}>
              {hero.headline}
            </h1>

            {/* Subtítulo */}
            <p style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(14px, 1.4vw, 18px)',
              fontWeight: '400',
              color: 'rgba(255,255,255,0.82)',
              margin: '80px 0 22px',
              letterSpacing: '0.02em',
              textShadow: '0 1px 6px rgba(0,0,0,0.4)',
            }}>
              {hero.sub}
            </p>

            {/* Stats */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '32px', padding: '10px 28px',
              border: '1px solid rgba(255,255,255,0.18)',
            }}>
              {hero.stats.map((stat, i) => (
                <span key={stat} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(13px, 1.1vw, 15px)', fontWeight: '600', color: 'rgba(255,255,255,0.92)', whiteSpace: 'nowrap' }}>
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
