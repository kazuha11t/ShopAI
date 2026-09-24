// App.tsx
// Chương 5 & 6: State Machine Điều hướng bảo mật + Deep Linking + Redux Toolkit & React Query Provider

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@contexts/ThemeContext';
import { store } from '@store/redux/store';
import LoginScreen from '@screens/LoginScreen';
import RegisterScreen from '@screens/RegisterScreen';
import MainTabNavigator from '@navigation/MainTabNavigator';

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
  // Quản lý Token Đăng nhập (State Machine)
  // Khi userToken == null -> Không thể nào truy cập vào MainTabNavigator (Chống rò rỉ bảo mật)
  const [userToken, setUserToken] = useState<string | null>(null);

  const handleLogin = (token: string) => {
    setUserToken(token);
  };

  const handleLogout = () => {
    setUserToken(null);
  };

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <StatusBar barStyle="dark-content" />
            <NavigationContainer linking={linking}>
              {userToken == null ? (
                // ================= LUỒNG AUTH =================
                // Người dùng chưa đăng nhập chỉ được xem Login và Register
                <AuthStack.Navigator screenOptions={{ headerShown: false }}>
                  <AuthStack.Screen name="Login">
                    {({ navigation }) => (
                      <LoginScreen
                        onLogin={handleLogin}
                        onGoRegister={() => navigation.navigate('Register')}
                      />
                    )}
                  </AuthStack.Screen>

                  <AuthStack.Screen name="Register">
                    {({ navigation }) => (
                      <RegisterScreen
                        onRegistered={handleLogin}
                        onGoLogin={() => navigation.navigate('Login')}
                      />
                    )}
                  </AuthStack.Screen>
                </AuthStack.Navigator>
              ) : (
                // ================= LUỒNG CHÍNH =================
                // Người dùng đã có Token -> Cây điều hướng Bottom Tab được kích hoạt
                <MainTabNavigator onLogout={handleLogout} />
              )}
            </NavigationContainer>
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}

export default App;
