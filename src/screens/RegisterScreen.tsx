import { useThemedStyles } from '@hooks/useThemedStyles';
import { authenticate, apiErrorMessage } from '@services/api';

import React, { useState } from 'react';
import {
  Alert,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';

import ShopButton from '@components/ShopButton';
import ShopInput from '@components/ui/ShopInput';
import { COLORS, SIZES } from '@constants/theme';
import { registerSchema, extractFieldErrors } from '@utils/validation';

interface RegisterScreenProps {
  onRegistered: (token: string) => void | Promise<void>;
  onGoLogin: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegistered,
  onGoLogin,
}) => {
  const styles = useThemedStyles(baseStyles);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
  }>({});

  const [loading, setLoading] = useState(false);

  const validate = () => {
    const result = extractFieldErrors(registerSchema, {
      name,
      email,
      password,
      confirm,
    });

    if (!result.success) {
      setErrors(result.errors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleRegister = async () => {
    if (loading || !validate()) {
      return;
    }

    setLoading(true);

    try {
      const token = await authenticate('register', { email, password, name });
      await onRegistered(token);
    } catch (error) {
      console.warn('[register] Đăng ký thất bại');

      Alert.alert(
        'Đăng ký thất bại',
        apiErrorMessage(error),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>
          Đăng ký để nhận ưu đãi mua sắm trên ShopAI
        </Text>
      </View>

      <View style={styles.formCard}>
        <ShopInput
          label="Họ và tên"
          placeholder="Nguyễn Văn A"
          value={name}
          onChangeText={setName}
          error={errors.name}
        />

        <ShopInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <ShopInput
          label="Mật khẩu"
          placeholder="Ít nhất 6 ký tự"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
        />

        <ShopInput
          label="Xác nhận mật khẩu"
          placeholder="Nhập lại mật khẩu"
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          secureTextEntry
        />

        <ShopButton
          title="Đăng ký ngay"
          onPress={handleRegister}
          isLoading={loading}
          style={styles.submitBtn}
        />
      </View>

      <Pressable onPress={onGoLogin} style={styles.loginLink}>
        <Text style={styles.loginLinkText}>
          Đã có tài khoản?{' '}
          <Text style={styles.loginLinkBold}>Đăng nhập</Text>
        </Text>
      </Pressable>
    </ScrollView>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  submitBtn: {
    marginTop: SIZES.sm,
  },
  loginLink: {
    marginTop: SIZES.xl,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
  },
  loginLinkBold: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default RegisterScreen;
