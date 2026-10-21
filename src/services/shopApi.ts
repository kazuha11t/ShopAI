import axios from 'axios';
import { z } from 'zod';
import { API_BASE_URL } from '@constants/environment';
import { useAuthStore } from '@store/useAuthStore';
import { reportFailure } from './monitoring';

export const productSchema = z.object({
  id: z.string(), name: z.string(), price: z.number().nonnegative(),
  image: z.string(), category: z.string().nullish().transform(v => v ?? undefined),
  rating: z.number().nullish().transform(v => v ?? undefined),
  description: z.string().nullish().transform(v => v ?? undefined),
  stock: z.number().int().nonnegative().optional(),
});
export const productsPageSchema = z.object({ data: z.array(productSchema), total: z.number().int().nonnegative() });
export const orderSchema = z.object({
  id: z.string(), createdAt: z.string(), totalAmount: z.number().nonnegative(),
  shippingFee: z.number().nonnegative(), status: z.enum(['PENDING', 'PAID', 'CANCELLED']),
  customerName: z.string(), customerPhone: z.string(), customerAddress: z.string(),
  items: z.array(z.object({
    id: z.string(), name: z.string(), image: z.string(), price: z.number().nonnegative(),
    quantity: z.number().int().positive(),
  })),
});
export type ServerOrder = z.infer<typeof orderSchema>;
const sessionSchema = z.object({ accessToken: z.string().min(1) });
export const apiClient = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });
apiClient.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token && !config.url?.startsWith('/auth/')) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
apiClient.interceptors.response.use(response => response, async (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401 &&
      !error.config?.url?.startsWith('/auth/')) {
    if (error.config?.headers?.Authorization === `Bearer ${useAuthStore.getState().token}`) {
      await useAuthStore.getState().expireSession();
    }
  }
  return Promise.reject(error);
});
export function apiErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) return 'Dữ liệu từ máy chủ không đúng định dạng. Vui lòng thử lại.';
  if (axios.isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join('\n');
    if (!error.response) return 'Không kết nối được máy chủ. Kiểm tra mạng và địa chỉ API.';
    return 'Yêu cầu chưa thành công. Vui lòng thử lại.';
  }
  return error instanceof Error ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại.';
}
export async function authenticate(path: 'login' | 'register', data: { email: string; password: string; name?: string }) {
  return sessionSchema.parse((await apiClient.post(`/auth/${path}`, data)).data).accessToken;
}
export async function fetchProductsApi(page = 1, limit = 6) {
  try { return productsPageSchema.parse((await apiClient.get('/products', { params: { page, limit } })).data); }
  catch (error) { reportFailure('products'); throw error; }
}
export async function fetchProduct(id: string) {
  return productSchema.parse((await apiClient.get(`/products/${encodeURIComponent(id)}`)).data);
}
export async function fetchOrders() {
  return z.array(orderSchema).parse((await apiClient.get('/orders')).data);
}
export async function fetchOrder(id: string) {
  return orderSchema.parse((await apiClient.get(`/orders/${encodeURIComponent(id)}`)).data);
}
export async function payOrder(id: string) {
  return orderSchema.parse((await apiClient.post(`/orders/${encodeURIComponent(id)}/pay`)).data);
}
export type CheckoutRequest = {
  items: { productId: number; quantity: number }[]; voucherCode?: string;
};
export async function quoteOrder(data: CheckoutRequest) {
  return z.object({
    subtotal: z.number(), discount: z.number(), shippingFee: z.number(), totalAmount: z.number(),
  }).parse((await apiClient.post('/orders/quote', data)).data);
}
export async function createOrder(data: CheckoutRequest & {
  requestId: string; expectedTotal: number; customerName: string; customerPhone: string; customerAddress: string;
}) {
  try { return orderSchema.parse((await apiClient.post('/orders', data)).data); }
  catch (error) { reportFailure('checkout'); throw error; }
}
