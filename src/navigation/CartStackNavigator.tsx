// src/navigation/CartStackNavigator.tsx
// Chương 5 & 6: Stack Navigator cho nhánh Giỏ hàng và Thanh toán

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CartScreen from '@screens/CartScreen';
import CheckoutScreen from '@screens/CheckoutScreen';
import OrdersScreen from '@screens/OrdersScreen';
import OrderDetailScreen from '@screens/OrderDetailScreen';
import ProductDetailScreen from '@screens/ProductDetailScreen';
import { COLORS } from '@constants/theme';

export type CartStackParamList = {
  CartMain: undefined;
  Checkout: undefined;
  Orders: undefined;
  OrderDetail: { orderId: string };
  ProductDetail: { productId: string };
};

const Stack = createNativeStackNavigator<CartStackParamList>();

interface CartStackNavigatorProps {
  onGoShopping?: () => void;
}

const CartStackNavigator: React.FC<CartStackNavigatorProps> = ({ onGoShopping }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="CartMain" options={{ headerShown: false }}>
        {() => <CartScreen onGoShopping={onGoShopping} />}
      </Stack.Screen>

      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          title: 'Thanh toán & Giao hàng',
          presentation: 'modal',
          headerBackTitle: 'Giỏ hàng',
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
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{
          title: 'Chi tiết đơn hàng',
          headerBackTitle: 'Đơn hàng',
        }}
      />

      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          title: 'Chi tiết sản phẩm',
          headerBackTitle: 'Quay lại',
        }}
      />
    </Stack.Navigator>
  );
};

export default CartStackNavigator;
