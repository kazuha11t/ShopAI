// src/components/ProductCard.tsx
// Chương 4: UI/UX Component hiển thị Card sản phẩm cho Grid 2 cột

import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { COLORS, SIZES } from '@constants/theme';
import { Product } from '@data/mockProducts';
import { useWishlistStore } from '@store/useWishlistStore';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(product.id));
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(product.price);

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: product.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <Pressable
        style={styles.wishlistBtn}
        hitSlop={8}
        onPress={() => toggleWishlist(product.id)}
      >
        <Text style={styles.wishlistIcon}>{isWishlisted ? '❤️' : '🤍'}</Text>
      </Pressable>
      <View style={styles.info}>
        {product.category && (
          <Text style={styles.category}>{product.category}</Text>
        )}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>{formattedPrice}</Text>
          {product.rating && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {product.rating}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    margin: SIZES.xs,
    flex: 1,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#ECECEC',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wishlistIcon: {
    fontSize: 14,
  },
  info: {
    padding: SIZES.sm,
  },
  category: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  name: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
    minHeight: 36,
  },
  footer: {
    marginTop: SIZES.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  ratingBadge: {
    backgroundColor: '#FFF7E6',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 10,
    color: '#D48806',
    fontWeight: '600',
  },
});

export default ProductCard;
