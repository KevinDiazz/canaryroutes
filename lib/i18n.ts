import { locales, defaultLocale, type Locale, type Island } from './types';

export { locales, defaultLocale };
export type { Locale };

const BASE_URL = 'https://canaryroutes.com';

type HreflangLocale = Locale | 'x-default';
type DisplayNameLocale = Locale | 'no' | 'da' | 'fi' | 'sv';

// El sitio usa trailingSlash: true (next.config.ts) y redirige (301) toda URL
// sin barra final a su versión canónica con barra. Toda URL absoluta que se
// exponga a Google (canonical, hreflang, sitemap, Open Graph) debe pasar por
// aquí para no declarar/enlazar una URL que el propio sitio redirige.
export function withTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : url + '/';
}

export function getHreflangLinks(path: string): { locale: HreflangLocale; href: string }[] {
  const links: { locale: HreflangLocale; href: string }[] = locales.map((locale) => ({
    locale,
    href: withTrailingSlash(`${BASE_URL}/${locale}${path}`),
  }));
  links.push({ locale: 'x-default', href: withTrailingSlash(`${BASE_URL}/${defaultLocale}${path}`) });
  return links;
}

export function getIslandDisplayName(island: Island, locale: Locale): string {
  const names: Record<Island, Record<DisplayNameLocale, string>> = {
    'gran-canaria': {
      es: 'Gran Canaria', en: 'Gran Canaria', de: 'Gran Canaria',
      no: 'Gran Canaria', da: 'Gran Canaria', fi: 'Gran Canaria', sv: 'Gran Canaria',
    },
    tenerife: {
      es: 'Tenerife', en: 'Tenerife', de: 'Tenerife',
      no: 'Tenerife', da: 'Tenerife', fi: 'Tenerife', sv: 'Tenerife',
    },
  };
  return names[island]?.[locale] ?? island;
}

export function localePath(locale: Locale, ...segments: string[]): string {
  return `/${locale}/${segments.join('/')}`;
}
