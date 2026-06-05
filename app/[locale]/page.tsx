import Image from 'next/image';
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
    <main style={{ minHeight: '100vh', background: '#f0ede6', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'white',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <Image
          src="/logo/file.svg"
          alt="CanaryRoutes"
          width={160}
          height={40}
          style={{ height: '75px', width: 'auto' }}
          priority
          unoptimized
        />
        <LanguageSwitcher currentLocale={locale} />
      </nav>

      {/* Island selector */}
      <IslandSelector locale={locale} />
    </main>
  );
}
