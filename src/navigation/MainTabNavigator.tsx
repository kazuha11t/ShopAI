// src/navigation/MainTabNavigator.tsx
// Chương 5 & 6: Bottom Tab Navigator chứa HomeStack + CartStack + Huy hiệu giỏ hàng động (Zustand)

import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeStackNavigator from '@navigation/HomeStackNavigator';
import CartStackNavigator from '@navigation/CartStackNavigator';
import { useCartStore } from '@store/useCartStore';
import { COLORS } from '@constants/theme';

const Tab = createBottomTabNavigator();

interface MainTabNavigatorProps {
  onLogout: () => void;
}

// Chương 5.4.5: Icon thật bằng react-native-vector-icons (Ionicons) thay cho emoji
const renderHomeIcon = ({ focused, color }: { focused: boolean; color: string }) => (
  <Icon name={focused ? 'home' : 'home-outline'} size={22} color={color} />
);

const renderCartIcon = ({ focused, color }: { focused: boolean; color: string }) => (
  <Icon name={focused ? 'cart' : 'cart-outline'} size={22} color={color} />
);

const MainTabNavigator: React.FC<MainTabNavigatorProps> = ({ onLogout }) => {
  // Lấy số lượng sản phẩm động từ Zustand Store (Chương 6)
  const cartBadgeCount = useCartStore((state) => state.totalCount());
  // Edge-to-edge: cộng thêm chiều cao thanh điều hướng hệ thống để tab bar không bị đè
  const { bottom } = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: [styles.tabBar, { height: 60 + bottom, paddingBottom: 8 + bottom }],
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        options={{
          title: 'Trang chủ',
          tabBarIcon: renderHomeIcon,
        }}
      >
        {() => <HomeStackNavigator onLogout={onLogout} />}
      </Tab.Screen>

      <Tab.Screen
        name="CartTab"
        options={{
          title: 'Giỏ hàng',
          tabBarIcon: renderCartIcon,
          tabBarBadge: cartBadgeCount > 0 ? cartBadgeCount : undefined,
        }}
      >
        {({ navigation }) => (
          <CartStackNavigator
            onGoShopping={() => navigation.navigate('HomeTab')}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MainTabNavigator;
