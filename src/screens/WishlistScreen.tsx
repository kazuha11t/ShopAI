// src/screens/WishlistScreen.tsx
// Chương 6.10: Màn hình danh sách sản phẩm yêu thích (Wishlist)

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import ProductCard from '@components/ProductCard';
import { MOCK_PRODUCTS } from '@data/mockProducts';
import { useWishlistStore } from '@store/useWishlistStore';
import { COLORS, SIZES } from '@constants/theme';

const WishlistScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const productIds = useWishlistStore((state) => state.productIds);
  const items = MOCK_PRODUCTS.filter((p) => productIds.includes(p.id));

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>💔</Text>
          <Text style={styles.emptyTitle}>Bạn chưa thích sản phẩm nào</Text>
          <Text style={styles.emptySubtitle}>
            Nhấn biểu tượng trái tim trên sản phẩm để lưu vào danh sách yêu thích.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <FlashList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <Pressable
            style={styles.productPressable}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
          >
            <ProductCard product={item} index={index} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SIZES.sm,
  },
  productPressable: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 1.5,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SIZES.md,
  },
  emptyTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.xs,
  },
  emptySubtitle: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default WishlistScreen;
