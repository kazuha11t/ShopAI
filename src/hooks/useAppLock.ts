// src/hooks/useAppLock.ts
// Chương 8 (Phần 8.12 + Bước 5b): Tự khoá lại App khi bị đưa vào nền quá lâu

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '@store/useAuthStore';

/** Sau bao lâu ở nền thì bắt khoá lại — 2 phút là mức cân bằng cho một App thương mại điện tử. */
export const APP_LOCK_TIMEOUT_MS = 2 * 60 * 1000;

type Params = {
  isUnlocked: boolean;
  setIsUnlocked: (value: boolean) => void;
};

/**
 * Lớp phòng thủ BỔ SUNG cho BiometricGateScreen: cổng khoá chỉ kiểm tra lúc App
 * KHỞI ĐỘNG LẠI, còn hook này canh gác cả khi App chỉ tạm rời sang nền rồi quay lại.
 */
export const useAppLock = ({ isUnlocked, setIsUnlocked }: Params) => {
  const token = useAuthStore((state) => state.token);
  // Mốc thời gian lúc App rời sang nền — useRef vì đổi giá trị không cần re-render
  const backgroundedAtRef = useRef<number | null>(null);

  useEffect(() => {
    // Chưa đăng nhập hoặc đang khoá sẵn thì không cần canh
    if (token == null || !isUnlocked) return;

    const handleChange = (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        // 'inactive' xảy ra trên iOS khi kéo Control Center, có cuộc gọi đến...
        backgroundedAtRef.current = Date.now();
        return;
      }

      if (nextState === 'active' && backgroundedAtRef.current != null) {
        const elapsedMs = Date.now() - backgroundedAtRef.current;
        if (elapsedMs > APP_LOCK_TIMEOUT_MS) {
          setIsUnlocked(false); // Quá hạn -> bắt quét sinh trắc học lại
        }
        backgroundedAtRef.current = null;
      }
    };

    const sub = AppState.addEventListener('change', handleChange);
    return () => sub.remove();
  }, [token, isUnlocked, setIsUnlocked]);
};
