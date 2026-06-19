'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import type { POI, Locale } from '@/lib/types';

export interface CartItem extends POI {
  cartId: number;
}

export interface CartState {
  items: CartItem[];
  addPoi: (poi: POI) => { success: boolean; message: string };
  removePoi: (cartId: number) => void;
  clearCart: () => void;
  count: number;
  isFull: boolean;
}

interface NotificationState {
  msg: string;
  poi?: POI;
}

/** Devuelve la clave de localStorage para el carrito de una isla concreta.
 *  Ej: /es/gran-canaria/... → 'canaryroutes-cart-gran-canaria'
 *  Si no hay isla en la ruta se usa la key genérica. */
function storageKeyForPath(pathname: string): string {
  // pathname: /locale/island/...  → segments[2] es la isla
  const island = pathname.split('/')[2];
  return island ? `canaryroutes-cart-${island}` : 'canaryroutes-cart';
}

const MESSAGES: Record<Locale, { alreadyAdded: string; added: (name: string) => string; toastTitle: string }> = {
  es: {
    alreadyAdded: 'Este POI ya está en tu ruta',
    added: (name) => `${name} añadido`,
    toastTitle: '✓ Añadido a tu ruta',
  },
  en: {
    alreadyAdded: 'This place is already in your route',
    added: (name) => `${name} added`,
    toastTitle: '✓ Added to your route',
  },
  de: {
    alreadyAdded: 'Dieser Ort ist bereits in deiner Route',
    added: (name) => `${name} hinzugefügt`,
    toastTitle: '✓ Zur Route hinzugefügt',
  },
};

const FALLBACK_MESSAGES = MESSAGES.es;

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children, locale }: { children: React.ReactNode; locale: Locale }) {
  const pathname = usePathname();
  const storageKey = storageKeyForPath(pathname);

  const [items, setItems] = useState<CartItem[]>([]);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const messages = MESSAGES[locale] ?? FALLBACK_MESSAGES;

  // Ref con la key actualmente cargada. Cuando cambia la isla (y por tanto
  // la storageKey), resetea isFirstSave para no sobrescribir la nueva isla
  // con el carrito vacío antes de que el efecto de carga termine.
  const loadedKeyRef = useRef<string>('');
  const isFirstSave = useRef(true);

  // Detecta cambio de isla y resetea el flag de primer guardado
  useEffect(() => {
    if (loadedKeyRef.current !== storageKey) {
      isFirstSave.current = true;
    }
  }, [storageKey]);

  // Carga el carrito de la isla actual (se re-ejecuta al cambiar de isla)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
        else setItems([]);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }
    loadedKeyRef.current = storageKey;
  }, [storageKey]);

  // Guarda el carrito de la isla actual; salta la primera ejecución tras
  // cada carga para evitar machacar datos antes de que setItems se procese.
  useEffect(() => {
    if (isFirstSave.current) {
      isFirstSave.current = false;
      return;
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // almacenamiento lleno o no disponible — se ignora
    }
  }, [items, storageKey]);

  const showNotification = useCallback((msg: string, poi?: POI) => {
    setNotification({ msg, poi });
    setTimeout(() => setNotification(null), 2800);
  }, []);

  const addPoi = useCallback((poi: POI): { success: boolean; message: string } => {
    if (items.some((item) => item.slug === poi.slug)) {
      const result = { success: false, message: messages.alreadyAdded };
      showNotification(result.message);
      return result;
    }
    const newItem: CartItem = { ...poi, cartId: Date.now() + Math.random() };
    setItems((prev) => [...prev, newItem]);
    const result = { success: true, message: messages.added(poi.name) };
    showNotification(result.message, poi);
    return result;
  }, [items, messages, showNotification]);

  const removePoi = useCallback((cartId: number) => {
    setItems((prev) => prev.filter((item) => item.cartId !== cartId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value: CartState = { items, addPoi, removePoi, clearCart, count: items.length, isFull: false };

  return (
    <CartContext.Provider value={value}>
      {children}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 300,
          pointerEvents: 'none',
        }}>
          <style>{`
            @keyframes toastIn {
              from { opacity: 0; transform: translateY(16px) scale(0.95); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          <div style={{ animation: 'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
              padding: '12px 20px 12px 12px',
              border: '1px solid rgba(0,0,0,0.06)',
              minWidth: '300px',
              maxWidth: '340px',
            }}>
              {/* Foto del POI */}
              {notification.poi?.images?.hero && (
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  overflow: 'hidden', flexShrink: 0,
                }}>
                  <img
                    src={notification.poi.images.hero}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              {/* Texto */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                  letterSpacing: '0.06em', color: '#1f9d61',
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: '2px',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  {notification.poi ? messages.toastTitle : notification.msg}
                  <img src="/icons/icons8-car-53.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                </div>
                {notification.poi && (
                  <div style={{
                    fontSize: '14px', fontWeight: '700', color: '#1f2937',
                    fontFamily: "'Outfit', sans-serif",
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {notification.poi.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
