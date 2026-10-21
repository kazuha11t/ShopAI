import { useCartStore } from '../src/store/useCartStore';
import { formatCurrency } from '../src/utils/formatCurrency';
import { applyVoucherCode } from '../src/constants/vouchers';
import { productsPageSchema } from '../src/services/api';
const product = { id: '1', name: 'Phone', price: 100000, image: '' };
beforeEach(() => useCartStore.getState().clearCart());
test('cart adds quantities, totals and removes the last unit correctly', () => {
  const cart = useCartStore.getState();
  cart.addItem(product); cart.addItem(product);
  cart.addItem({ ...product, id: '2', price: 25000 });
  expect(cart.totalPrice()).toBe(225000);
  expect(cart.totalCount()).toBe(3);
  cart.updateQuantity('1', -2);
  expect(cart.totalPrice()).toBe(25000);
  cart.clearCart();
  expect(cart.totalCount()).toBe(0);
});
test('currency formatter handles zero, rounds VND, rejects nonfinite amounts', () => {
  expect(formatCurrency(123456)).toMatch(/123\.456/);
  expect(formatCurrency(0)).toMatch(/0/);
  expect(() => formatCurrency(NaN)).toThrow();
});
test('voucher never discounts more than subtotal', () => {
  expect(applyVoucherCode('GIAM50K', 10000, 25000).itemDiscount).toBe(10000);
  expect(applyVoucherCode('FREESHIP', 10000, 25000).shippingDiscount).toBe(25000);
  expect(applyVoucherCode('wrong', 10000, 25000).error).toBeTruthy();
});
test('Zod rejects a malformed server product before it reaches the UI', () => {
  expect(() => productsPageSchema.parse({ data: [{ ...product, price: 'free' }], total: 1 })).toThrow();
  expect(productsPageSchema.parse({ data: [product], total: 1 }).data[0].id).toBe('1');
});
