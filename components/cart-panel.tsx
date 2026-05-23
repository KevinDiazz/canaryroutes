'use client';
import { CartItem } from './cart-item';
import { openMapsFromCurrentLocation } from '@/services/maps-service';
import { useState } from 'react';
import type { CartState } from '@/hooks/use-cart';

interface CartPanelProps {
  cart: CartState;
  isOpen: boolean;
  onClose: () => void;
}

export function CartPanel({ cart, isOpen, onClose }: CartPanelProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenMaps = async () => {
    if (cart.items.length === 0) return;
    setIsLoading(true);
    try {
      await openMapsFromCurrentLocation(
        cart.items
          .flatMap((i) => {
            if (
              typeof i.coordinates?.lat !== 'number' ||
              !Number.isFinite(i.coordinates.lat) ||
              typeof i.coordinates?.lng !== 'number' ||
              !Number.isFinite(i.coordinates.lng)
            ) {
              return [];
            }
            return [{ lat: i.coordinates.lat, lng: i.coordinates.lng }];
          })
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error abriendo Maps');
    } finally {
      setIsLoading(false);
    }
  };

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
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 350,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
        fontFamily: "'Cormorant Garamond', Georgia, serif",
      }}>

        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>
              Mi Ruta
            </h3>
            <span style={{
              background: cart.count > 0 ? '#1f9d61' : '#e5e7eb',
              color: cart.count > 0 ? 'white' : '#9ca3af',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              transition: 'background 0.2s',
            }}>
              {cart.count}/4
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '16px',
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
              fontSize: '14px',
              lineHeight: '1.6',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🗺️</div>
              Toca un POI en el mapa<br />para añadirlo a tu ruta
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

        {/* Footer con botón Maps */}
        {cart.items.length > 0 && (
          <div style={{ padding: '16px', borderTop: '1px solid #f3f4f6' }}>
            <button
              onClick={handleOpenMaps}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                background: isLoading ? '#e5e7eb' : 'linear-gradient(135deg, #1f9d61, #47c987)',
                color: isLoading ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isLoading ? 'none' : '0 4px 16px rgba(31,157,97,0.3)',
              }}
            >
              <span>{isLoading ? '⏳' : '🗺️'}</span>
              <span>{isLoading ? 'Cargando...' : 'Abrir en Google Maps'}</span>
            </button>
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
              {cart.count} parada{cart.count > 1 ? 's' : ''}
              {cart.count > 1 ? ' · Ruta optimizada' : ''}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
