'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import type { Locale } from '@/lib/types';

const STORAGE_KEY = 'cr-cookie-consent';
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

type ConsentValue = 'accepted' | 'rejected';

const LABELS: Record<Locale, {
  text: string;
  cookiesLink: string;
  accept: string;
  reject: string;
}> = {
  es: {
    text: 'Usamos cookies analíticas (Google Analytics) para mejorar la experiencia. Puedes aceptarlas o rechazarlas.',
    cookiesLink: 'Política de cookies',
    accept: 'Aceptar',
    reject: 'Rechazar',
  },
  en: {
    text: 'We use analytics cookies (Google Analytics) to improve your experience. You can accept or decline them.',
    cookiesLink: 'Cookie policy',
    accept: 'Accept',
    reject: 'Decline',
  },
  de: {
    text: 'Wir verwenden Analyse-Cookies (Google Analytics), um Ihre Erfahrung zu verbessern. Sie können diese akzeptieren oder ablehnen.',
    cookiesLink: 'Cookie-Richtlinie',
    accept: 'Akzeptieren',
    reject: 'Ablehnen',
  },
};

export function CookieConsent({ locale }: { locale: Locale }) {
  const [consent, setConsent] = useState<ConsentValue | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentValue | null;
    if (stored === 'accepted' || stored === 'rejected') {
      setConsent(stored);
    } else {
      // Small delay so banner doesn't flash before hydration
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setConsent('accepted');
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(STORAGE_KEY, 'rejected');
    setConsent('rejected');
    setVisible(false);
  };

  const t = LABELS[locale] ?? LABELS.es;

  return (
    <>
      {/* GA4 — only loads if user accepted */}
      {consent === 'accepted' && GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {/* Banner */}
      {visible && (
        <div
          role="dialog"
          aria-label={t.cookiesLink}
          style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            zIndex: 9999,
            background: '#0a1628',
            borderTop: '1px solid rgba(255,255,255,0.10)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.3s ease',
          }}
        >
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(100%); opacity: 0; }
              to   { transform: translateY(0);    opacity: 1; }
            }
          `}</style>

          {/* Text */}
          <p style={{
            flex: 1, margin: 0,
            fontSize: '13px',
            color: 'rgba(255,255,255,0.80)',
            fontFamily: "'Outfit', sans-serif",
            lineHeight: '1.5',
            minWidth: '200px',
          }}>
            {t.text}{' '}
            <a
              href={`/${locale}/cookies`}
              style={{ color: '#4dbed9', textDecoration: 'underline', whiteSpace: 'nowrap' }}
            >
              {t.cookiesLink}
            </a>
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={reject}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.25)',
                color: 'rgba(255,255,255,0.70)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                fontFamily: "'Outfit', sans-serif",
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t.reject}
            </button>
            <button
              onClick={accept}
              style={{
                background: '#0e4f72',
                border: '1px solid #0e4f72',
                color: 'white',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '700',
                fontFamily: "'Outfit', sans-serif",
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t.accept}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
