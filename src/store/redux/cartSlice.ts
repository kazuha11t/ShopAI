// src/store/redux/cartSlice.ts
// Chương 6: Bài tập chuẩn đề cương - Redux Toolkit Cart Slice

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '@data/mockProducts';

export interface ReduxCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ReduxCartState {
  items: ReduxCartItem[];
}

const initialState: ReduxCartState = {
  items: [],
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Product>) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity += 1;
      } else {
        state.items.push({
          id: action.payload.id,
          name: action.payload.name,
          price: action.payload.price,
          quantity: 1,
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
