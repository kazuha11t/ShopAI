// src/hooks/useLocation.ts
// Chương 7: Định vị GPS, xin quyền Geolocation & Ước tính phí giao hàng theo khoảng cách

import { useState, useEffect, useCallback, useRef } from 'react';
import { PermissionsAndroid, Platform, Alert, Linking, AppState } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  WAREHOUSE_LAT,
  WAREHOUSE_LNG,
  FALLBACK_DISTANCE_KM,
  FALLBACK_SHIPPING_FEE,
  getDistanceKm,
  calculateShippingFee,
} from '@constants/shipping';

export function useLocation() {
  const [distanceKm, setDistanceKm] = useState<number>(FALLBACK_DISTANCE_KM);
  const [shippingFee, setShippingFee] = useState<number>(FALLBACK_SHIPPING_FEE);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const appState = useRef<import('react-native').AppStateStatus>(AppState.currentState as import('react-native').AppStateStatus);

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Quyền vị trí ShopAI',
            message: 'ShopAI cần quyền truy cập vị trí để ước tính chi phí giao hàng tận nhà.',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Hủy',
            buttonPositive: 'Đồng ý',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Quyền Vị Trí Bị Chặn',
            'Bạn đã tắt vĩnh viễn quyền vị trí. Vui lòng vào Cài đặt để kích hoạt.',
            [
              { text: 'Để sau', style: 'cancel' },
              { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
            ],
          );
          return false;
        }
        return false;
      } catch {
        return false;
      }
    }
    return true;
  };

  const calculateShipping = (userLat: number, userLng: number) => {
    const km = getDistanceKm(WAREHOUSE_LAT, WAREHOUSE_LNG, userLat, userLng);
    setDistanceKm(km);
    setShippingFee(calculateShippingFee(km));
  };

  const refreshLocation = useCallback(async () => {
    const granted = await requestLocationPermission();
    if (!granted) return;

    setLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        setLoading(false);
        calculateShipping(position.coords.latitude, position.coords.longitude);
      },
      (_error) => {
        setLoading(false);
        // Fallback mặc định nếu lỗi GPS (như trên máy ảo)
        setDistanceKm(FALLBACK_DISTANCE_KM);
        setShippingFee(FALLBACK_SHIPPING_FEE);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  // Chương 7.5: Tự dò lại quyền vị trí khi người dùng quay lại app từ Settings
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active' && !hasPermission) {
        refreshLocation();
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [hasPermission, refreshLocation]);

  return {
    distanceKm,
    shippingFee,
    loading,
    hasPermission,
    refreshLocation,
  };
}
