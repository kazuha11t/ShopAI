// Jest manual mock cho react-native-biometrics (Chương 8)
// Mặc định giả lập máy KHÔNG có sinh trắc học -> cổng khoá cho vào thẳng
class ReactNativeBiometrics {
  isSensorAvailable = jest.fn().mockResolvedValue({ available: false });
  simplePrompt = jest.fn().mockResolvedValue({ success: true });
}

module.exports = {
  __esModule: true,
  default: ReactNativeBiometrics,
  BiometryTypes: { TouchID: 'TouchID', FaceID: 'FaceID', Biometrics: 'Biometrics' },
};
