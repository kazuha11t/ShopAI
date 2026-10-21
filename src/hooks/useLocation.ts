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

export type LocationErrorType = 'permission_denied' | 'permission_blocked' | 'services_off' | 'timeout' | 'unknown';

export interface LocationError {
  type: LocationErrorType;
  message: string;
}

const LOCATION_ERROR_MESSAGES: Record<LocationErrorType, string> = {
  permission_denied: 'Bạn chưa cấp quyền vị trí cho ShopAI.',
  permission_blocked: 'Quyền vị trí đã bị chặn. Vào Cài đặt để cấp lại.',
  services_off: 'Vị trí (GPS) trên điện thoại đang tắt.',
  timeout: 'Hết thời gian chờ tín hiệu GPS.',
  unknown: 'Không thể xác định vị trí hiện tại.',
};

const makeLocationError = (type: LocationErrorType): LocationError => ({
  type,
  message: LOCATION_ERROR_MESSAGES[type],
});

// Mã lỗi Geolocation: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE (GPS tắt), 3 = TIMEOUT
const mapGeolocationError = (code: number): LocationErrorType => {
  switch (code) {
    case 1:
      return 'permission_denied';
    case 2:
      return 'services_off';
    case 3:
      return 'timeout';
    default:
      return 'unknown';
  }
};

export function useLocation() {
  const [distanceKm, setDistanceKm] = useState<number>(FALLBACK_DISTANCE_KM);
  const [shippingFee, setShippingFee] = useState<number>(FALLBACK_SHIPPING_FEE);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [error, setError] = useState<LocationError | null>(null);
  const errorRef = useRef<LocationError | null>(null);
  const appState = useRef<import('react-native').AppStateStatus>(AppState.currentState as import('react-native').AppStateStatus);


  const updateError = useCallback((next: LocationError | null) => {
    errorRef.current = next;
    setError(next);
  }, []);

  const requestLocationPermission = useCallback(
    async (): Promise<boolean> => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Quyền vị trí ShopAI',
              message:
                'ShopAI cần quyền truy cập vị trí để ước tính chi phí giao hàng tận nhà.',
              buttonNeutral: 'Hỏi lại sau',
              buttonNegative: 'Hủy',
              buttonPositive: 'Đồng ý',
            },
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setHasPermission(true);
            return true;
          }

          setHasPermission(false);

          if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            updateError(makeLocationError('permission_blocked'));

            Alert.alert(
              'Quyền Vị Trí Bị Chặn',
              'Bạn đã tắt vĩnh viễn quyền vị trí. Vui lòng vào Cài đặt để kích hoạt.',
              [
                { text: 'Để sau', style: 'cancel' },
                {
                  text: 'Mở Cài đặt',
                  onPress: () => {
                    Linking.openSettings().catch(() => {
                      Alert.alert(
                        'Lỗi',
                        'Không thể mở Cài đặt. Vui lòng mở Cài đặt thủ công.',
                      );
                    });
                  },
                },
              ],
            );

            return false;
          }

          updateError(makeLocationError('permission_denied'));
          return false;
        } catch {
          updateError(makeLocationError('unknown'));
          return false;
        }
      }

      setHasPermission(true);
      return true;
    },
    [updateError],
  );

  const calculateShipping = useCallback(
    (userLat: number, userLng: number) => {
      const km = getDistanceKm(
        WAREHOUSE_LAT,
        WAREHOUSE_LNG,
        userLat,
        userLng,
      );

      setDistanceKm(km);
      setShippingFee(calculateShippingFee(km));
    },
    [],
  );


  const refreshLocation = useCallback(async () => {
    const granted = await requestLocationPermission();
    if (!granted) return;

    setLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        setLoading(false);
        updateError(null);
        calculateShipping(position.coords.latitude, position.coords.longitude);
      },
      (geoError) => {
        setLoading(false);
        // Vẫn giữ phí mặc định để Checkout tạm tính, nhưng báo lỗi cho UI hiển thị
        setDistanceKm(FALLBACK_DISTANCE_KM);
        setShippingFee(FALLBACK_SHIPPING_FEE);
        updateError(makeLocationError(mapGeolocationError(geoError.code)));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  },[requestLocationPermission, updateError, calculateShipping]);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  // Chương 7.5: Tự dò lại vị trí khi người dùng quay lại app từ Settings (cấp quyền / bật GPS)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active' && errorRef.current) {
        refreshLocation();
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [refreshLocation]);

  // Mở đúng màn hình Cài đặt tương ứng với loại lỗi
  const openLocationSettings = useCallback(() => {
    if (Platform.OS === 'android' && errorRef.current?.type === 'services_off') {
      Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS').catch(() => Linking.openSettings());
    } else {
      Linking.openSettings();
    }
  }, []);

  return {
    distanceKm,
    shippingFee,
    loading,
    hasPermission,
    error,
    refreshLocation,
    openLocationSettings,
  };
}
