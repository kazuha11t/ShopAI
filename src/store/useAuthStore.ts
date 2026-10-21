
import { create } from 'zustand';
import * as Keychain from 'react-native-keychain';
import { queryClient } from '@services/queryClient';
import { useCartStore } from './useCartStore';

const TOKEN_SERVICE = 'SHOP_ACCESS_TOKEN';

interface AuthState {
  token: string | null;
  isLoading: boolean;
  isUnlocked: boolean;
  login: (newToken: string) => Promise<void>;
  logout: () => Promise<void>;
  expireSession: () => Promise<void>;
  checkLocalToken: () => Promise<void>;
  setIsUnlocked: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isLoading: true,
  isUnlocked: false,

  login: async (newToken) => {
    const normalizedToken = newToken.trim();

    if (!normalizedToken) {
      throw new Error('Token đăng nhập không hợp lệ.');
    }

    const saved = await Keychain.setGenericPassword(
      'shopai',
      normalizedToken,
      {
        service: TOKEN_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      },
    );

    if (!saved) {
      throw new Error('Không thể lưu phiên đăng nhập an toàn.');
    }

    set({
      token: normalizedToken,
      isUnlocked: true,
      isLoading: false,
    });
  },

  logout: async () => {
    const removed = await Keychain.resetGenericPassword({
      service: TOKEN_SERVICE,
    });

    if (!removed) {
      throw new Error(
        'Không thể xác nhận đã xóa thông tin đăng nhập an toàn.',
      );
    }

    queryClient.clear();
    useCartStore.getState().clearCart();
    set({
      token: null,
      isUnlocked: false,
      isLoading: false,
    });
  },

  expireSession: async () => {
    set({ token: null, isUnlocked: false, isLoading: false });
    queryClient.clear();
    useCartStore.getState().clearCart();
    try { await Keychain.resetGenericPassword({ service: TOKEN_SERVICE }); }
    catch { console.warn('[auth] Could not remove expired credentials'); }
  },

  checkLocalToken: async () => {
    set({ isLoading: true });

    try {
      const credentials = await Keychain.getGenericPassword({
        service: TOKEN_SERVICE,
      });

      if (credentials && credentials.password.trim()) {
        set({
          token: credentials.password,
          isUnlocked: false,
        });
      } else {
        set({
          token: null,
          isUnlocked: false,
        });
      }
    } catch (error) {
      console.error('[auth] Không thể đọc Keychain:', error);

      // Không xóa token hiện có trong Zustand khi Keychain gặp lỗi.
      // Trạng thái tải vẫn được kết thúc ở finally.
    } finally {
      set({ isLoading: false });
    }
  },

  setIsUnlocked: (value) => set({ isUnlocked: value }),
}));
