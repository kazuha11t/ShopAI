// src/screens/OrderDetailScreen.tsx
// Chương 6: Chi tiết đơn hàng + Nút thanh toán giả lập PENDING -> PAID

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '@constants/theme';
import ShopButton from '@components/ShopButton';
import { useOrderStore } from '@store/useOrderStore';

type OrderDetailParams = {
  OrderDetail: { orderId: string };
};

const OrderDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<OrderDetailParams, 'OrderDetail'>>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params;

  const order = useOrderStore((state) => state.getOrderById(orderId));
  const payOrder = useOrderStore((state) => state.payOrder);

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Không tìm thấy đơn hàng #{orderId}</Text>
          <ShopButton title="Quay lại" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const isPaid = order.status === 'PAID';

  const formattedTotal = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(order.totalAmount);

  const formattedShipping = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(order.shippingFee);

  const handlePayNow = () => {
    // Haptic feedback khi thanh toán thành công (Chương 7)
    Vibration.vibrate(50);
    payOrder(order.id);
    Alert.alert('Thanh toán thành công! ✅', 'Đơn hàng đã được chuyển sang trạng thái PAID.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Banner trạng thái đơn hàng */}
        <View style={[styles.statusBanner, isPaid ? styles.bannerPaid : styles.bannerPending]}>
          <Text style={styles.bannerIcon}>{isPaid ? '🎉' : '⏳'}</Text>
          <View>
            <Text style={styles.bannerTitle}>
              {isPaid ? 'Đơn hàng đã thanh toán' : 'Chờ khách hàng thanh toán'}
            </Text>
            <Text style={styles.bannerSub}>Mã đơn: #{order.id}</Text>
          </View>
        </View>

        {/* Thông tin nhận hàng */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Thông tin giao hàng</Text>
          <Text style={styles.textLine}>
            <Text style={styles.boldLabel}>Người nhận: </Text>
            {order.customerName} ({order.customerPhone})
          </Text>
          <Text style={styles.textLine}>
            <Text style={styles.boldLabel}>Địa chỉ: </Text>
            {order.customerAddress}
          </Text>
          <Text style={styles.textLine}>
            <Text style={styles.boldLabel}>Thời gian tạo: </Text>
            {order.createdAt}
          </Text>
        </View>

        {/* Danh sách các mặt hàng */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🛍️ Danh sách món ({order.items.length})</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Image source={{ uri: item.image }} style={styles.itemThumb} resizeMode="cover" />
              <View style={styles.itemMeta}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemQtyPrice}>
                  {item.quantity} x{' '}
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(item.price)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Chi tiết thanh toán */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💳 Tổng kết chi phí</Text>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Phí giao hàng GPS:</Text>
            <Text style={styles.feeValue}>{formattedShipping}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Trạng thái đơn:</Text>
            <Text
              style={[
                styles.feeValue,
                isPaid ? styles.paidFeeValue : styles.pendingFeeValue,
              ]}
            >
              {order.status}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.feeRow}>
            <Text style={styles.grandLabel}>Tổng thanh toán:</Text>
            <Text style={styles.grandValue}>{formattedTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {!isPaid && (
        <View style={styles.bottomBar}>
          <ShopButton
            title="Thanh toán ngay (Giả lập Bank/QR)"
            onPress={handlePayNow}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SIZES.padding,
    paddingBottom: 24,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.md,
  },
  bannerPending: {
    backgroundColor: '#FFF7E6',
    borderWidth: 1,
    borderColor: '#FFE58F',
  },
  bannerPaid: {
    backgroundColor: '#F6FFED',
    borderWidth: 1,
    borderColor: '#B7EB8F',
  },
  bannerIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  bannerSub: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  cardTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  textLine: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  boldLabel: {
    fontWeight: '700',
    color: COLORS.textLight,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  itemThumb: {
    width: 50,
    height: 50,
    borderRadius: SIZES.radiusSm,
    backgroundColor: '#F0F0F0',
  },
  itemMeta: {
    marginLeft: SIZES.md,
    flex: 1,
  },
  itemName: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemQtyPrice: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  feeLabel: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
  },
  feeValue: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
  },
  paidFeeValue: {
    color: '#389E0D',
  },
  pendingFeeValue: {
    color: '#D48806',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  grandLabel: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  grandValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bottomBar: {
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    elevation: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  errorText: {
    fontSize: SIZES.body1,
    color: COLORS.error,
    marginBottom: 16,
  },
});

export default OrderDetailScreen;
