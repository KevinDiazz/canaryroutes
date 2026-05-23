'use client';
import { useState, useCallback } from 'react';
import type { POI } from '@/lib/types';

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

export function useCart(): CartState {
  const [items, setItems] = useState<CartItem[]>([]);

  const addPoi = useCallback((poi: POI): { success: boolean; message: string } => {
    if (items.length >= 4) {
      return { success: false, message: 'Máximo 4 POIs en versión gratis' };
    }
    if (items.some((item) => item.slug === poi.slug)) {
      return { success: false, message: 'Este POI ya está en el carrito' };
    }
    const newItem: CartItem = { ...poi, cartId: Date.now() + Math.random() };
    setItems((prev) => [...prev, newItem]);
    return { success: true, message: `${poi.name} añadido` };
  }, [items]);

  const removePoi = useCallback((cartId: number) => {
    setItems((prev) => prev.filter((item) => item.cartId !== cartId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  return { items, addPoi, removePoi, clearCart, count: items.length, isFull: items.length >= 4 };
}
