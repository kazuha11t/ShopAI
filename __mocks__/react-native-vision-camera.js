// Jest manual mock cho react-native-vision-camera
// Tránh lỗi "native Camera Module could not be found" khi chạy unit test (không có Native Module thật trong môi trường Jest)
const React = require('react');

module.exports = {
  Camera: React.forwardRef((_props, _ref) => null),
  useCameraDevice: jest.fn(() => undefined),
  useCameraDevices: jest.fn(() => []),
  useCameraPermission: jest.fn(() => ({
    hasPermission: false,
    requestPermission: jest.fn().mockResolvedValue(false),
  })),
  useMicrophonePermission: jest.fn(() => ({
    hasPermission: false,
    requestPermission: jest.fn().mockResolvedValue(false),
  })),
  useCodeScanner: jest.fn((config) => config),
};
