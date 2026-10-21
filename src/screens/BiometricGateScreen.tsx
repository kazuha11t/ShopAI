import { useThemedStyles } from '@hooks/useThemedStyles';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ReactNativeBiometrics, {
  BiometryTypes,
} from 'react-native-biometrics';

import ShopButton from '@components/ShopButton';
import { COLORS, SIZES } from '@constants/theme';
import { useAuthStore } from '@store/useAuthStore';

const biometric = new ReactNativeBiometrics({
  allowDeviceCredentials: true,
});

type Props = {
  onUnlock: () => void;
};

const BiometricGateScreen: React.FC<Props> = ({ onUnlock }) => {
  const styles = useThemedStyles(baseStyles);
  const [checking, setChecking] = useState(true);
  const [failed, setFailed] = useState(false);
  const [label, setLabel] = useState('phương thức xác thực của thiết bị');

  const authenticationInProgress = useRef(false);
  const logoutInProgress = useRef(false);

  const logout = useAuthStore((state) => state.logout);

  const authenticate = useCallback(async () => {
    // Chặn việc mở nhiều hộp thoại xác thực cùng lúc.
    if (authenticationInProgress.current) {
      return;
    }

    authenticationInProgress.current = true;
    setChecking(true);
    setFailed(false);

    let authenticated = false;

    try {
      const { available, biometryType } =
        await biometric.isSensorAvailable();

      if (available && biometryType === BiometryTypes.FaceID) {
        setLabel('Face ID');
      } else if (
        available &&
        biometryType === BiometryTypes.TouchID
      ) {
        setLabel('Touch ID');
      } else if (available) {
        setLabel('vân tay');
      } else {
        // Không khẳng định mã PIN/mật khẩu được hỗ trợ trên mọi thiết bị.
        setLabel('phương thức xác thực của thiết bị');
      }

      const result = await biometric.simplePrompt({
        promptMessage: 'Xác thực để mở ShopAI',
        cancelButtonText: 'Hủy',
      });

      if (result.success) {
        authenticated = true;
      } else {
        setFailed(true);
      }
    } catch (error) {
      console.warn('[biometric] Xác thực thất bại:', error);
      setFailed(true);
    } finally {
      authenticationInProgress.current = false;
      setChecking(false);
    }

    // Chỉ mở khóa sau khi xác thực báo thành công.
    if (authenticated) {
      onUnlock();
    }
  }, [onUnlock]);

  useEffect(() => {
    authenticate().catch((error: unknown) => {
      console.warn('[biometric] Không thể bắt đầu xác thực:', error);
      setFailed(true);
      setChecking(false);
    });
  }, [authenticate]);

  const handleLogout = useCallback(async () => {
    if (logoutInProgress.current) {
      return;
    }

    logoutInProgress.current = true;

    try {
      await logout();
      // App.tsx sẽ cập nhật luồng hiển thị khi token được xóa.
    } catch (error) {
      console.warn('[biometric] Không thể đăng xuất:', error);

      Alert.alert(
        'Không thể đăng xuất',
        'Không thể xác nhận đã xóa thông tin đăng nhập an toàn. Vui lòng thử lại.',
      );
    } finally {
      logoutInProgress.current = false;
    }
  }, [logout]);

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

      <Text style={styles.title}>ShopAI đang khóa</Text>

      <Text style={styles.hint}>
        {failed
          ? `Xác thực bằng ${label} chưa thành công. Hãy thử lại hoặc đăng xuất để đăng nhập lại.`
          : `Hãy xác thực bằng ${label} để tiếp tục.`}
      </Text>

      <ShopButton
        title="Thử lại"
        onPress={authenticate}
        isLoading={checking}
        style={styles.button}
      />

      <ShopButton
        title="Đăng xuất và đăng nhập lại"
        onPress={handleLogout}
        variant="outline"
        style={styles.button}
      />
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
    backgroundColor: COLORS.background,
  },
  icon: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    color: COLORS.textLight,
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 20,
  },
  button: {
    width: 240,
    marginBottom: 12,
  },
});

export default BiometricGateScreen;
