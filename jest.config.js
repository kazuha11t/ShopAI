module.exports = {
  preset: '@react-native/jest-preset',
  // Nhiều thư viện (react-navigation, react-redux, zustand, i18next, flash-list...)
  // xuất bản dạng ESM thuần trong node_modules nên cần Babel transform toàn bộ.
  transformIgnorePatterns: [],
};
