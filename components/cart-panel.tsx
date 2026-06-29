'use client';
import { CartItem } from './cart-item';
import type { CartState } from '@/hooks/use-cart';
import type { Locale } from '@/lib/types';
import { useUiStrings } from '@/lib/ui-strings';

interface CartPanelProps {
  cart: CartState;
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
}

export function CartPanel({ cart, isOpen, onClose, locale }: CartPanelProps) {
  const t = useUiStrings(locale);

  return (
    <>
      {/* Overlay semitransparente al abrir */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.25)',
            zIndex: 340,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Panel lateral derecho */}
      <aside style={{
        position: 'fixed',
        right: 0,
        top: 0,
        width: '300px',
        maxWidth: '90vw',
        height: '100dvh',
        background: 'white',
        boxShadow: isOpen ? '-4px 0 24px rgba(0,0,0,0.12)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 350,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
        fontFamily: "'Outfit', sans-serif",
      }}>

        {/* Header */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1f2937', fontFamily: "'Outfit', sans-serif" }}>
              {t.cart.title}
            </h3>
            <img src="/icons/icons8-car-53.png" alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              cursor: 'pointer',
              fontSize: '15px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Lista de POIs */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
          {cart.items.length === 0 ? (
            <div style={{
              padding: '48px 16px',
              textAlign: 'center',
              color: '#9ca3af',
              lineHeight: '1.6',
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
              <p style={{ margin: 0, fontSize: '15px', fontFamily: "'Outfit', sans-serif", fontWeight: '600', color: '#6b7280' }}>{t.cart.empty}</p>
              <p style={{ margin: '6px 0 0', fontSize: '13px', fontFamily: "'Inter', sans-serif", color: '#9ca3af', whiteSpace: 'pre-line' }}>{t.cart.emptyHint}</p>
              <img src="/icons/icons8-car-53.png" alt="" style={{ width: '48px', height: '48px', objectFit: 'contain', opacity: 0.3, marginBottom: '12px' }} />
            </div>
          ) : (
            <ul style={{ padding: 0, margin: 0 }}>
              {cart.items.map((poi, idx) => (
                <CartItem
                  key={poi.cartId}
                  index={idx}
                  poi={poi}
                  onRemove={() => cart.removePoi(poi.cartId)}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Footer — contador + hint */}
        {cart.items.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
              {cart.count} {cart.count === 1 ? t.cart.stop : t.cart.stops} · {t.cart.tapToOpen ?? 'Toca una parada para abrir en Maps'}
            </p>
          </div>
        )}

        {/* Redes sociales */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}>
          <a href="https://www.instagram.com/canary.routes" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#e2e8f0'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#f1f5f9'; }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4.5"/><circle cx="17.5" cy="6.5" r="1" fill="#64748b" stroke="none"/>
            </svg>
          </a>
          <a href="https://www.tiktok.com/@canary.routes" target="_blank" rel="noopener noreferrer" aria-label="TikTok"
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#e2e8f0'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#f1f5f9'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#64748b" aria-hidden="true">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.19 8.19 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
            </svg>
          </a>
          <a href="https://es.pinterest.com/lobuenoexiste/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest"
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#e2e8f0'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#e2e8f0'; }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="#64748b" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
            </svg>
          </a>
        </div>
      </aside>
    </>
  );
}
