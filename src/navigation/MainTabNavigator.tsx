// src/navigation/MainTabNavigator.tsx
// Chương 5 & 6: Bottom Tab Navigator chứa HomeStack + CartStack + Huy hiệu giỏ hàng động (Zustand)

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStackNavigator from '@navigation/HomeStackNavigator';
import CartStackNavigator from '@navigation/CartStackNavigator';
import { useCartStore } from '@store/useCartStore';
import { COLORS } from '@constants/theme';

const Tab = createBottomTabNavigator();

interface MainTabNavigatorProps {
  onLogout: () => void;
}

const renderHomeIcon = ({ focused }: { focused: boolean }) => (
  <Text style={focused ? styles.iconFocused : styles.iconNormal}>🏠</Text>
);

const renderCartIcon = ({ focused }: { focused: boolean }) => (
  <Text style={focused ? styles.iconFocused : styles.iconNormal}>🛒</Text>
);

const MainTabNavigator: React.FC<MainTabNavigatorProps> = ({ onLogout }) => {
  // Lấy số lượng sản phẩm động từ Zustand Store (Chương 6)
  const cartBadgeCount = useCartStore((state) => state.totalCount());

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: styles.tabBar,
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
    height: 60,
    paddingBottom: 8,
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
  iconFocused: {
    fontSize: 22,
  },
  iconNormal: {
    fontSize: 20,
  },
});

export default MainTabNavigator;
