// src/screens/ProductDetailScreen.tsx
// Chương 5, 6 & 7: Chi tiết sản phẩm, Thêm vào Giỏ hàng (Zustand) & Phản hồi rung (Vibration Haptic)

import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Alert, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import ShopButton from '@components/ShopButton';
import { MOCK_PRODUCTS } from '@data/mockProducts';
import { COLORS, SIZES } from '@constants/theme';
import { useCartStore } from '@store/useCartStore';
import type { HomeStackParamList } from '@navigation/HomeStackNavigator';

type ProductDetailRouteProp = RouteProp<HomeStackParamList, 'ProductDetail'>;

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation();
  const { productId } = route.params;

  const addItem = useCartStore((state) => state.addItem);

  // Lấy dữ liệu sản phẩm dựa trên ID truyền qua params
  const product = MOCK_PRODUCTS.find((p) => p.id === productId);

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundEmoji}>🔍</Text>
          <Text style={styles.notFound}>Không tìm thấy sản phẩm #{productId}</Text>
          <ShopButton
            title="Quay lại"
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(product.price);

  const handleAddToCart = () => {
    // Phản hồi rung nhẹ Native Hardware (Chương 7.6)
    Vibration.vibrate(35);
    // Lưu vào Giỏ hàng Zustand (Chương 6.3)
    addItem(product);
    Alert.alert('Thành công 🎉', `Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />

        <View style={styles.content}>
          {product.category && <Text style={styles.category}>{product.category}</Text>}
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.price}>{formattedPrice}</Text>
            {product.rating && (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>⭐ {product.rating} / 5.0</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>
            {product.description ||
              'Sản phẩm chính hãng chất lượng cao từ đối tác phân phối của ShopAI. Đổi trả dễ dàng trong vòng 7 ngày nếu có lỗi do nhà sản xuất.'}
          </Text>

          <Text style={styles.idNote}>Mã định danh (SKU): #{product.id}</Text>
        </View>
      </ScrollView>

      {/* Thanh nút mua hàng cố định ở dưới */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Giá bán lẻ</Text>
          <Text style={styles.bottomPrice}>{formattedPrice}</Text>
        </View>
        <ShopButton
          title="Thêm vào giỏ"
          onPress={handleAddToCart}
          style={styles.buyBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  container: {
    paddingBottom: 20,
  },
  image: {
    width: '100%',
    height: 350,
    backgroundColor: '#EAEAEA',
  },
  content: {
    padding: SIZES.padding,
  },
  category: {
    fontSize: SIZES.body2,
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  ratingBadge: {
    backgroundColor: '#FFFBE6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFE58F',
  },
  ratingText: {
    fontSize: SIZES.body2,
    color: '#D48806',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: SIZES.body1,
    color: '#4A4A4A',
    lineHeight: 24,
    marginBottom: 16,
  },
  idNote: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
  },
  bottomPrice: {
    fontSize: SIZES.h2,
    fontWeight: '800',
    color: COLORS.primary,
  },
  buyBtn: {
    flex: 1,
    marginLeft: 16,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  notFoundEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  notFound: {
    fontSize: SIZES.body1,
    color: COLORS.error,
    textAlign: 'center',
  },
  backBtn: {
    marginTop: SIZES.md,
    minWidth: 140,
  },
});

export default ProductDetailScreen;
