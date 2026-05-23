import { locales, type Locale } from '@/lib/types';
import { LanguageSwitcher } from '@/components/language-switcher';
import { IslandSelector } from '@/components/island-selector';

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

  return (
    <main style={{ minHeight: '100vh', background: '#f8f7f2', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '22px',
          fontWeight: '700',
          color: '#1f9d61',
          letterSpacing: '-0.5px',
        }}>
          🌴 CanaryRoutes
        </span>
        <LanguageSwitcher currentLocale={locale} />
      </nav>

      {/* Island selector */}
      <IslandSelector locale={locale} />
    </main>
  );
}
