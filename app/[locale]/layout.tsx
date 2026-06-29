import { locales, defaultLocale, type Locale } from '@/lib/types';
import { CartProvider } from '@/hooks/use-cart';
import { CookieConsent } from '@/components/cookie-consent';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// hreflang is handled per-page via generateMetadata alternates.languages
// No static metadata fallback — each page owns its own title/description

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
      {/* Set lang attribute on <html> dynamically for the active locale */}
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.lang = '" + locale + "';",
        }}
      />
      <CartProvider locale={locale}>
        {children}
      </CartProvider>
      {/* Cookie consent banner — also handles conditional GA4 loading */}
      <CookieConsent locale={locale} />
    </>
  );
}
