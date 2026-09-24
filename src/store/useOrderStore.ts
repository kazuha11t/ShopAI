// src/store/useOrderStore.ts
// Chương 6: Zustand Store quản lý đơn hàng & trạng thái thanh toán

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from './useCartStore';

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  totalAmount: number;
  shippingFee: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}

interface OrderState {
  orders: Order[];
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => string;
  payOrder: (id: string) => void;
  getOrderById: (id: string) => Order | undefined;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      createOrder: (orderData) => {
        const id = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
        const newOrder: Order = {
          ...orderData,
          id,
          createdAt: new Date().toLocaleString('vi-VN'),
          status: 'PENDING',
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return id;
      },

      payOrder: (id: string) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, status: 'PAID' } : o,
          ),
        }));
      },

      getOrderById: (id: string) => {
        return get().orders.find((o) => o.id === id);
      },
    }),
    {
      name: 'shopai-order-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
