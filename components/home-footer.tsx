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

const SOCIAL = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/canary.routes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4.5"/>
        <circle cx="17.5" cy="6.5" r="1" fill="rgba(255,255,255,0.75)" stroke="none"/>
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@canary.routes',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="rgba(255,255,255,0.75)" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
      </svg>
    ),
  },
  {
    label: 'Pinterest',
    href: 'https://es.pinterest.com/lobuenoexiste/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.75)" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
      </svg>
    ),
  },
];

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

        {/* Redes sociales */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {SOCIAL.map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.16)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'; }}
            >
              {icon}
            </a>
          ))}
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
