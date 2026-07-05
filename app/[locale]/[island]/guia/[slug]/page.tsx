import path from 'path';
import fs from 'fs';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { locales, islands, type Locale, type Island } from '@/lib/types';
import { getGuide } from '@/lib/guides';
import { getIslandDisplayName } from '@/lib/i18n';
import { BreadcrumbJsonLd } from '@/components/json-ld';
import { Breadcrumb } from '@/components/breadcrumb';
import { LanguageSwitcher } from '@/components/language-switcher';
import { FILTER_TO_CATEGORY_URL, POI_CATEGORY_TO_SLUG } from '@/lib/categories';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';
const contentDir = path.join(process.cwd(), 'content');

// ── Labels ────────────────────────────────────────────────────────────────────

const L: Record<Locale, {
  guia: string; tips: string; faq: string;
  carsCtaBtn: string; toursCtaBtn: string;
  poiLink: string; updatedAt: string;
  tableOfContents: string; backTo: string;
  mapSubtitle: string; viewOnMap: string;
  affiliateLabel: string;
  fullCalendar: string;
}> = {
  es: {
    guia: 'Guía',
    tips: 'Consejos prácticos',
    faq: 'Preguntas frecuentes',
    carsCtaBtn: 'Alquiler de coche',
    toursCtaBtn: 'Excursiones',
    poiLink: 'Ver en el mapa',
    updatedAt: 'Actualizado',
    tableOfContents: 'En esta guía',
    backTo: 'Mapa',
    mapSubtitle: 'Abre el mapa interactivo',
    viewOnMap: 'VER EN EL MAPA',
    affiliateLabel: 'Enlace de afiliado · podemos recibir una comisión sin coste para ti',
    fullCalendar: 'Calendario completo',
  },
  en: {
    guia: 'Guide',
    tips: 'Practical tips',
    faq: 'Frequently asked questions',
    carsCtaBtn: 'Car hire',
    toursCtaBtn: 'Tours & activities',
    poiLink: 'View on map',
    updatedAt: 'Updated',
    tableOfContents: 'In this guide',
    backTo: 'Map',
    mapSubtitle: 'Open the interactive map',
    viewOnMap: 'VIEW ON MAP',
    affiliateLabel: 'Affiliate link · we may earn a commission at no extra cost to you',
    fullCalendar: 'Full calendar',
  },
  de: {
    guia: 'Ratgeber',
    tips: 'Praktische Tipps',
    faq: 'Häufig gestellte Fragen',
    carsCtaBtn: 'Mietwagen',
    toursCtaBtn: 'Ausflüge',
    poiLink: 'Auf Karte ansehen',
    updatedAt: 'Aktualisiert',
    tableOfContents: 'In diesem Ratgeber',
    backTo: 'Karte',
    mapSubtitle: 'Interaktive Karte öffnen',
    viewOnMap: 'AUF KARTE ANSEHEN',
    affiliateLabel: 'Affiliate-Link · wir erhalten ggf. eine Provision ohne Mehrkosten für Sie',
    fullCalendar: 'Gesamtkalender',
  },
};

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const params: { locale: string; island: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const island of islands) {
      const dir = path.join(contentDir, locale, island, 'guides');
      if (!fs.existsSync(dir)) continue;
      const slugs = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
      for (const slug of slugs) params.push({ locale, island, slug });
    }
  }
  return params;
}

// ── Alternate URLs across locales ─────────────────────────────────────────────

function getAlternateUrls(guide: NonNullable<ReturnType<typeof getGuide>>, island: Island): Partial<Record<Locale, string>> {
  const result: Partial<Record<Locale, string>> = {};
  for (const l of locales) {
    const dir = path.join(contentDir, l, island, 'guides');
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      try {
        const g = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'));
        if (g.category === guide.category) result[l] = `/${l}/${island}/guia/${g.slug}`;
      } catch { /* skip */ }
    }
  }
  return result;
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ locale: string; island: string; slug: string }> }): Promise<Metadata> {
  const { locale: rawLocale, island: rawIsland, slug } = await params;
  const locale = rawLocale as Locale;
  const island = rawIsland as Island;
  const guide = getGuide(locale, island, slug);
  if (!guide) return {};
  const url = `${SITE_URL}/${locale}/${island}/guia/${slug}`;
  const alternates = getAlternateUrls(guide, island);
  const absAlternates = Object.fromEntries(Object.entries(alternates).map(([l, p]) => [l, SITE_URL + p]));
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: {
      canonical: url,
      languages: { ...absAlternates, 'x-default': absAlternates['es'] ?? url },
    },
    openGraph: {
      title: guide.metaTitle, description: guide.metaDescription, url,
      siteName: 'CanaryRoutes', type: 'article', locale,
      images: [{ url: SITE_URL + '/og-default.png', width: 1200, height: 630, alt: guide.title }],
    },
    twitter: {
      card: 'summary_large_image', title: guide.metaTitle,
      description: guide.metaDescription, images: [SITE_URL + '/og-default.png'],
    },
  };
}

// ── Schema.org ────────────────────────────────────────────────────────────────

function ArticleJsonLd({ guide, url, locale }: { guide: NonNullable<ReturnType<typeof getGuide>>; url: string; locale: Locale }) {
  const schema = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: guide.title, description: guide.metaDescription,
    url, dateModified: guide.updatedAt, datePublished: guide.updatedAt,
    author: { '@type': 'Organization', name: 'CanaryRoutes', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'CanaryRoutes', url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo/file.png` } },
    image: `${SITE_URL}/og-default.png`, inLanguage: locale,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

function FAQJsonLd({ faq }: { faq: Array<{ question: string; answer: string }> }) {
  const schema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question', name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// ── Bold renderer — converts **text** to <strong> ──────────────────────────

function renderBold(text: string, baseStyle: React.CSSProperties = {}): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1
      ? <strong key={i} style={{ fontWeight: 800, color: 'inherit' }}>{part}</strong>
      : part
  );
}

// ── Map preview image per locale ────────────────────────────────────────────

const MAP_IMAGE: Record<string, Record<Locale, string>> = {
  tenerife: {
    es: '/images/guia/mapa-espanol.png',
    en: '/images/guia/mapa-ingles.png',
    de: '/images/guia/mapa-aleman.png',
  },
  'gran-canaria': {
    es: '/images/guia/mapa-gran-canaria-espanol.png',
    en: '/images/guia/mapa-gran-canaria-ingles.png',
    de: '/images/guia/mapa-gran-canaria-aleman.png',
  },
};

// ── Category colors — same as island-map.tsx SVG bubbles ────────────────────

const CATEGORY_COLOR: Record<string, string> = {
  beach:      '#2090c0',
  activities: '#ff5533',
  culture:    '#6e42b8',
  transport:  '#f59e0b',
  nature:     '#2ea86e',
  hiking:     '#2a9e60',
  viewpoint:  '#c47a18',
  other:      '#ff5533',
};

// ── Calendar grouping (romerías-style guides) ────────────────────────────────

function groupCalendarByMonth(
  entries: NonNullable<ReturnType<typeof getGuide>>['calendar'],
  locale: Locale,
): { monthLabel: string; items: NonNullable<ReturnType<typeof getGuide>>['calendar'] }[] {
  if (!entries) return [];
  const groups: { key: string; monthLabel: string; items: typeof entries }[] = [];
  for (const entry of entries) {
    const d = new Date(entry.date + 'T00:00:00');
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    let group = groups.find((g) => g.key === key);
    if (!group) {
      const monthLabel = d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      group = { key, monthLabel, items: [] };
      groups.push(group);
    }
    group.items.push(entry);
  }
  return groups;
}

function shadeHex(hex: string, amount: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + Math.round(255 * amount)));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + Math.round(255 * amount)));
  const b = Math.min(255, Math.max(0, (n & 0xff) + Math.round(255 * amount)));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ── Map Card ─────────────────────────────────────────────────────────────────

function MapCard({ href, label, subtitle, locale, color, colorDark, island }: {
  href: string; label: string; subtitle: string; locale: Locale; color: string; colorDark: string; island: string;
}) {
  const mapSrc = (MAP_IMAGE[island] ?? MAP_IMAGE['tenerife'])[locale];
  return (
    <a
      href={href}
      style={{
        display: 'block', textDecoration: 'none',
        borderRadius: '20px', overflow: 'hidden',
        border: `1.5px solid ${color}33`,
        boxShadow: '0 8px 32px rgba(14,79,114,0.16)',
      }}
    >
      <div style={{ width: '100%', background: '#0a1628', position: 'relative' }}>
        <Image
          src={mapSrc}
          alt="CanaryRoutes map"
          width={800}
          height={500}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          unoptimized
        />
      </div>
      <div style={{
        background: `linear-gradient(135deg, ${colorDark} 0%, ${color} 100%)`,
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
      }}>
        <div>
          <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: '800', color: 'white', fontFamily: "'Outfit', sans-serif" }}>
            {label}
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.75)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
            {subtitle}
          </p>
        </div>
        <div style={{
          flexShrink: 0, background: 'rgba(255,255,255,0.18)', borderRadius: '10px',
          padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px',
          color: 'white', fontSize: '12px', fontWeight: '800',
          fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em',
          border: '1px solid rgba(255,255,255,0.3)',
        }}>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          ABRIR
        </div>
      </div>
    </a>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function GuidePage({ params }: { params: Promise<{ locale: string; island: string; slug: string }> }) {
  const { locale: rawLocale, island: rawIsland, slug } = await params;
  const locale = rawLocale as Locale;
  const island = rawIsland as Island;
  if (!locales.includes(locale) || !islands.includes(island)) notFound();

  const guide = getGuide(locale, island, slug);
  if (!guide) notFound();

  const labels = L[locale] ?? L.es;
  const islandName = getIslandDisplayName(island, locale);
  const categorySlug = FILTER_TO_CATEGORY_URL[guide.category] ?? guide.category;
  const color = CATEGORY_COLOR[guide.category] ?? '#2090c0';
  const colorDark = shadeHex(color, -0.25);
  const pageUrl = `${SITE_URL}/${locale}/${island}/guia/${slug}`;
  const alternateUrls = getAlternateUrls(guide, island);

  const breadcrumbItems = [
    { name: 'CanaryRoutes', href: `/${locale}` },
    { name: islandName, href: `/${locale}/${island}` },
    { name: guide.title, href: `/${locale}/${island}/guia/${slug}` },
  ];

  const formattedDate = new Date(guide.updatedAt).toLocaleDateString(locale, {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const calendarGroups = groupCalendarByMonth(guide.calendar, locale);

  return (
    <>
      <ArticleJsonLd guide={guide} url={pageUrl} locale={locale} />
      <FAQJsonLd faq={guide.faq} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <div className="desktop-wrapper">
        <div style={{ background: '#f8fafc', minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>

          {/* ── Nav ── */}
          <nav style={{
            padding: '0 16px', height: '60px',
            display: 'flex', alignItems: 'center', gap: '12px',
            borderBottom: '1px solid #e2e8f0',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            position: 'sticky', top: 0, zIndex: 50,
          }}>
            <a
              href={`/${locale}/${island}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                textDecoration: 'none', flexShrink: 0,
                background: color, color: 'white',
                borderRadius: '8px', padding: '6px 12px',
                fontSize: '11px', fontWeight: '800',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.06em',
              }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {labels.backTo.toUpperCase()}
            </a>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <a href={`/${locale}`}>
                <Image src="/logo/logoByN-removebg-preview.png" alt="CanaryRoutes" width={160} height={40} style={{ height: '52px', width: 'auto' }} unoptimized />
              </a>
            </div>
            <LanguageSwitcher currentLocale={locale} alternateUrls={alternateUrls} />
          </nav>

          {/* ── Article ── */}
          <main style={{ maxWidth: '720px', width: '100%', margin: '0 auto', padding: '0 0 80px', fontFamily: "'Outfit', sans-serif" }}>

            {/* ── Hero header — dark card ── */}
            <header style={{
              background: `linear-gradient(160deg, #0a1628 0%, ${colorDark} 55%, ${color} 100%)`,
              padding: '28px 24px 32px',
              marginBottom: '0',
            }}>
              <Breadcrumb items={breadcrumbItems} srOnly />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'white', borderRadius: '6px', padding: '3px 10px',
                  fontSize: '10px', fontWeight: '800', textTransform: 'uppercase',
                  letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {labels.guia}
                </span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono', monospace" }}>·</span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>{islandName.toUpperCase()}</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: "'JetBrains Mono', monospace" }}>·</span>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontFamily: "'JetBrains Mono', monospace" }}>{formattedDate}</span>
              </div>
              <h1 style={{
                fontSize: 'clamp(26px, 7vw, 44px)', fontWeight: '800',
                color: 'white', lineHeight: '1.08', margin: '0 0 20px',
                letterSpacing: '-0.03em', fontFamily: "'Outfit', sans-serif",
              }}>
                {guide.title}
              </h1>
              <p style={{
                fontSize: 'clamp(14px, 2vw, 16px)', color: 'rgba(255,255,255,0.8)',
                lineHeight: '1.7', margin: 0,
                fontFamily: "'Outfit', sans-serif",
                borderLeft: `3px solid ${color}cc`,
                paddingLeft: '16px',
              }}>
                {renderBold(guide.intro)}
              </p>
            </header>

            <div style={{ padding: '24px 20px 0' }}>

              {/* ── Table of contents ── */}
              <nav aria-label={labels.tableOfContents} style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '18px',
                overflow: 'hidden',
                marginBottom: '24px',
                boxShadow: '0 2px 12px rgba(14,79,114,0.07)',
              }}>
                {/* TOC header */}
                <div style={{
                  background: '#0a1628',
                  padding: '12px 20px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                  <span style={{
                    fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.8)',
                    textTransform: 'uppercase', letterSpacing: '0.12em',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {labels.tableOfContents}
                  </span>
                </div>
                {/* TOC items */}
                <ol style={{ margin: 0, padding: '8px 0', listStyle: 'none' }}>
                  {guide.sections.map((section, idx) => (
                    <li key={section.rank} style={{
                      borderBottom: idx < guide.sections.length - 1 ? '1px solid #f1f5f9' : 'none',
                    }}>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 20px', cursor: 'default',
                      }}>
                        <span style={{
                          fontSize: '11px', fontWeight: '800',
                          color: 'white',
                          background: `linear-gradient(135deg, ${colorDark}, ${color})`,
                          borderRadius: '6px',
                          width: '24px', height: '24px', flexShrink: 0,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          {section.rank}
                        </span>
                        <span style={{
                          fontSize: '14px', fontWeight: '600', color: '#0f172a',
                          fontFamily: "'Outfit', sans-serif",
                        }}>
                          {section.name}
                        </span>
                      </span>
                    </li>
                  ))}
                  <li style={{ borderTop: '1px solid #f1f5f9' }}>
                    <a href="#faq" style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 20px', textDecoration: 'none',
                      color: color, fontWeight: '700', fontSize: '13px',
                      fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em',
                    }}>
                      <span style={{ fontSize: '14px' }}>→</span>
                      {labels.faq.toUpperCase()}
                    </a>
                  </li>
                </ol>
              </nav>

              {/* ── Map preview ── */}
              <div style={{ marginBottom: '40px' }}>
                <MapCard
                  href={`/${locale}/${island}`}
                  label={labels.poiLink}
                  subtitle={labels.mapSubtitle}
                  locale={locale}
                  color={color}
                  colorDark={colorDark}
                  island={island}
                />
              </div>

              {/* ── Full chronological calendar (e.g. romerías guides) ── */}
              {calendarGroups.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: '800', color: '#64748b',
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {labels.fullCalendar}
                    </span>
                  </div>
                  <div style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(14,79,114,0.07)',
                  }}>
                    {calendarGroups.map((group, gIdx) => (
                      <div key={group.key}>
                        <div style={{
                          background: '#f8fafc',
                          padding: '8px 20px',
                          fontSize: '11px', fontWeight: '800', color,
                          textTransform: 'capitalize', letterSpacing: '0.04em',
                          fontFamily: "'JetBrains Mono', monospace",
                          borderTop: gIdx > 0 ? '1px solid #f1f5f9' : 'none',
                        }}>
                          {group.monthLabel}
                        </div>
                        {group.items!.map((entry, iIdx) => {
                          const d = new Date(entry.date + 'T00:00:00');
                          const shortDate = d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
                          return (
                            <div
                              key={iIdx}
                              style={{
                                display: 'flex', alignItems: 'baseline', gap: '14px',
                                padding: '10px 20px',
                                borderTop: iIdx > 0 ? '1px solid #f8fafc' : 'none',
                              }}
                            >
                              <span style={{
                                flexShrink: 0, minWidth: '58px',
                                fontSize: '12px', fontWeight: '700', color,
                                fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.02em',
                              }}>
                                {shortDate}
                              </span>
                              <span style={{
                                fontSize: '14px', color: '#334155',
                                lineHeight: '1.5', fontFamily: "'Outfit', sans-serif",
                              }}>
                                {entry.name}
                                <span style={{ color: '#94a3b8' }}> · {entry.municipio}</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Beach sections ── */}
              {guide.sections.map((section, idx) => {
                const sectionCategorySlug = section.poiCategory
                  ? (FILTER_TO_CATEGORY_URL[section.poiCategory] ?? POI_CATEGORY_TO_SLUG[section.poiCategory] ?? section.poiCategory)
                  : categorySlug;
                const poiHref = `/${locale}/${island}/${sectionCategorySlug}/${section.poiSlug}`;
                const showCars = idx === 3 && guide.affiliate?.cars;
                const showTours = idx === 6 && guide.affiliate?.tours;
                return (
                  <article
                    key={section.rank}
                    id={`beach-${section.rank}`}
                    style={{
                      marginBottom: '48px',
                      paddingBottom: '48px',
                      borderBottom: idx < guide.sections.length - 1 ? '1px solid #e2e8f0' : 'none',
                      scrollMarginTop: '72px',
                    }}
                  >
                    {/* Section header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '10px' }}>
                      {/* Rank badge */}
                      <div style={{
                        flexShrink: 0,
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: `linear-gradient(135deg, ${colorDark} 0%, ${color} 100%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(14,79,114,0.3)',
                        marginTop: '2px',
                      }}>
                        <span style={{
                          fontSize: '18px', fontWeight: '800', color: 'white',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          {section.rank}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h2 style={{
                          fontSize: 'clamp(20px, 5vw, 30px)', fontWeight: '800',
                          color: '#0a1628', margin: '0 0 4px',
                          letterSpacing: '-0.02em', lineHeight: '1.15',
                          fontFamily: "'Outfit', sans-serif",
                        }}>
                          {section.name}
                        </h2>
                        {/* Municipio tag */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '12px' }}>📍</span>
                          <span style={{
                            fontSize: '11px', fontWeight: '700', color: color,
                            fontFamily: "'JetBrains Mono', monospace",
                            letterSpacing: '0.04em',
                          }}>
                            {section.municipio.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Summary — lead paragraph */}
                    <p style={{
                      fontSize: '17px', fontWeight: '600', color: '#0f172a',
                      fontStyle: 'italic', margin: '16px 0',
                      lineHeight: '1.65',
                      borderLeft: `3px solid ${color}`,
                      paddingLeft: '16px',
                      fontFamily: "'Outfit', sans-serif",
                    }}>
                      {section.summary}
                    </p>

                    {/* Body paragraphs */}
                    {section.content.split('\n\n').map((para, pIdx) => (
                      <p key={pIdx} style={{
                        fontSize: '15px', color: '#334155',
                        lineHeight: '1.85', margin: '0 0 16px',
                        fontFamily: "'Outfit', sans-serif",
                      }}>
                        {para}
                      </p>
                    ))}

                    {/* Tips box */}
                    <div style={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderLeft: '4px solid #16a34a',
                      borderRadius: '14px',
                      padding: '16px 20px',
                      marginTop: '20px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        marginBottom: '12px',
                      }}>
                        <span style={{ fontSize: '14px' }}>💡</span>
                        <span style={{
                          fontSize: '10px', fontWeight: '800', color: '#16a34a',
                          textTransform: 'uppercase', letterSpacing: '0.1em',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}>
                          {labels.tips}
                        </span>
                      </div>
                      <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {section.tips.map((tip, tIdx) => (
                          <li key={tIdx} style={{
                            fontSize: '14px', fontWeight: '500', color: '#1e3a1e',
                            lineHeight: '1.65', fontFamily: "'Outfit', sans-serif",
                          }}>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Map pill CTA */}
                    <a
                      href={poiHref}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: '12px', width: '100%', marginTop: '14px',
                        padding: '14px 20px',
                        background: 'white',
                        border: `1.5px solid ${color}33`,
                        borderRadius: '14px', textDecoration: 'none',
                        boxSizing: 'border-box',
                        boxShadow: '0 2px 8px rgba(14,79,114,0.08)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                          background: `linear-gradient(135deg, ${colorDark} 0%, ${color} 100%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="white" aria-hidden="true">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                        </div>
                        <div>
                          <p style={{
                            margin: '0 0 1px', fontSize: '14px', fontWeight: '700',
                            color: '#0a1628', fontFamily: "'Outfit', sans-serif",
                          }}>
                            {section.name}
                          </p>
                          <p style={{
                            margin: 0, fontSize: '11px', color: color,
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: '700', letterSpacing: '0.05em',
                          }}>
                            {labels.poiLink.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={colorDark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </a>

                    {/* Affiliate — cars */}
                    {showCars && (
                      <a
                        href={`/${locale}/${island}/${guide.affiliate!.cars!.poiPath ?? `transporte/alquiler-coche-${island}`}`}
                        style={{
                          display: 'block', textDecoration: 'none', marginTop: '28px',
                          borderRadius: '16px', overflow: 'hidden',
                          background: 'white',
                          border: '1.5px solid #e2e8f0',
                          boxShadow: '0 2px 12px rgba(14,79,114,0.08)',
                          borderLeft: '4px solid #f59e0b',
                        }}
                      >
                        <div style={{ padding: '18px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '7px', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                              <span style={{ fontSize: '18px', lineHeight: 1 }}>{'🚗'}</span>
                              <span style={{
                                fontSize: '10px', fontWeight: 800, color: '#92400e',
                                textTransform: 'uppercase', letterSpacing: '0.1em',
                                fontFamily: "'JetBrains Mono', monospace",
                              }}>
                                {labels.carsCtaBtn}
                              </span>
                            </div>
                            <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: "'Outfit', sans-serif", textAlign: 'right' }}>
                              {labels.affiliateLabel}
                            </span>
                          </div>
                          <p style={{
                            margin: '0 0 16px', fontSize: '15px', fontWeight: '400',
                            color: '#334155', lineHeight: '1.65',
                            fontFamily: "'Outfit', sans-serif",
                          }}>
                            {guide.affiliate!.cars!.text}
                          </p>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            background: '#f59e0b',
                            color: 'white', borderRadius: '10px',
                            padding: '10px 18px', fontSize: '13px',
                            fontWeight: '800', fontFamily: "'JetBrains Mono', monospace",
                            letterSpacing: '0.05em',
                            boxShadow: '0 3px 10px #f59e0b40',
                          }}>
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            {labels.viewOnMap}
                          </div>
                        </div>
                      </a>
                    )}

                    {/* Affiliate — tours */}
                    {showTours && (
                      <a
                        href={`/${locale}/${island}/${guide.affiliate!.tours!.poiPath ?? `actividades/avistamiento-cetaceos-tenerife`}`}
                        style={{
                          display: 'block', textDecoration: 'none', marginTop: '28px',
                          borderRadius: '16px', overflow: 'hidden',
                          background: 'white',
                          border: '1.5px solid #e2e8f0',
                          boxShadow: '0 2px 12px rgba(14,149,136,0.08)',
                          borderLeft: '4px solid #ff5533',
                        }}
                      >
                        <div style={{ padding: '18px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '7px', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                              <span style={{ fontSize: '18px', lineHeight: 1 }}>{'🐋'}</span>
                              <span style={{
                                fontSize: '10px', fontWeight: 800, color: color,
                                textTransform: 'uppercase', letterSpacing: '0.1em',
                                fontFamily: "'JetBrains Mono', monospace",
                              }}>
                                {labels.toursCtaBtn}
                              </span>
                            </div>
                            <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: "'Outfit', sans-serif", textAlign: 'right' }}>
                              {labels.affiliateLabel}
                            </span>
                          </div>
                          <p style={{
                            margin: '0 0 16px', fontSize: '15px', fontWeight: '400',
                            color: '#334155', lineHeight: '1.65',
                            fontFamily: "'Outfit', sans-serif",
                          }}>
                            {guide.affiliate!.tours!.text}
                          </p>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            background: '#ff5533',
                            color: 'white', borderRadius: '10px',
                            padding: '10px 18px', fontSize: '13px',
                            fontWeight: '800', fontFamily: "'JetBrains Mono', monospace",
                            letterSpacing: '0.05em',
                            boxShadow: '0 3px 10px #ff553340',
                          }}>
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                            </svg>
                            {labels.viewOnMap}
                          </div>
                        </div>
                      </a>
                    )}
                  </article>
                );
              })}

              {/* ── FAQ ── */}
              <section id="faq" style={{ scrollMarginTop: '72px', marginTop: '8px' }}>
                {/* FAQ header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                    background: `linear-gradient(135deg, ${colorDark} 0%, ${color} 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '18px' }}>{'?'}</span>
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '800',
                      color: '#0a1628', margin: 0,
                      letterSpacing: '-0.02em', fontFamily: "'Outfit', sans-serif",
                    }}>
                      {labels.faq}
                    </h2>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {guide.faq.map((item, fIdx) => (
                    <details key={fIdx} style={{
                      border: '1.5px solid #e2e8f0', borderRadius: '14px',
                      overflow: 'hidden', background: 'white',
                      boxShadow: '0 1px 4px rgba(14,79,114,0.06)',
                    }}>
                      <summary style={{
                        padding: '16px 20px',
                        cursor: 'pointer', listStyle: 'none', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center', gap: '12px',
                        userSelect: 'none',
                      }}>
                        <span style={{
                          fontSize: '15px', fontWeight: '700', color: '#0f172a',
                          fontFamily: "'Outfit', sans-serif", lineHeight: '1.4',
                        }}>
                          {item.question}
                          {item.question}
                        </span>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </summary>
                      <div style={{
                        padding: '0 20px 16px',
                        fontSize: '14px', color: '#334155',
                        lineHeight: '1.7', fontFamily: "'Outfit', sans-serif",
                      }}>
                        <p style={{ margin: 0 }}>{item.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}
