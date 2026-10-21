export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) throw new Error('Số tiền không hợp lệ');
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}
