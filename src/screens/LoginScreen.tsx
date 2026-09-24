// src/screens/LoginScreen.tsx
// Chương 5: Màn hình Đăng nhập (AuthStack) có Form Validation + Loading State

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import ShopButton from '@components/ShopButton';
import ShopInput from '@components/ui/ShopInput';
import { COLORS, SIZES } from '@constants/theme';
import { loginSchema, extractFieldErrors } from '@utils/validation';

interface LoginScreenProps {
  onLogin: (token: string) => void;
  onGoRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoRegister }) => {
  const [email, setEmail] = useState('demo@shopai.com');
  const [password, setPassword] = useState('123456');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    // Chương 6.7: Validate bằng Zod thay vì if/else thủ công
    const result = extractFieldErrors(loginSchema, { email, password });
    if (!result.success) {
      setErrors(result.errors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleLogin = () => {
    if (!validate()) return;
    setLoading(true);
    // Giả lập gọi API đăng nhập
    setTimeout(() => {
      setLoading(false);
      onLogin('mock_jwt_token_shopai_123456');
    }, 1000);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.brandContainer}>
          <Text style={styles.logoBadge}>🛍️</Text>
          <Text style={styles.title}>ShopAI</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục trải nghiệm</Text>
        </View>

        <View style={styles.formCard}>
          <ShopInput
            label="Email đăng nhập"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <ShopInput
            label="Mật khẩu"
            placeholder="Tối thiểu 6 ký tự"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry
          />

          <ShopButton
            title="Đăng nhập ngay"
            onPress={handleLogin}
            isLoading={loading}
            style={styles.loginBtn}
          />
        </View>

        <Pressable onPress={onGoRegister} style={styles.registerLink}>
          <Text style={styles.registerLinkText}>
            Chưa có tài khoản? <Text style={styles.registerLinkBold}>Đăng ký ngay</Text>
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  logoBadge: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.body1,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  loginBtn: {
    marginTop: SIZES.sm,
  },
  registerLink: {
    marginTop: SIZES.xl,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
  },
  registerLinkBold: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default LoginScreen;
