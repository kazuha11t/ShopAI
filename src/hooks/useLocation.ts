// src/hooks/useLocation.ts
// Chương 7: Định vị GPS, xin quyền Geolocation & Ước tính phí giao hàng theo khoảng cách

import { useState, useEffect, useCallback } from 'react';
import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// Tọa độ kho trung tâm ShopAI (Hồ Gươm, Hà Nội: 21.0285° N, 105.8542° E)
const WAREHOUSE_LAT = 21.0285;
const WAREHOUSE_LNG = 105.8542;

// Công thức Haversine tính khoảng cách giữa 2 điểm GPS (km)
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function useLocation() {
  const [distanceKm, setDistanceKm] = useState<number>(5);
  const [shippingFee, setShippingFee] = useState<number>(20000);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);

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

    // Biểu phí: 15.000đ cơ bản + 2.500đ/km
    const fee = 15000 + km * 2500;
    setShippingFee(fee);
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
        // Fallback mặc định 5km nếu lỗi GPS (như trên máy ảo)
        setDistanceKm(5);
        setShippingFee(25000);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  return {
    distanceKm,
    shippingFee,
    loading,
    hasPermission,
    refreshLocation,
  };
}
