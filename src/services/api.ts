// src/services/api.ts
// Chương 6: Cấu hình Axios Client với Interceptor gắn Token và Mock API có phân trang

import axios from 'axios';
import { MOCK_PRODUCTS, Product } from '@data/mockProducts';

export const apiClient = axios.create({
  baseURL: 'https://api.shopai.local/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm Bearer Token vào mọi request (Chương 6.4)
apiClient.interceptors.request.use(
  async (config) => {
    const token = 'mock-bearer-token-12345';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Mock Service có phân trang (Pagination)
export const fetchProductsApi = async (page = 1, limit = 6): Promise<{ data: Product[]; total: number }> => {
  // Giả lập network latency 400ms
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 400));
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    data: MOCK_PRODUCTS.slice(start, end),
    total: MOCK_PRODUCTS.length,
  };
};
