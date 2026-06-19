'use client';
import type { Locale } from '@/lib/types';

const FOOTER_TEXT: Record<Locale, {
  tagline: string;
  affiliateDisclosure: string;
  legal: string;
  privacy: string;
  cookies: string;
  terms: string;
  contact: string;
  copyright: string;
}> = {
  es: {
    tagline: 'Tu guía de viaje digital para las Islas Canarias',
    affiliateDisclosure: 'Este sitio contiene enlaces de afiliados. Si realizas una compra a través de ellos, podemos recibir una comisión sin coste adicional para ti.',
    legal: 'Aviso Legal',
    privacy: 'Privacidad',
    cookies: 'Cookies',
    terms: 'Condiciones de Uso',
    contact: 'Contacto',
    copyright: '© 2026 CanaryRoutes. Todos los derechos reservados.',
  },
  en: {
    tagline: 'Your digital travel guide for the Canary Islands',
    affiliateDisclosure: 'This site contains affiliate links. If you make a purchase through them, we may receive a commission at no extra cost to you.',
    legal: 'Legal Notice',
    privacy: 'Privacy',
    cookies: 'Cookies',
    terms: 'Terms of Use',
    contact: 'Contact',
    copyright: '© 2026 CanaryRoutes. All rights reserved.',
  },
  de: {
    tagline: 'Dein digitaler Reiseführer für die Kanarischen Inseln',
    affiliateDisclosure: 'Diese Website enthält Affiliate-Links. Wenn du über diese einkaufst, erhalten wir möglicherweise eine Provision ohne zusätzliche Kosten für dich.',
    legal: 'Impressum',
    privacy: 'Datenschutz',
    cookies: 'Cookies',
    terms: 'Nutzungsbedingungen',
    contact: 'Kontakt',
    copyright: '© 2026 CanaryRoutes. Alle Rechte vorbehalten.',
  },
};

export function HomeFooter({ locale }: { locale: Locale }) {
  const t = FOOTER_TEXT[locale] ?? FOOTER_TEXT.es;

  return (
    <footer style={{
      background: '#0a0a0a',
      color: 'rgba(255,255,255,0.75)',
      padding: '40px 24px 32px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Logo + tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '26px',
            fontWeight: '700',
            color: 'white',
            letterSpacing: '0.01em',
          }}>
            CanaryRoutes
          </span>
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '13px',
            color: 'rgba(255,255,255,0.55)',
            margin: 0,
            lineHeight: '1.5',
          }}>
            {t.tagline}
          </p>
        </div>

        {/* Aviso de afiliados */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          borderLeft: '3px solid #4dbed9',
          borderRadius: '0 8px 8px 0',
          padding: '12px 16px',
        }}>
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '12px',
            color: 'rgba(255,255,255,0.60)',
            margin: 0,
            lineHeight: '1.6',
          }}>
            {t.affiliateDisclosure}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.10)' }} />

        {/* Links legales */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', alignItems: 'center' }}>
          {[
            { label: t.legal,   href: `/${locale}/aviso-legal` },
            { label: t.privacy, href: `/${locale}/privacidad` },
            { label: t.cookies, href: `/${locale}/cookies` },
            { label: t.terms,   href: `/${locale}/condiciones` },
            { label: t.contact, href: `/${locale}/contacto` },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '12px',
                color: 'rgba(255,255,255,0.55)',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = 'white'; }}
              onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.55)'; }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '11px',
          color: 'rgba(255,255,255,0.30)',
          margin: 0,
          textAlign: 'center',
        }}>
          {t.copyright}
        </p>
      </div>
    </footer>
  );
}
