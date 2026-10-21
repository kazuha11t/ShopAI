
// src/hooks/useAppLock.ts
// Chương 8 (Phần 8.12 + Bước 5b): Tự khóa App khi bị đưa vào nền quá lâu

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '@store/useAuthStore';

/** Thời gian App ở nền trước khi yêu cầu xác thực lại: 2 phút. */
export const APP_LOCK_TIMEOUT_MS = 2 * 60 * 1000;

type Params = {
  isUnlocked: boolean;
  setIsUnlocked: (value: boolean) => void;
};

/**
 * Theo dõi thời gian App rời trạng thái active.
 * Nếu quay lại sau thời gian quy định, yêu cầu xác thực lại.
 */
export const useAppLock = ({
  isUnlocked,
  setIsUnlocked,
}: Params) => {
  const token = useAuthStore((state) => state.token);
  const backgroundedAtRef = useRef<number | null>(null);

  useEffect(() => {
    // Không theo dõi khi chưa đăng nhập hoặc App đang khóa.
    if (token == null || !isUnlocked) {
      backgroundedAtRef.current = null;
      return;
    }

    const handleChange = (nextState: AppStateStatus) => {
      if (nextState === 'inactive' || nextState === 'background') {
        // Giữ mốc thời gian đầu tiên, không ghi đè khi chuyển
        // từ inactive sang background.
        if (backgroundedAtRef.current === null) {
          backgroundedAtRef.current = Date.now();
        }
        return;
      }

      if (nextState === 'active') {
        const backgroundedAt = backgroundedAtRef.current;

        // Chỉ xử lý khi trước đó App đã rời trạng thái active.
        if (backgroundedAt === null) {
          return;
        }

        const elapsedMs = Date.now() - backgroundedAt;

        // Đạt hoặc vượt 2 phút thì khóa lại.
        if (elapsedMs >= APP_LOCK_TIMEOUT_MS) {
          setIsUnlocked(false);
        }

        backgroundedAtRef.current = null;
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleChange,
    );

    return () => {
      subscription.remove();
    };
  }, [token, isUnlocked, setIsUnlocked]);
};
