import { locales, defaultLocale, type Locale, type Island } from './types';

export { locales, defaultLocale };
export type { Locale };

const BASE_URL = 'https://canaryroutes.com';

type HreflangLocale = Locale | 'x-default';
type DisplayNameLocale = Locale | 'no' | 'da' | 'fi' | 'sv';

export function getHreflangLinks(path: string): { locale: HreflangLocale; href: string }[] {
  const links: { locale: HreflangLocale; href: string }[] = locales.map((locale) => ({
    locale,
    href: `${BASE_URL}/${locale}${path}`,
  }));
  links.push({ locale: 'x-default', href: `${BASE_URL}/${defaultLocale}${path}` });
  return links;
}

export function getIslandDisplayName(island: Island, locale: Locale): string {
  const names: Record<Island, Record<DisplayNameLocale, string>> = {
    'gran-canaria': {
      es: 'Gran Canaria', en: 'Gran Canaria', de: 'Gran Canaria',
      no: 'Gran Canaria', da: 'Gran Canaria', fi: 'Gran Canaria', sv: 'Gran Canaria',
    },
    tenerife: {
      es: 'Tenerife', en: 'Tenerife', de: 'Teneriffa',
      no: 'Tenerife', da: 'Tenerife', fi: 'Tenerife', sv: 'Teneriffa',
    },
  };
  return names[island][locale];
}

export function localePath(locale: Locale, ...segments: string[]): string {
  return `/${locale}/${segments.join('/')}`;
}
