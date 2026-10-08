module.exports = {
  preset: '@react-native/jest-preset',
  // Nhiều thư viện (react-navigation, react-redux, zustand, i18next, flash-list...)
  // xuất bản dạng ESM thuần trong node_modules nên cần Babel transform toàn bộ.
  transformIgnorePatterns: [],
  // Bắt buộc theo docs Reanimated 4 / Worklets: dùng resolver này để chạy được dưới Jest (không có Native Module thật)
  resolver: 'react-native-reanimated/jest/resolver.js',
};
