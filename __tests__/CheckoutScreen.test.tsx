import React from 'react';
import { Alert } from 'react-native';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckoutScreen from '../src/screens/CheckoutScreen';
import { useCartStore } from '../src/store/useCartStore';
import { createOrder } from '../src/services/api';

const mockReplace = jest.fn();
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ replace: mockReplace }) }));
jest.mock('../src/hooks/useLocation', () => ({
  useLocation: () => ({ distanceKm: 5, shippingFee: 25000, error: null }),
}));
jest.mock('../src/services/api', () => ({
  quoteOrder: jest.fn(async () => ({ subtotal: 100000, shippingFee: 25000, discount: 0, totalAmount: 125000 })),
  createOrder: jest.fn(),
  apiErrorMessage: () => 'Network unavailable',
}));
beforeEach(() => {
  jest.clearAllMocks();
  useCartStore.getState().clearCart();
  useCartStore.getState().addItem({ id: '1', name: 'Phone', image: '', price: 100000 });
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
async function openCheckout() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false, gcTime: Infinity } } });
  await render(<QueryClientProvider client={client}><CheckoutScreen /></QueryClientProvider>);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Xác nhận Đặt Hàng' }).props.accessibilityState.disabled).toBe(false));
}
test('successful checkout sends IDs and server quote, then clears cart and opens the receipt', async () => {
  jest.mocked(createOrder).mockResolvedValueOnce({
    id: 'order-1', status: 'PENDING', items: [], totalAmount: 125000, shippingFee: 25000,
    customerName: 'Test', customerPhone: '0987654321', customerAddress: 'Test street', createdAt: new Date().toISOString(),
  });
  await openCheckout();
  await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Xác nhận Đặt Hàng' })); });
  await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('OrderDetail', { orderId: 'order-1' }));
  expect(jest.mocked(createOrder).mock.calls[0][0]).toEqual(expect.objectContaining({
    items: [{ productId: 1, quantity: 1 }], expectedTotal: 125000,
  }));
  expect(useCartStore.getState().items).toHaveLength(0);
});
test('failed checkout keeps the cart and reuses the request ID on retry', async () => {
  jest.mocked(createOrder).mockRejectedValue(new Error('network'));
  await openCheckout();
  await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Xác nhận Đặt Hàng' })); });
  await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
  expect(useCartStore.getState().items).toHaveLength(1);
  await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Xác nhận Đặt Hàng' })); });
  await waitFor(() => expect(createOrder).toHaveBeenCalledTimes(2));
  expect(jest.mocked(createOrder).mock.calls[0][0].requestId).toBe(jest.mocked(createOrder).mock.calls[1][0].requestId);
  expect(mockReplace).not.toHaveBeenCalled();
});
