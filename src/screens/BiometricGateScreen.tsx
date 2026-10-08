// src/screens/BiometricGateScreen.tsx
// Chương 8 (Bước 4): Cổng khoá sinh trắc học — Face ID / Touch ID / vân tay

import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import ShopButton from '@components/ShopButton';
import { COLORS, SIZES } from '@constants/theme';
import { useAuthStore } from '@store/useAuthStore';

// Chỉ dùng để hỏi "máy đã ĐĂNG KÝ sinh trắc học chưa" (không tính mã PIN)
const biometricOnly = new ReactNativeBiometrics({ allowDeviceCredentials: false });
// Dùng để quét: cho phép nhập mã PIN của máy nếu quét mặt/vân tay hỏng
// (tương đương disableDeviceFallback: false — user đeo khẩu trang vẫn vào được)
const biometricWithFallback = new ReactNativeBiometrics({ allowDeviceCredentials: true });

type Props = {
  /** Gọi khi user đã vượt qua cổng (hoặc máy không hỗ trợ sinh trắc học). */
  onUnlock: () => void;
};

const BiometricGateScreen = ({ onUnlock }: Props) => {
  const [checking, setChecking] = useState(true);
  const [failed, setFailed] = useState(false);
  const [label, setLabel] = useState('sinh trắc học'); // Đổi thành "Face ID" / "vân tay"
  const logout = useAuthStore((state) => state.logout);

  const authenticate = useCallback(async () => {
    setChecking(true);
    setFailed(false);

    try {
      // 1 + 2. Máy có cảm biến VÀ user đã đăng ký khuôn mặt/vân tay chưa?
      const { available, biometryType } = await biometricOnly.isSensorAvailable();

      // Không có -> KHÔNG chặn user. Chặn ở đây thì máy Android giá rẻ không bao giờ vào được app.
      if (!available) {
        onUnlock();
        return;
      }

      // 3. Hiển thị đúng tên loại sinh trắc học
      if (biometryType === BiometryTypes.FaceID) {
        setLabel('Face ID');
      } else if (biometryType === BiometryTypes.TouchID) {
        setLabel('Touch ID');
      } else {
        setLabel('vân tay');
      }

      // 4. Bung giao diện quét của HỆ ĐIỀU HÀNH (app không hề nhìn thấy khuôn mặt bạn — Phần 8.7)
      const result = await biometricWithFallback.simplePrompt({
        promptMessage: 'Xác thực để mở ShopAI',
        cancelButtonText: 'Huỷ',
      });

      if (result.success) {
        onUnlock();
      } else {
        setFailed(true); // Bấm huỷ, quét sai quá nhiều lần...
      }
    } catch (e) {
      // Lỗi bất ngờ từ tầng Native -> vẫn cho user lối thoát, không treo app
      console.log('[biometric] Lỗi xác thực:', e);
      setFailed(true);
    } finally {
      setChecking(false);
    }
  }, [onUnlock]);

  // Tự động bung Pop-up quét ngay khi màn hình vừa hiện lên
  useEffect(() => {
    authenticate();
  }, [authenticate]);

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.hint}>Đang xác thực...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔒</Text>
      <Text style={styles.title}>ShopAI đang khoá</Text>
      <Text style={styles.hint}>
        {failed
          ? `Xác thực ${label} chưa thành công. Bạn có thể thử lại hoặc đăng nhập lại bằng mật khẩu.`
          : `Hãy xác thực bằng ${label} để tiếp tục.`}
      </Text>

      <ShopButton title="Thử lại" onPress={authenticate} style={styles.button} />

      {/* LỐI THOÁT BẮT BUỘC: logout() xoá token -> App.tsx tự chuyển về AuthStack (Login) */}
      <ShopButton
        title="Đăng nhập bằng mật khẩu"
        onPress={logout}
        variant="outline"
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.background,
  },
  icon: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: SIZES.h2, fontWeight: 'bold', marginBottom: 8, color: COLORS.text },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    color: COLORS.textLight,
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 20,
  },
  button: { width: 240, marginBottom: 12 },
});

export default BiometricGateScreen;
