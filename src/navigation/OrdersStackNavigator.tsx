import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OrdersScreen from '@screens/OrdersScreen';
import OrderDetailScreen from '@screens/OrderDetailScreen';
import { useTheme } from '@contexts/ThemeContext';
const Stack = createNativeStackNavigator();
export default function OrdersStackNavigator() {
  const { colors } = useTheme();
  return <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text }}>
    <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: 'Đơn hàng' }} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Chi tiết hóa đơn' }} />
  </Stack.Navigator>;
}
