// src/constants/vouchers.ts
// Chương 6.10: Voucher giảm giá — dữ liệu mock + hàm áp dụng

export type VoucherType = 'percent' | 'fixed' | 'freeship';

export interface Voucher {
  code: string;
  label: string;
  type: VoucherType;
  value: number; // percent (0-100) | số tiền cố định (VND)
}

export const MOCK_VOUCHERS: Voucher[] = [
  { code: 'SALE10', label: 'Giảm 10% tổng đơn', type: 'percent', value: 10 },
  { code: 'GIAM50K', label: 'Giảm trực tiếp 50.000đ', type: 'fixed', value: 50000 },
  { code: 'FREESHIP', label: 'Miễn phí vận chuyển', type: 'freeship', value: 0 },
];

export interface VoucherResult {
  voucher: Voucher | null;
  itemDiscount: number;
  shippingDiscount: number;
  error: string | null;
}

export function applyVoucherCode(code: string, subtotal: number, shippingFee: number): VoucherResult {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) {
    return { voucher: null, itemDiscount: 0, shippingDiscount: 0, error: 'Vui lòng nhập mã voucher' };
  }
  const voucher = MOCK_VOUCHERS.find((v) => v.code === trimmed);
  if (!voucher) {
    return { voucher: null, itemDiscount: 0, shippingDiscount: 0, error: 'Mã voucher không tồn tại hoặc đã hết hạn' };
  }
  if (voucher.type === 'percent') {
    return { voucher, itemDiscount: Math.round((subtotal * voucher.value) / 100), shippingDiscount: 0, error: null };
  }
  if (voucher.type === 'fixed') {
    return { voucher, itemDiscount: Math.min(voucher.value, subtotal), shippingDiscount: 0, error: null };
  }
  // freeship
  return { voucher, itemDiscount: 0, shippingDiscount: shippingFee, error: null };
}
