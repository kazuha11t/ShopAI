// src/store/useAuthStore.ts
// Chương 8 (Bước 2): Zustand + Hardware Keystore — Token được mã hoá bằng khoá phần cứng
// (Android Keystore / iOS Keychain + Secure Enclave) thay vì nằm trong RAM hay AsyncStorage.
//
// Ghi chú: giáo trình dùng expo-secure-store, nhưng Expo SDK chưa hỗ trợ RN 0.87 nên ShopAI
// dùng react-native-keychain — cùng cơ chế Keystore/Keychain, API khác tên.

import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';

const TOKEN_SERVICE = 'SHOP_ACCESS_TOKEN';

interface AuthState {
  token: string | null;
  isLoading: boolean; // Đang kiểm tra Keystore lúc mở app
  // Cổng sinh trắc học: false = đang khoá. Đặt trong Store (theo gợi ý Bước 5) để
  // user vừa gõ mật khẩu xong không bị hỏi Face ID thêm lần nữa.
  isUnlocked: boolean;
  login: (newToken: string) => Promise<void>;
  logout: () => Promise<void>;
  checkLocalToken: () => Promise<void>; // Chạy lúc mở app
  setIsUnlocked: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isLoading: true,
  isUnlocked: false,

  // Lưu token vào RAM VÀ xuống Keystore mã hoá phần cứng
  login: async (newToken) => {
    try {
      await Keychain.setGenericPassword('shopai', newToken, {
        service: TOKEN_SERVICE,
        // Chỉ đọc được khi máy đã mở khoá, không đồng bộ sang thiết bị khác qua iCloud
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (e) {
      console.log('[auth] Lỗi ghi Keystore:', e);
    }
    set({ token: newToken, isUnlocked: true });
  },

  // Huỷ token ở cả RAM lẫn Keystore
  logout: async () => {
    try {
      await Keychain.resetGenericPassword({ service: TOKEN_SERVICE });
    } catch (e) {
      console.log('[auth] Lỗi xoá Keystore:', e);
    }
    set({ token: null, isUnlocked: false });
  },

  // Móc token từ Keystore lên khi app vừa khởi động lại
  checkLocalToken: async () => {
    try {
      const credentials = await Keychain.getGenericPassword({ service: TOKEN_SERVICE });
      if (credentials) {
        set({ token: credentials.password }); // isUnlocked vẫn false -> phải qua cổng sinh trắc học
      }
    } catch (e) {
      console.log('[auth] Lỗi đọc Keystore:', e);
    } finally {
      set({ isLoading: false });
    }
  },

  setIsUnlocked: (value) => set({ isUnlocked: value }),
}));
