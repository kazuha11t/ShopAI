import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTheme } from '@contexts/ThemeContext';
import MainTabNavigator from './MainTabNavigator';
import CatalogSectionsScreen from '@screens/CatalogSectionsScreen';
import UpdatesScreen from '@screens/UpdatesScreen';
const Drawer = createDrawerNavigator();
export default function MainDrawerNavigator({ onLogout }: { onLogout: () => void }) {
  const { colors } = useTheme();
  return <Drawer.Navigator screenOptions={{
    headerStyle: { backgroundColor: colors.surface }, headerTintColor: colors.text,
    drawerStyle: { backgroundColor: colors.surface }, drawerInactiveTintColor: colors.text,
  }}>
    <Drawer.Screen name="Shop" options={{ title: 'ShopAI' }}>
      {() => <MainTabNavigator onLogout={onLogout} />}
    </Drawer.Screen>
    <Drawer.Screen name="Categories" component={CatalogSectionsScreen} options={{ title: 'Danh mục sản phẩm' }} />
    <Drawer.Screen name="Updates" component={UpdatesScreen} options={{ title: 'Cập nhật ứng dụng' }} />
  </Drawer.Navigator>;
}
