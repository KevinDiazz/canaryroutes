import { notFound } from 'next/navigation';
import { locales, islands, type Locale, type Island } from '@/lib/types';
import { getIslandDisplayName, withTrailingSlash } from '@/lib/i18n';
import { IslandHubPage } from '@/components/hub-pages';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://canaryroutes.com';

const islandDescriptions: Record<string, Record<string, string>> = {
  'gran-canaria': {
    es: 'Qué ver y hacer en Gran Canaria: playas, senderos, cultura, naturaleza y actividades, con mapa interactivo para planificar tu ruta.',
    en: 'What to see and do in Gran Canaria: beaches, hikes, culture, nature and activities, with an interactive map to plan your route.',
    de: 'Was man auf Gran Canaria sehen und tun kann: Strände, Wanderwege, Kultur, Natur und Aktivitäten – mit interaktiver Karte zur Routenplanung.',
  },
  tenerife: {
    es: 'Qué ver y hacer en Tenerife: playas, senderos, el Teide, cultura y actividades, con mapa interactivo para planificar tu ruta.',
    en: 'What to see and do in Tenerife: beaches, hikes, Mount Teide, culture and activities, with an interactive map to plan your route.',
    de: 'Was man auf Teneriffa sehen und tun kann: Strände, Wanderwege, der Teide, Kultur und Aktivitäten – mit interaktiver Karte zur Routenplanung.',
  },
};

const TITLES: Record<string, (n: string) => string> = {
  es: (n) => `${n}: playas, senderos y qué ver | CanaryRoutes`,
  en: (n) => `${n}: beaches, hikes and things to do | CanaryRoutes`,
  de: (n) => `${n}: Strände, Wanderungen und Sehenswürdigkeiten | CanaryRoutes`,
};

function titleFor(locale: Locale, island: Island) {
  return (TITLES[locale] ?? TITLES.es)(getIslandDisplayName(island, locale));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; island: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, island: rawIsland } = await params;
  const locale = rawLocale as Locale;
  const island = rawIsland as Island;
  if (!(islands as readonly string[]).includes(island)) return {};
  const desc = islandDescriptions[island]?.[locale] ?? islandDescriptions[island]?.['en'] ?? '';
  const title = titleFor(locale, island);
  const url = withTrailingSlash(`${SITE_URL}/${locale}/${island}`);

  return {
    title,
    description: desc,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, withTrailingSlash(`${SITE_URL}/${l}/${island}`)])),
        'x-default': withTrailingSlash(`${SITE_URL}/es/${island}`),
      },
    },
    openGraph: {
      title,
      description: desc,
      url,
      siteName: 'CanaryRoutes',
      locale,
      type: 'website',
      images: [{ url: SITE_URL + '/og-default.png', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [SITE_URL + '/og-default.png'],
    },
  };
}

export async function generateStaticParams() {
  return locales.flatMap((locale) => islands.map((island) => ({ locale, island })));
}

export default async function IslandPage({
  params,
}: {
  params: Promise<{ locale: string; island: string }>;
}) {
  const { locale: rawLocale, island: rawIsland } = await params;
  const locale = rawLocale as Locale;
  const island = rawIsland as Island;
  if (!(islands as readonly string[]).includes(island)) notFound();

  return <IslandHubPage locale={locale} island={island} title={titleFor(locale, island)} />;
}
