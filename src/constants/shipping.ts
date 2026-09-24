// src/constants/shipping.ts
// Chương 7: Hằng số kho hàng + công thức Haversine + biểu phí ship theo khoảng cách

// Tọa độ kho trung tâm ShopAI (Hồ Gươm, Hà Nội)
export const WAREHOUSE_LAT = 21.0285;
export const WAREHOUSE_LNG = 105.8542;

// Biểu phí: phí cơ bản + phí theo mỗi km
export const BASE_SHIPPING_FEE = 15000;
export const FEE_PER_KM = 2500;

// Giá trị mặc định khi không lấy được GPS (fallback máy ảo)
export const FALLBACK_DISTANCE_KM = 5;
export const FALLBACK_SHIPPING_FEE = 25000;

// Công thức Haversine tính khoảng cách giữa 2 điểm GPS (km)
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

export function calculateShippingFee(distanceKm: number): number {
  return BASE_SHIPPING_FEE + distanceKm * FEE_PER_KM;
}
