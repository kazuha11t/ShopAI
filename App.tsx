// App.tsx
// Chương 5 & 6: State Machine Điều hướng bảo mật + Deep Linking + Redux Toolkit & React Query Provider
// Chương 8: Token trong Keystore (useAuthStore) + Cổng sinh trắc học + App Lock

import React, { useEffect } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@contexts/ThemeContext';
import { store } from '@store/redux/store';
import './src/i18n';
import LoginScreen from '@screens/LoginScreen';
import RegisterScreen from '@screens/RegisterScreen';
import MainTabNavigator from '@navigation/MainTabNavigator';
import BiometricGateScreen from '@screens/BiometricGateScreen';
import { useAuthStore } from '@store/useAuthStore';
import { useAppLock } from '@hooks/useAppLock';
import { COLORS } from '@constants/theme';

const queryClient = new QueryClient();
const AuthStack = createNativeStackNavigator();

// Cấu hình Deep Linking: shopai://product/1 -> tự động mở ProductDetail
const linking: LinkingOptions<any> = {
  prefixes: ['shopai://'],
  config: {
    screens: {
      HomeTab: {
        screens: {
          ProductDetail: 'product/:productId',
        },
      },
      CartTab: {
        screens: {
          CartMain: 'cart',
          Checkout: 'checkout',
          Orders: 'orders',
        },
      },
    },
  },
};

function App(): React.JSX.Element {
  // Selector riêng cho từng trường: App chỉ re-render khi đúng trường đó đổi
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isUnlocked = useAuthStore((state) => state.isUnlocked);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const checkLocalToken = useAuthStore((state) => state.checkLocalToken);
  const setIsUnlocked = useAuthStore((state) => state.setIsUnlocked);

  // Bước 3: móc token từ Keystore ngay khi App vừa khởi chạy
  useEffect(() => {
    checkLocalToken();
  }, [checkLocalToken]);

  // Bước 5b: tự khoá lại nếu App ở nền quá APP_LOCK_TIMEOUT_MS (Phần 8.12)
  useAppLock({ isUnlocked, setIsUnlocked });

  const renderContent = () => {
    // Đang lục Keystore -> vòng xoay Loading tràn màn hình
    if (isLoading) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    // Bước 5: CÓ token (đăng nhập từ trước) nhưng chưa vượt cổng -> chặn ở đây.
    // Chưa đăng nhập thì đi thẳng vào Login.
    if (token != null && !isUnlocked) {
      return <BiometricGateScreen onUnlock={() => setIsUnlocked(true)} />;
    }

    return (
      <NavigationContainer linking={linking}>
        {token == null ? (
          // ================= LUỒNG AUTH =================
          // Người dùng chưa đăng nhập chỉ được xem Login và Register
          <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login">
              {({ navigation }) => (
                <LoginScreen
                  onLogin={login}
                  onGoRegister={() => navigation.navigate('Register')}
                />
              )}
            </AuthStack.Screen>

            <AuthStack.Screen name="Register">
              {({ navigation }) => (
                <RegisterScreen
                  onRegistered={login}
                  onGoLogin={() => navigation.navigate('Login')}
                />
              )}
            </AuthStack.Screen>
          </AuthStack.Navigator>
        ) : (
          // ================= LUỒNG CHÍNH =================
          // Người dùng đã có Token -> Cây điều hướng Bottom Tab được kích hoạt
          <MainTabNavigator onLogout={logout} />
        )}
      </NavigationContainer>
    );
  };

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <StatusBar barStyle="dark-content" />
            {renderContent()}
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

export default App;
