'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { locales, type Locale } from '@/lib/types';

const localeData: Record<Locale, { icon: string; label: string }> = {
  es: { icon: '/icons/icons8-spain-48.png',   label: 'Español' },
  en: { icon: '/icons/icons8-united-kingdom-48.png', label: 'English' },
  de: { icon: '/icons/icons8-germany-48.png', label: 'Deutsch' },
};

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

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
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {/* Botón circular con icono de bandera */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        title={current.label}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '2px solid #000000',
          background: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: open
            ? '0 0 0 3px #bbf7d0, 0 4px 16px rgba(0,0,0,0.15)'
            : '0 2px 8px rgba(0,0,0,0.18)',
          transition: 'box-shadow 0.2s',
          position: 'relative',
          zIndex: 9999,
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <img
          src={current.icon}
          alt={current.label}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            overflow: 'hidden',
            zIndex: 9999,
            minWidth: '160px',
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
                  padding: '10px 16px',
                  border: 'none',
                  background: isActive ? '#f0fdf4' : 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: isActive ? '#1f9d61' : '#374151',
                  fontWeight: isActive ? '700' : '400',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '13px',
                  textAlign: 'left',
                }}
              >
                <img
                  src={localeData[locale].icon}
                  alt={localeData[locale].label}
                  style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '50%' }}
                />
                <span>{localeData[locale].label}</span>
                {isActive && (
                  <span style={{ marginLeft: 'auto', color: '#1f9d61', fontSize: '16px' }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
