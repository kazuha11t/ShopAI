// src/store/useReviewStore.ts
// Chương 6.10: Zustand Store lưu đánh giá (Review) người dùng tự thêm, persist AsyncStorage

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Review } from '@data/mockProducts';

interface ReviewState {
  reviewsByProduct: Record<string, Review[]>;
  addReview: (productId: string, review: Omit<Review, 'id' | 'createdAt'>) => void;
  getReviews: (productId: string) => Review[];
}

// Mảng rỗng dùng chung: Zustand v5 so sánh selector theo tham chiếu, trả `[]` mới mỗi lần sẽ gây vòng lặp render vô hạn
const EMPTY_REVIEWS: Review[] = [];

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviewsByProduct: {},

      addReview: (productId, review) => {
        const newReview: Review = {
          ...review,
          id: 'usr-' + Date.now(),
          createdAt: new Date().toLocaleDateString('vi-VN'),
        };
        set((state) => ({
          reviewsByProduct: {
            ...state.reviewsByProduct,
            [productId]: [newReview, ...(state.reviewsByProduct[productId] ?? [])],
          },
        }));
      },

      getReviews: (productId) => get().reviewsByProduct[productId] ?? EMPTY_REVIEWS,
    }),
    {
      name: 'shopai-review-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
