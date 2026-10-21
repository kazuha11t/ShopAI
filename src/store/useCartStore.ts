// src/store/useCartStore.ts
// Chương 6: Zustand Store quản lý giỏ hàng + persist với AsyncStorage

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@data/mockProducts';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        if (!Number.isSafeInteger(product.price) || product.price < 0) return;
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, quantity: Math.min(99, i.quantity + 1) } : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
              },
            ],
          };
        });
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id: string, delta: number) => {
        if (!Number.isInteger(delta)) return;
        set((state) => ({
          items: state.items
            .map((i) => {
              if (i.id === id) {
                const newQty = Math.min(99, i.quantity + delta);
                return newQty > 0 ? { ...i, quantity: newQty } : null;
              }
              return i;
            })
            .filter((i): i is CartItem => i !== null),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      totalPrice: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      totalCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'shopai-cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
