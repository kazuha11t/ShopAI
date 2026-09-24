// src/screens/ScannerScreen.tsx
// Chương 7: Màn hình Quét mã vạch sản phẩm (Barcode / QR Scanner) + Haptic Feedback

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform, Alert, Linking, Vibration, Pressable, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES } from '@constants/theme';
import ShopButton from '@components/ShopButton';
import { MOCK_PRODUCTS } from '@data/mockProducts';

const ScannerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  // Xin quyền Camera theo chuẩn UX (Chương 7.2 & 7.5)
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Quyền Camera ShopAI',
            message: 'ShopAI cần quyền mở Camera để quét mã vạch sản phẩm và kiểm tra nguồn gốc.',
            buttonNeutral: 'Để sau',
            buttonNegative: 'Hủy',
            buttonPositive: 'Cho phép',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          setHasPermission(false);
          Alert.alert(
            'Quyền Camera Bị Chặn',
            'Bạn đã từ chối quyền Camera vĩnh viễn. Vui lòng vào Cài đặt để kích hoạt tính năng quét mã.',
            [
              { text: 'Để sau', style: 'cancel' },
              { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
            ],
          );
        } else {
          setHasPermission(false);
        }
      } catch {
        setHasPermission(false);
      }
    } else {
      setHasPermission(true);
    }
  };

  useEffect(() => {
    requestCameraPermission();
  }, []);

  // Chương 7.5: Tự dò lại quyền Camera khi quay lại app từ Cài đặt hệ thống
  const appState = useRef<import('react-native').AppStateStatus>(AppState.currentState as import('react-native').AppStateStatus);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active' && hasPermission === false) {
        requestCameraPermission();
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [hasPermission]);

  const handleSimulateScan = (productId: string) => {
    if (!isScanning) return;
    setIsScanning(false);

    // Haptic feedback khi bắt trúng mã vạch (Chương 7.6)
    Vibration.vibrate(40);

    const found = MOCK_PRODUCTS.find((p) => p.id === productId);
    if (found) {
      Alert.alert(
        'Đã nhận diện mã vạch! 📷',
        `Sản phẩm: ${found.name}\nGiá: ${found.price.toLocaleString('vi-VN')} đ`,
        [
          {
            text: 'Xem chi tiết ngay',
            onPress: () => {
              navigation.replace('ProductDetail', { productId: found.id });
            },
          },
          {
            text: 'Quét tiếp',
            onPress: () => setIsScanning(true),
          },
        ],
      );
    }
  };

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Text style={styles.errorEmoji}>🚫</Text>
          <Text style={styles.title}>Chưa cấp quyền Camera</Text>
          <Text style={styles.subtitle}>
            Để dùng tính năng Quét mã vạch sản phẩm, ứng dụng cần bạn cấp quyền truy cập Camera.
          </Text>
          <ShopButton
            title="Mở Cài Đặt Hệ Thống"
            onPress={() => Linking.openSettings()}
            style={styles.actionBtn}
          />
          <ShopButton
            title="Quay lại"
            onPress={() => navigation.goBack()}
            variant="ghost"
            style={styles.backBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <View style={styles.scannerContainer}>
        {/* Khung ngắm mô phỏng quét mã */}
        <View style={styles.cameraViewport}>
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <View style={styles.scanLaser} />
          </View>
          <Text style={styles.guidanceText}>
            Hướng camera vào mã vạch (Barcode / QR) trên bao bì sản phẩm
          </Text>
        </View>

        {/* Bảng test quét nhanh mô phỏng các sản phẩm mẫu */}
        <View style={styles.demoSheet}>
          <Text style={styles.demoTitle}>💡 Thử nghiệm quét nhanh (Mock Barcode):</Text>
          <View style={styles.demoButtonsRow}>
            {MOCK_PRODUCTS.slice(0, 3).map((p) => (
              <Pressable
                key={p.id}
                style={styles.demoCodeBtn}
                onPress={() => handleSimulateScan(p.id)}
              >
                <Text style={styles.demoCodeText}>Quét mã #{p.id}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraViewport: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  viewfinder: {
    width: 250,
    height: 250,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanLaser: {
    width: '90%',
    height: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.primary,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
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
    minWidth: 200,
  },
  backBtn: {
    marginTop: 8,
  },
});

export default ScannerScreen;
