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
      </aside>
    </>
  );
}
