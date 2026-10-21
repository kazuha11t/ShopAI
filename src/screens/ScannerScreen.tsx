import { useThemedStyles } from '@hooks/useThemedStyles';
// src/screens/ScannerScreen.tsx
// Chương 7: Màn hình Quét mã vạch/QR thật bằng Vision Camera (MLKit Code Scanner) + Haptic Feedback

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Linking, Vibration, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner, type Code } from 'react-native-vision-camera';
import { COLORS, SIZES } from '@constants/theme';
import ShopButton from '@components/ShopButton';
import { fetchProduct, apiErrorMessage } from '@services/api';

const ScannerScreen: React.FC = () => {
  const styles = useThemedStyles(baseStyles);
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const device = useCameraDevice('back');
  // Chương 7.5: hook này tự refresh quyền qua AppState listener khi người dùng quay lại từ Settings
  const { hasPermission, requestPermission } = useCameraPermission();
  const [permissionAsked, setPermissionAsked] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!hasPermission && !permissionAsked) {
      requestPermission().finally(() => setPermissionAsked(true));
    }
  }, [hasPermission, permissionAsked, requestPermission]);

  const scanBusy = useRef(false);
  const resumeScan = () => { scanBusy.current = false; setIsScanning(true); };
  const handleDetectedCode = useCallback(async (value: string) => {
    if (scanBusy.current) return;
    scanBusy.current = true; setIsScanning(false);
    const code = value.trim().replace(/^shopai:\/\/product\//i, '');
    try {
      if (!/^\d+$/.test(code)) throw new Error('Mã sản phẩm không hợp lệ.');
      const found = await fetchProduct(code);
      Vibration.vibrate(40);
      Alert.alert('Đã nhận diện sản phẩm', found.name, [
        { text: 'Xem chi tiết', onPress: () => navigation.replace('ProductDetail', { productId: found.id }) },
        { text: 'Quét tiếp', onPress: resumeScan },
      ], { cancelable: false });
    } catch (error) {
      Alert.alert('Không tìm được sản phẩm', apiErrorMessage(error), [{ text: 'Quét tiếp', onPress: resumeScan }], { cancelable: false });
    }
  }, [navigation]);

  // Chương 7.8: Code Scanner dùng MLKit native, chạy trên luồng riêng, trả kết quả về JS thread
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39', 'upc-a', 'upc-e'],
    onCodeScanned: (codes: Code[]) => {
      const value = codes[0]?.value;
      if (value) handleDetectedCode(value);
    },
  });

  const handleSimulateScan = (productId: string) => handleDetectedCode(productId);

  // ===== Đang chờ kết quả xin quyền lần đầu =====
  if (!hasPermission && !permissionAsked) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ===== Bị từ chối quyền Camera (Chương 7.5: pop-up giải thích + nút Mở Cài đặt) =====
  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Text style={styles.errorEmoji}>🚫</Text>
          <Text style={styles.title}>Chưa cấp quyền Camera</Text>
          <Text style={styles.subtitle}>
            Để dùng tính năng Quét mã vạch sản phẩm, ứng dụng cần bạn cấp quyền truy cập Camera.
          </Text>
          <ShopButton title="Cấp quyền ngay" onPress={() => requestPermission()} style={styles.actionBtn} />
          <ShopButton
            title="Mở Cài Đặt Hệ Thống"
            onPress={() => Linking.openSettings()}
            variant="outline"
            style={styles.actionBtn}
          />
          <ShopButton title="Quay lại" onPress={() => navigation.goBack()} variant="ghost" style={styles.backBtn} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={styles.scannerContainer}>
        {device != null ? (
          <View style={styles.cameraWrapper}>
            {/* Camera thật + MLKit Code Scanner (Chương 7.3 - 7.8) */}
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={isFocused && isScanning}
              codeScanner={codeScanner}
            />
            <View style={styles.viewfinderOverlay} pointerEvents="none">
              <View style={styles.viewfinder}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              <Text style={styles.guidanceText}>
                Hướng camera vào mã vạch (Barcode / QR) trên bao bì sản phẩm
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.centerBox}>
            <Text style={styles.errorEmoji}>📵</Text>
            <Text style={styles.title}>Không tìm thấy Camera</Text>
            <Text style={styles.subtitle}>
              Thiết bị/máy ảo này không có Camera sau khả dụng. Dùng nút mô phỏng bên dưới để kiểm thử luồng quét.
            </Text>
          </View>
        )}

        {/* Bảng test quét nhanh mô phỏng — hữu ích khi test trên máy ảo không có mã thật */}
        <View style={styles.demoSheet}>
          <Text style={styles.demoTitle}>💡 Không có mã thật? Thử nhanh (Mock Barcode):</Text>
          <View style={styles.demoButtonsRow}>
            {['1', '2', '3'].map(id => ({ id })).map((p) => (
              <Pressable key={p.id} style={styles.demoCodeBtn} onPress={() => handleSimulateScan(p.id)}>
                <Text style={styles.demoCodeText}>Quét mã #{p.id}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const baseStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraWrapper: {
    flex: 1,
  },
  viewfinderOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinder: {
    width: 250,
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.primary,
  },
  topLeft: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4 },
  topRight: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4 },
  bottomLeft: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4 },
  bottomRight: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4 },
  guidanceText: {
    marginTop: SIZES.xl,
    color: '#FFFFFF',
    fontSize: SIZES.body2,
    textAlign: 'center',
    paddingHorizontal: SIZES.padding,
  },
  demoSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SIZES.radiusLg,
    borderTopRightRadius: SIZES.radiusLg,
    padding: SIZES.padding,
  },
  demoTitle: {
    fontSize: SIZES.body2,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  demoCodeBtn: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoCodeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 1.5,
    backgroundColor: COLORS.background,
  },
  errorEmoji: {
    fontSize: 54,
    marginBottom: 12,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: SIZES.body2,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SIZES.xl,
  },
  actionBtn: {
    minWidth: 220,
    marginBottom: SIZES.sm,
  },
  backBtn: {
    marginTop: 8,
  },
});

export default ScannerScreen;
