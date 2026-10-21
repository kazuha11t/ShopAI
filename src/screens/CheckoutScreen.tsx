import { useThemedStyles } from '@hooks/useThemedStyles';
// src/screens/CheckoutScreen.tsx
// Chương 6: Màn hình Đặt hàng & Xác nhận thanh toán

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '@constants/theme';
import ShopButton from '@components/ShopButton';
import ShopInput from '@components/ui/ShopInput';
import { useCartStore } from '@store/useCartStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder, quoteOrder, apiErrorMessage } from '@services/api';
import { useLocation } from '@hooks/useLocation';
import { checkoutSchema, extractFieldErrors } from '@utils/validation';
import { applyVoucherCode, VoucherResult } from '@constants/vouchers';

const CheckoutScreen: React.FC = () => {
  const styles = useThemedStyles(baseStyles);
  const navigation = useNavigation<any>();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const rawTotal = useCartStore((state) => state.totalPrice());
  const client = useQueryClient();
  const mutation = useMutation({ mutationFn: createOrder });
  const request = useRef({ signature: '', id: '' });
  const inFlight = useRef(false);

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

  const quoteInput = { items: items.map(item => ({ productId: Number(item.id), quantity: item.quantity })), voucherCode: voucherResult?.voucher?.code };
  const quote = useQuery({ queryKey: ['checkout-quote', quoteInput], queryFn: () => quoteOrder(quoteInput), enabled: items.length > 0, staleTime: 0 });
  const itemDiscount = quote.data?.discount ?? 0;
  const finalShippingFee = quote.data?.shippingFee ?? 25000;
  const grandTotal = quote.data?.totalAmount ?? 0;

  const money = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const formattedSubtotal = money(quote.data?.subtotal ?? rawTotal);
  const formattedShipping = money(finalShippingFee);
  const formattedGrandTotal = money(grandTotal);

  const handleConfirmOrder = async () => {
    if (inFlight.current || !quote.data || quote.isFetching || quote.isError || !items.length) return;
    // Chương 6.7: Validate form giao hàng bằng Zod
    const result = extractFieldErrors(checkoutSchema, { name, phone, address });
    if (!result.success) {
      setErrors(result.errors);
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin giao hàng');
      return;
    }
    setErrors({});

    inFlight.current = true;
    setSubmitting(true);
    const payload = { ...quoteInput, expectedTotal: quote.data.totalAmount, customerName: name, customerPhone: phone, customerAddress: address };
    const signature = JSON.stringify(payload);
    if (request.current.signature !== signature) request.current = {
      signature, id: 'checkout-' + Date.now() + '-' + Math.random().toString(36).slice(2),
    };
    try {
      const order = await mutation.mutateAsync({ ...payload, requestId: request.current.id });
      clearCart();
      client.setQueryData(['orders', order.id], order);
      await client.invalidateQueries({ queryKey: ['orders'] });
      void client.invalidateQueries({ queryKey: ['products'] });
      Vibration.vibrate([0, 50, 50, 50]);
      navigation.replace('OrderDetail', { orderId: order.id });
    } catch (error) {
      Alert.alert('Chưa đặt được hàng', apiErrorMessage(error));
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        {quote.isPending && items.length > 0 && <Text>Đang kiểm tra giá và tồn kho…</Text>}
        {quote.isError && <View><Text>{apiErrorMessage(quote.error)}</Text><ShopButton title="Thử lại báo giá" onPress={() => { quote.refetch(); }} /></View>}
        <Text>Phí giao hàng của đơn do máy chủ xác nhận (25.000đ trước ưu đãi). GPS chỉ là ước tính khoảng cách.</Text>
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
            disabled={!quote.data || quote.isFetching || quote.isError || !items.length}
        />
      </View>
    </SafeAreaView>
  );
};

const baseStyles = StyleSheet.create({
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
