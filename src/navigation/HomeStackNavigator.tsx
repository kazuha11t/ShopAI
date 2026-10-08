// src/navigation/HomeStackNavigator.tsx
// Chương 5, 6, 7, 8: Stack Navigator cho nhánh Trang chủ (Home -> ProductDetail, Scanner, Orders, AIChat)

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@screens/HomeScreen';
import ProductDetailScreen from '@screens/ProductDetailScreen';
import ScannerScreen from '@screens/ScannerScreen';
import OrdersScreen from '@screens/OrdersScreen';
import OrderDetailScreen from '@screens/OrderDetailScreen';
import ReduxCartDemoScreen from '@screens/ReduxCartDemoScreen';
import ReactQueryDemoScreen from '@screens/ReactQueryDemoScreen';
import WishlistScreen from '@screens/WishlistScreen';
import AIChatScreen from '@screens/AIChatScreen';
import { COLORS } from '@constants/theme';

export type HomeStackParamList = {
  Home: undefined;
  ProductDetail: { productId: string };
  ReactQueryDemo: undefined;
  Scanner: undefined;
  Orders: undefined;
  OrderDetail: { orderId: string };
  ReduxCartDemo: undefined;
  Wishlist: undefined;
  AIChat: undefined;
};
const Stack = createNativeStackNavigator<HomeStackParamList>();

interface HomeStackNavigatorProps {
  onLogout: () => void;
}

const HomeStackNavigator: React.FC<HomeStackNavigatorProps> = ({ onLogout }) => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
<Stack.Screen
  name="ReactQueryDemo"
  component={ReactQueryDemoScreen}
  options={{
    title: 'React Query Demo',
    headerBackTitle: 'Trang chủ',
  }}
/>
      <Stack.Screen name="Home" options={{ headerShown: false }}>
        {() => <HomeScreen onLogout={onLogout} />}
      </Stack.Screen>

      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          title: 'Chi tiết sản phẩm',
          headerBackTitle: 'Quay lại',
        }}
      />

      <Stack.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          title: 'Quét mã vạch / QR',
          headerBackTitle: 'Trang chủ',
        }}
      />

      <Stack.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: 'Lịch sử đơn hàng',
          headerBackTitle: 'Quay lại',
        }}
      />
      <Stack.Screen
        name="ReduxCartDemo"
        component={ReduxCartDemoScreen}
        options={{
          title: 'Redux Toolkit Demo',
          headerBackTitle: 'Trang chủ',
        }}
      />

      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{
          title: 'Chi tiết đơn hàng',
          headerBackTitle: 'Đơn hàng',
        }}
      />

      <Stack.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          title: 'Sản phẩm yêu thích',
          headerBackTitle: 'Trang chủ',
        }}
      />

      {/* Chương 8: Nhân viên tư vấn AI — sibling với Scanner trong HomeStack */}
      <Stack.Screen
        name="AIChat"
        component={AIChatScreen}
        options={{
          title: 'Tư vấn AI',
          headerBackTitle: 'Trang chủ',
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
