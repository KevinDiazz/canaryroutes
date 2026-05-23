import type { Metadata } from 'next';
import { locales, defaultLocale, type Locale } from '@/lib/types';
import { getHreflangLinks } from '@/lib/i18n';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'CanaryRoutes — Audioguías de las Islas Canarias',
  description: 'Descubre Gran Canaria y Tenerife con audioguías premium. Contenido gratuito, sin suscripción.',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (locales.includes(rawLocale as Locale) ? rawLocale : defaultLocale) as Locale;

  return (
    <>
      {getHreflangLinks(`/${locale}`).map(({ locale: l, href }) => (
        <link key={l} rel="alternate" hrefLang={l} href={href} />
      ))}
      {children}
    </>
  );
}
