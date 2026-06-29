import Image from 'next/image';
import { LanguageSwitcher } from '@/components/language-switcher';
import type { Locale } from '@/lib/types';

interface LegalPageLayoutProps {
  locale: Locale;
  title: string;
  children: React.ReactNode;
  backLabel: string;
}

export function LegalPageLayout({ locale, title, children, backLabel }: LegalPageLayoutProps) {
  return (
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
            href={`/${locale}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              textDecoration: 'none', flexShrink: 0,
              background: '#0a1628', color: 'white',
              borderRadius: '8px', padding: '6px 12px',
              fontSize: '11px', fontWeight: '800',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.06em',
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {backLabel.toUpperCase()}
          </a>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <a href={`/${locale}`}>
              <Image src="/logo/logoByN-removebg-preview.png" alt="CanaryRoutes" width={160} height={40} style={{ height: '52px', width: 'auto' }} unoptimized />
            </a>
          </div>
          <LanguageSwitcher currentLocale={locale} />
        </nav>

        {/* ── Content ── */}
        <main style={{ maxWidth: '720px', width: '100%', margin: '0 auto', padding: '40px 24px 80px', fontFamily: "'Outfit', sans-serif" }}>
          <h1 style={{
            fontSize: 'clamp(26px, 6vw, 40px)', fontWeight: '800',
            color: '#0a1628', margin: '0 0 32px',
            letterSpacing: '-0.02em', lineHeight: '1.1',
          }}>
            {title}
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', color: '#334155', fontSize: '15px', lineHeight: '1.8' }}>
            {children}
          </div>
        </main>

        {/* ── Footer mínimo ── */}
        <footer style={{
          marginTop: 'auto', padding: '20px 24px',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
          fontFamily: "'Outfit', sans-serif",
          fontSize: '12px', color: '#94a3b8',
        }}>
          © 2026 CanaryRoutes
        </footer>
      </div>
    </div>
  );
}

// Reusable section block
export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{
        fontSize: '18px', fontWeight: '700', color: '#0f172a',
        margin: '0 0 10px', fontFamily: "'Outfit', sans-serif",
      }}>
        {title}
      </h2>
      <div style={{ color: '#475569', lineHeight: '1.8' }}>
        {children}
      </div>
    </section>
  );
}
