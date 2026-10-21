import { useThemedStyles } from '@hooks/useThemedStyles';
// src/screens/CartScreen.tsx
// Chương 6: Màn hình Giỏ hàng đầy đủ - Zustand State, Thay đổi số lượng, Xóa, Đặt hàng

import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '@constants/theme';
import ShopButton from '@components/ShopButton';
import { useCartStore, CartItem } from '@store/useCartStore';

interface CartScreenProps {
  onGoShopping?: () => void;
}

const CartScreen: React.FC<CartScreenProps> = ({ onGoShopping }) => {
  const styles = useThemedStyles(baseStyles);
  const navigation = useNavigation<any>();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalPrice = useCartStore((state) => state.totalPrice());

  const formattedTotal = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(totalPrice);

  const handleUpdateQty = (id: string, delta: number) => {
    // Haptic feedback nhẹ khi bấm tăng giảm số lượng (Chương 7)
    Vibration.vibrate(25);
    updateQuantity(id, delta);
  };

  const handleRemove = (id: string) => {
    Vibration.vibrate(40);
    removeItem(id);
  };

  const handleCheckout = () => {
    Vibration.vibrate(35);
    navigation.navigate('Checkout');
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Giỏ hàng của bạn đang trống</Text>
          <Text style={styles.emptySubtitle}>
            Chưa có sản phẩm nào trong giỏ. Hãy dạo quanh cửa hàng và chọn cho mình món đồ ưng ý nhé!
          </Text>
          <ShopButton
            title="Khám phá ngay"
            onPress={onGoShopping || (() => navigation.navigate('HomeTab'))}
            style={styles.exploreBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const formattedPrice = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(item.price);

    return (
      <View style={styles.cartCard}>
        <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
        <View style={styles.itemDetails}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.name}
            </Text>
            <Pressable onPress={() => handleRemove(item.id)} hitSlop={8}>
              <Text style={styles.deleteIcon}>🗑️</Text>
            </Pressable>
          </View>

          <Text style={styles.itemPrice}>{formattedPrice}</Text>

          <View style={styles.quantityRow}>
            <Pressable
              style={styles.qtyBtn}
              onPress={() => handleUpdateQty(item.id, -1)}
            >
              <Text style={styles.qtyBtnText}>-</Text>
            </Pressable>
            <Text style={styles.qtyValue}>{item.quantity}</Text>
            <Pressable
              style={styles.qtyBtn}
              onPress={() => handleUpdateQty(item.id, 1)}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giỏ Hàng ({items.length})</Text>
        <Pressable onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.ordersLink}>Lịch sử đơn 📋</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footerBar}>
        <View style={styles.totalInfo}>
          <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
          <Text style={styles.totalAmount}>{formattedTotal}</Text>
        </View>
        <ShopButton
          title="Tiến hành Đặt hàng"
          onPress={handleCheckout}
          style={styles.checkoutBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const baseStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  ordersLink: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
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
    marginBottom: SIZES.xl,
  },
  exploreBtn: {
    minWidth: 180,
  },
  listContent: {
    padding: SIZES.padding,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.sm,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: SIZES.radiusSm,
    backgroundColor: '#F0F0F0',
  },
  itemDetails: {
    flex: 1,
    marginLeft: SIZES.md,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  deleteIcon: {
    fontSize: 16,
  },
  itemPrice: {
    fontSize: SIZES.body1,
    fontWeight: '700',
    color: COLORS.primary,
    marginVertical: 4,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  qtyValue: {
    marginHorizontal: 16,
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.text,
  },
  footerBar: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.padding,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    elevation: 10,
  },
  totalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: SIZES.body1,
    color: COLORS.textLight,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  checkoutBtn: {
    width: '100%',
  },
});

export default CartScreen;
