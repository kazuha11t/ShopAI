// src/store/useWishlistStore.ts
// Chương 6.10: Zustand Store quản lý danh sách yêu thích (Wishlist) + persist AsyncStorage

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WishlistState {
  productIds: string[];
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],

      isWishlisted: (id: string) => get().productIds.includes(id),

      toggleWishlist: (id: string) => {
        set((state) => ({
          productIds: state.productIds.includes(id)
            ? state.productIds.filter((pid) => pid !== id)
            : [...state.productIds, id],
        }));
      },
    }),
    {
      name: 'shopai-wishlist-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
