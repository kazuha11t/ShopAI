// src/utils/validation.ts
// Chương 6.7: Zod validation schemas dùng chung cho các form của ShopAI

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
    email: z.string().min(1, 'Email không được để trống').email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Xác nhận mật khẩu không khớp',
    path: ['confirm'],
  });
export type RegisterFormData = z.infer<typeof registerSchema>;

export const checkoutSchema = z.object({
  name: z.string().min(2, 'Vui lòng nhập họ tên người nhận'),
  phone: z
    .string()
    .min(9, 'Số điện thoại không hợp lệ')
    .regex(/^[0-9+\s]+$/, 'Số điện thoại chỉ được chứa chữ số'),
  address: z.string().min(5, 'Vui lòng nhập địa chỉ chi tiết'),
});
export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Trả về object lỗi { field: message } đầu tiên cho mỗi field, tiện bind vào ShopInput
export function extractFieldErrors<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
): { success: true; data: z.infer<T> } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_root';
    if (!errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors };
}
