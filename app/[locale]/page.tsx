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
    <div className="desktop-wrapper">
    <main className="app-shell" style={{ minHeight: '100vh', background: '#f0ede6', display: 'flex', flexDirection: 'column', height: 'auto' }}>
      {/* Nav */}
      <nav style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
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
        {/* Línea ruta POI */}
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

      {/* Island selector */}
      <IslandSelector locale={locale} />
    </main>
    </div>
  );
}
