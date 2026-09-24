// Jest manual mock cho @react-native-community/geolocation
// Tránh lỗi "package doesn't seem to be linked" khi chạy unit test (không có Native Module thật trong môi trường Jest)
module.exports = {
  getCurrentPosition: jest.fn((success) => {
    success({ coords: { latitude: 21.0285, longitude: 105.8542 } });
  }),
  watchPosition: jest.fn(() => 0),
  clearWatch: jest.fn(),
  requestAuthorization: jest.fn(),
  setRNConfiguration: jest.fn(),
};
