// src/screens/OrdersScreen.tsx
// Chương 6: Quản lý lịch sử đơn hàng đã đặt (PENDING / PAID)

import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '@constants/theme';
import { useOrderStore, Order } from '@store/useOrderStore';

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const orders = useOrderStore((state) => state.orders);

  const renderOrderItem = ({ item }: { item: Order }) => {
    const formattedTotal = new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(item.totalAmount);

    const isPaid = item.status === 'PAID';

    return (
      <Pressable
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>#{item.id}</Text>
          <View
            style={[
              styles.statusBadge,
              isPaid ? styles.paidBadge : styles.pendingBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isPaid ? styles.paidText : styles.pendingText,
              ]}
            >
              {isPaid ? 'ĐÃ THANH TOÁN (PAID)' : 'CHỜ THANH TOÁN (PENDING)'}
            </Text>
          </View>
        </View>

        <Text style={styles.orderDate}>Ngày đặt: {item.createdAt}</Text>
        <Text style={styles.itemCount}>
          {item.items.length} món • Người nhận: {item.customerName}
        </Text>

        <View style={styles.cardFooter}>
          <Text style={styles.totalLabel}>Tổng đơn:</Text>
          <Text style={styles.totalValue}>{formattedTotal}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📦</Text>
          <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
          <Text style={styles.emptySubtitle}>
            Các đơn hàng bạn đã đặt sẽ xuất hiện tại đây để bạn tiện theo dõi trạng thái.
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SIZES.padding,
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingBadge: {
    backgroundColor: '#FFF7E6',
    borderWidth: 1,
    borderColor: '#FFE58F',
  },
  paidBadge: {
    backgroundColor: '#F6FFED',
    borderWidth: 1,
    borderColor: '#B7EB8F',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  pendingText: {
    color: '#D48806',
  },
  paidText: {
    color: '#389E0D',
  },
  orderDate: {
    fontSize: SIZES.caption,
    color: COLORS.textLight,
  },
  itemCount: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    marginVertical: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default OrdersScreen;
