// src/screens/CheckoutScreen.tsx
// Chương 6: Màn hình Đặt hàng & Xác nhận thanh toán

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '@constants/theme';
import ShopButton from '@components/ShopButton';
import ShopInput from '@components/ui/ShopInput';
import { useCartStore } from '@store/useCartStore';
import { useOrderStore } from '@store/useOrderStore';
import { useLocation } from '@hooks/useLocation';
import { checkoutSchema, extractFieldErrors } from '@utils/validation';
import { applyVoucherCode, VoucherResult } from '@constants/vouchers';

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const rawTotal = useCartStore((state) => state.totalPrice());
  const createOrder = useOrderStore((state) => state.createOrder);

  const { distanceKm, shippingFee, error: locationError } = useLocation();

  const [name, setName] = useState('Nguyễn Văn Khách');
  const [phone, setPhone] = useState('0987654321');
  const [address, setAddress] = useState('Số 123 Đường Cầu Giấy, Hà Nội');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Chương 6.10: Voucher giảm giá
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherResult, setVoucherResult] = useState<VoucherResult | null>(null);

  const handleApplyVoucher = () => {
    const result = applyVoucherCode(voucherInput, rawTotal, shippingFee);
    setVoucherResult(result);
  };

  const itemDiscount = voucherResult?.itemDiscount ?? 0;
  const shippingDiscount = voucherResult?.shippingDiscount ?? 0;
  const finalShippingFee = Math.max(shippingFee - shippingDiscount, 0);
  const grandTotal = Math.max(rawTotal - itemDiscount + finalShippingFee, 0);

  const money = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const formattedSubtotal = money(rawTotal);
  const formattedShipping = money(finalShippingFee);
  const formattedGrandTotal = money(grandTotal);

  const handleConfirmOrder = () => {
    // Chương 6.7: Validate form giao hàng bằng Zod
    const result = extractFieldErrors(checkoutSchema, { name, phone, address });
    if (!result.success) {
      setErrors(result.errors);
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin giao hàng');
      return;
    }
    setErrors({});

    setSubmitting(true);
    // Haptic feedback khi đặt hàng thành công (Chương 7)
    Vibration.vibrate([0, 50, 50, 50]);

    setTimeout(() => {
      const orderId = createOrder({
        items,
        totalAmount: grandTotal,
        shippingFee: finalShippingFee,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
      });

      clearCart();
      setSubmitting(false);

      Alert.alert(
        'Đặt hàng thành công! 🎉',
        `Mã đơn hàng của bạn là #${orderId}. Đơn đang ở trạng thái PENDING.`,
        [
          {
            text: 'Xem chi tiết đơn',
            onPress: () => {
              navigation.replace('OrderDetail', { orderId });
            },
          },
          {
            text: 'Về trang chủ',
            onPress: () => {
              navigation.navigate('HomeTab');
            },
          },
        ],
      );
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Khối thông tin người nhận */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📍 Địa chỉ nhận hàng</Text>
          <ShopInput
            label="Họ tên người nhận"
            value={name}
            onChangeText={setName}
            placeholder="Tên người nhận"
            error={errors.name}
          />
          <ShopInput
            label="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            placeholder="Số điện thoại"
            keyboardType="phone-pad"
            error={errors.phone}
          />
          <ShopInput
            label="Địa chỉ chi tiết"
            value={address}
            onChangeText={setAddress}
            placeholder="Số nhà, đường, phường/xã..."
            error={errors.address}
          />
        </View>

        {/* Khối Voucher giảm giá (Chương 6.10) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🎟️ Mã giảm giá</Text>
          <View style={styles.voucherRow}>
            <View style={styles.voucherInputWrapper}>
              <ShopInput
                label=""
                value={voucherInput}
                onChangeText={(t) => setVoucherInput(t.toUpperCase())}
                placeholder="Nhập mã (vd: SALE10)"
                autoCapitalize="characters"
              />
            </View>
            <ShopButton title="Áp dụng" onPress={handleApplyVoucher} variant="outline" style={styles.voucherBtn} />
          </View>
          {voucherResult?.error && <Text style={styles.voucherError}>{voucherResult.error}</Text>}
          {voucherResult?.voucher && (
            <Text style={styles.voucherSuccess}>✅ Đã áp dụng: {voucherResult.voucher.label}</Text>
          )}
        </View>

        {/* Khối khoảng cách & phí vận chuyển theo GPS */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🚚 Vận chuyển (GPS Smart Delivery)</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kho xuất hàng:</Text>
            <Text style={styles.infoValue}>Kho Tổng Hà Nội</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Khoảng cách ước tính:</Text>
            <Text style={styles.infoValue}>{locationError ? 'Chưa xác định' : `~${distanceKm} km`}</Text>
          </View>
          {locationError && (
            <Text style={styles.locationWarning}>
              ⚠️ {locationError.message} Phí vận chuyển đang được tạm tính theo mức mặc định.
            </Text>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thời gian dự kiến:</Text>
            <Text style={styles.infoValue}>1 - 2 ngày làm việc</Text>
          </View>
        </View>

        {/* Khối tóm tắt đơn hàng */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🧾 Tóm tắt thanh toán</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tiền hàng ({items.length} món):</Text>
            <Text style={styles.infoValue}>{formattedSubtotal}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phí giao hàng:</Text>
            <Text style={styles.infoValue}>{formattedShipping}</Text>
          </View>
          {itemDiscount > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Giảm giá voucher:</Text>
              <Text style={styles.discountValue}>-{money(itemDiscount)}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.grandLabel}>Tổng thanh toán:</Text>
            <Text style={styles.grandValue}>{formattedGrandTotal}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <ShopButton
          title={submitting ? 'Đang tạo đơn hàng...' : 'Xác nhận Đặt Hàng'}
          onPress={handleConfirmOrder}
          isLoading={submitting}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  locationWarning: {
    fontSize: 12,
    color: '#AD4E00',
    backgroundColor: '#FFF8E6',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SIZES.padding,
    paddingBottom: 24,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
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
  discountValue: {
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.success,
  },
  voucherRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  voucherInputWrapper: {
    flex: 1,
  },
  voucherBtn: {
    marginTop: 0,
    height: SIZES.inputHeight,
  },
  voucherError: {
    fontSize: SIZES.caption,
    color: COLORS.error,
    marginTop: -8,
  },
  voucherSuccess: {
    fontSize: SIZES.caption,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: -8,
  },
  bottomBar: {
    backgroundColor: COLORS.surface,
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    elevation: 8,
  },
});

export default CheckoutScreen;
