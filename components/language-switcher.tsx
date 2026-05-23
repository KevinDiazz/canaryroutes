'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { locales, type Locale } from '@/lib/types';

const localeData: Record<Locale, { flag: string; label: string }> = {
  es: { flag: '🇪🇸', label: 'Español' },
  en: { flag: '🇬🇧', label: 'English' },
  de: { flag: '🇩🇪', label: 'Deutsch' },
  no: { flag: '🇳🇴', label: 'Norsk' },
  da: { flag: '🇩🇰', label: 'Dansk' },
  fi: { flag: '🇫🇮', label: 'Suomi' },
  sv: { flag: '🇸🇪', label: 'Svenska' },
};

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Cierra al tocar fuera
  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        btnRef.current && !btnRef.current.contains(target) &&
        dropRef.current && !dropRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const handleSelect = (newLocale: Locale) => {
    setOpen(false);
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const current = localeData[currentLocale] ?? localeData['en'];

  return (
    <>
      {/* Botón circular con bandera */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        title={current.label}
        style={{
          padding:'10px',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.8)',
          background: 'white',
          cursor: 'pointer',
          fontSize: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: open
            ? '0 0 0 3px #bbf7d0, 0 4px 16px rgba(0,0,0,0.15)'
            : '0 2px 8px rgba(0,0,0,0.18)',
          transition: 'box-shadow 0.2s',
          position: 'relative',
          zIndex: 9999,
        }}
      >
        {current.flag}
      </button>

      {/* Dropdown — position fixed para no quedar cortado por el SVG */}
      {open && (
        <div
          ref={dropRef}
          style={{
            position: 'fixed',
            top: '124px',   // debajo de la barra de filtros
            right: '12px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            overflow: 'hidden',
            zIndex: 9999,
            minWidth: '180px',
          }}
        >
          {locales.map((locale) => {
            const isActive = locale === currentLocale;
            return (
              <button
                key={locale}
                onClick={() => handleSelect(locale)}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  border: 'none',
                  background: isActive ? '#f0fdf4' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '16px',
                  color: isActive ? '#1f9d61' : '#374151',
                  fontWeight: isActive ? '700' : '400',
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '22px' }}>{localeData[locale].flag}</span>
                <span>{localeData[locale].label}</span>
                {isActive && (
                  <span style={{ marginLeft: 'auto', color: '#1f9d61', fontSize: '18px' }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
