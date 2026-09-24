// src/screens/HomeScreen.tsx
// Chương 4, 5, 6 & 7: Màn hình chính ShopAI với FlashList 2 cột, Location GPS Badge, Scanner Button

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import ProductCard from '@components/ProductCard';
import ShopButton from '@components/ShopButton';
import LocationBadge from '@components/LocationBadge';
import { MOCK_PRODUCTS, Product } from '@data/mockProducts';
import { COLORS, SIZES } from '@constants/theme';
import type { HomeStackParamList } from '@navigation/HomeStackNavigator';

type HomeNavProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

interface HomeScreenProps {
  onLogout: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout }) => {
  const navigation = useNavigation<HomeNavProp>();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh (Chương 4)
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      // Giả lập làm mới danh sách
      setProducts([...MOCK_PRODUCTS]);
      setRefreshing(false);
    }, 1000);
  };

  const handleProductPress = (productId: string) => {
    // Chỉ gửi duy nhất ID qua params (Chương 5.3)
    navigation.navigate('ProductDetail', { productId });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Header với thương hiệu, nút Quét mã và nút Đăng xuất */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLogo}>ShopAI</Text>
            <Text style={styles.headerSub}>Khám phá công nghệ & xu hướng</Text>
          </View>
          <View style={styles.headerActions}>
  <ShopButton
    title="Quét mã 📷"
    onPress={() => navigation.navigate('Scanner')}
    style={styles.scanBtn}
    variant="outline"
  />

  <ShopButton
    title="Redux"
    onPress={() => navigation.navigate('ReduxCartDemo')}
    style={styles.reduxBtn}
    variant="outline"
  />
<ShopButton
  title="React Query"
  onPress={() => navigation.navigate('ReactQueryDemo')}
  style={styles.reduxBtn}
  variant="outline"
/>

  <ShopButton
    title="Thoát"
    onPress={onLogout}
    style={styles.logoutBtn}
    variant="outline"
  />
</View>
        </View>

        {/* Widget GPS Geolocation tính phí vận chuyển tự động (Chương 7) */}
        <LocationBadge />

        {/* Banner khuyến mãi */}
        <View style={styles.banner}>
          <Text style={styles.bannerBadge}>HOT DEAL 🔥</Text>
          <Text style={styles.bannerTitle}>Siêu Hội Mua Sắm ShopAI</Text>
          <Text style={styles.bannerSub}>Giảm đến 50% cho thành viên mới</Text>
        </View>

        {/* Danh sách sản phẩm 2 cột bằng FlashList (Chương 4) */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Sản phẩm nổi bật ({products.length})</Text>
          <FlashList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.productPressable}
                onPress={() => handleProductPress(item.id)}
              >
                <ProductCard product={item} />
              </Pressable>
            )}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
              />
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.sm,
  },
  headerLogo: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  headerSub: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanBtn: {
    height: 34,
    paddingHorizontal: 10,
  },
reduxBtn: {
  height: 34,
  paddingHorizontal: 10,
},
  logoutBtn: {
    height: 34,
    paddingHorizontal: 10,
  },
  banner: {
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    padding: SIZES.padding,
    backgroundColor: '#1A1A2E',
    borderRadius: SIZES.radius,
  },
  bannerBadge: {
    color: '#FFD700',
    fontWeight: '800',
    fontSize: 12,
    marginBottom: 4,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bannerSub: {
    color: '#B0B0C0',
    fontSize: 13,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: SIZES.sm,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: SIZES.sm,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  productPressable: {
    flex: 1,
  },
});

export default HomeScreen;
