
import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import {
  NavigationContainer,
  LinkingOptions,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import {
  QueryClientProvider,
} from '@tanstack/react-query';

import { ThemeProvider, useTheme } from '@contexts/ThemeContext';
import { store } from '@store/redux/store';
import './src/i18n';

import LoginScreen from '@screens/LoginScreen';
import RegisterScreen from '@screens/RegisterScreen';
import MainDrawerNavigator from '@navigation/MainDrawerNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BiometricGateScreen from '@screens/BiometricGateScreen';

import { useAuthStore } from '@store/useAuthStore';
import { useAppLock } from '@hooks/useAppLock';
import { COLORS } from '@constants/theme';
import { queryClient } from '@services/queryClient';

const AuthStack = createNativeStackNavigator();

// Giữ cấu hình Deep Linking hiện tại.
const linking: LinkingOptions<any> = {
  prefixes: ['shopai://'],
  config: { screens: { Shop: { screens: {
    HomeTab: { screens: { Home: '', ProductDetail: 'product/:productId' } },
    CartTab: { screens: { CartMain: 'cart', Checkout: 'checkout' } },
    OrdersTab: { screens: { Orders: 'orders', OrderDetail: 'orders/:orderId' } },
  } }, Categories: 'categories' } },
};

function ThemedNavigation({ children }: React.PropsWithChildren) {
  const { isDark } = useTheme();
  return <NavigationContainer linking={linking} theme={isDark ? DarkTheme : DefaultTheme}>
    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
    {children}
  </NavigationContainer>;
}

function App(): React.JSX.Element {
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isUnlocked = useAuthStore((state) => state.isUnlocked);

  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const checkLocalToken = useAuthStore(
    (state) => state.checkLocalToken,
  );
  const setIsUnlocked = useAuthStore(
    (state) => state.setIsUnlocked,
  );

  // Khôi phục phiên đăng nhập từ Keychain khi ứng dụng khởi động.
  useEffect(() => {
    checkLocalToken().catch((error: unknown) => {
      console.warn('[auth] Khôi phục phiên đăng nhập thất bại:', error);
    });
  }, [checkLocalToken]);

  // Tự khóa khi ứng dụng ở nền quá thời gian quy định.
  useAppLock({
    isUnlocked,
    setIsUnlocked,
  });

  // Giữ callback ổn định giữa các lần render.
  const handleUnlock = useCallback(() => {
    setIsUnlocked(true);
  }, [setIsUnlocked]);

  // Xử lý lỗi nếu không thể xóa thông tin đăng nhập an toàn.
  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('[auth] Đăng xuất thất bại:', error);

      Alert.alert(
        'Đăng xuất thất bại',
        'Không thể xác nhận đã xóa thông tin đăng nhập an toàn. Vui lòng thử lại.',
      );
    }
  }, [logout]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
          />
        </View>
      );
    }

    // Có token nhưng chưa xác thực sinh trắc học.
    if (token !== null && !isUnlocked) {
      return <BiometricGateScreen onUnlock={handleUnlock} />;
    }

    return (
      <ThemedNavigation>
        {token === null ? (
          <AuthStack.Navigator
            screenOptions={{ headerShown: false }}
          >
            <AuthStack.Screen name="Login">
              {({ navigation }) => (
                <LoginScreen
                  onLogin={login}
                  onGoRegister={() =>
                    navigation.navigate('Register')
                  }
                />
              )}
            </AuthStack.Screen>

            <AuthStack.Screen name="Register">
              {({ navigation }) => (
                <RegisterScreen
                  onRegistered={login}
                  onGoLogin={() =>
                    navigation.navigate('Login')
                  }
                />
              )}
            </AuthStack.Screen>
          </AuthStack.Navigator>
        ) : (
          <MainDrawerNavigator onLogout={handleLogout} />
        )}
      </ThemedNavigation>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ReduxProvider store={store}>
            <ThemeProvider>
              {renderContent()}
            </ThemeProvider>
          </ReduxProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
