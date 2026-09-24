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
  const { distanceKm, shippingFee, loading, refreshLocation } = useLocation();

  const formattedFee = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(shippingFee);

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
  loader: {
    marginLeft: 6,
  },
  refreshText: {
    fontSize: 14,
    marginLeft: 6,
  },
});

export default LocationBadge;
