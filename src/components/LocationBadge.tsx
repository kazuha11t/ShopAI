// src/components/LocationBadge.tsx
// Chương 7: Hiển thị khoảng cách và phí ship tính theo vị trí GPS thực tế

import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '@constants/theme';
import { useLocation } from '@hooks/useLocation';

interface LocationBadgeProps {
  onPress?: () => void;
}

const LocationBadge: React.FC<LocationBadgeProps> = ({ onPress }) => {
  const { distanceKm, shippingFee, loading, error, refreshLocation, openLocationSettings } = useLocation();

  const formattedFee = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(shippingFee);

  // Không lấy được vị trí (GPS tắt / chưa cấp quyền / hết thời gian chờ): hiện thẻ lỗi thay cho khoảng cách giả
  if (error) {
    const actionLabel = error.type === 'services_off' ? 'Bật vị trí' : error.type.startsWith('permission') ? 'Cấp quyền' : null;
    return (
      <Pressable style={[styles.container, styles.errorContainer]} onPress={refreshLocation} accessibilityRole="button">
        <Text style={styles.icon}>⚠️</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.title, styles.errorTitle]}>Không lấy được vị trí giao hàng</Text>
          <Text style={styles.subtitle}>{error.message}</Text>
          <Text style={styles.hint}>Chạm để thử lại · Phí tạm tính {formattedFee}</Text>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
        ) : (
          actionLabel && (
            <Pressable style={styles.actionBtn} onPress={openLocationSettings} hitSlop={6}>
              <Text style={styles.actionText}>{actionLabel}</Text>
            </Pressable>
          )
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      style={styles.container}
      onPress={onPress || refreshLocation}
    >
      <Text style={styles.icon}>📍</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Giao hàng (~{distanceKm} km)</Text>
        <Text style={styles.subtitle}>
          Phí dự kiến: <Text style={styles.feeHighlight}>{formattedFee}</Text>
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
      ) : (
        <Text style={styles.refreshText}>🔄</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2F0',
    paddingHorizontal: SIZES.md,
    paddingVertical: 8,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: '#FFCCC7',
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.sm,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.text,
  },
  feeHighlight: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  errorContainer: {
    backgroundColor: '#FFF8E6',
    borderColor: '#FFD591',
  },
  errorTitle: {
    color: '#AD4E00',
  },
  hint: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
  actionBtn: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.primary,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loader: {
    marginLeft: 6,
  },
  refreshText: {
    fontSize: 14,
    marginLeft: 6,
  },
});

export default LocationBadge;
