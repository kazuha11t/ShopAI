// Jest manual mock cho react-native-keychain (Chương 8)
// Môi trường Jest không có Keystore/Keychain thật -> giả lập bằng một Map trong bộ nhớ
const store = new Map();

module.exports = {
  ACCESSIBLE: {
    WHEN_UNLOCKED: 'AccessibleWhenUnlocked',
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
  },
  setGenericPassword: jest.fn(async (username, password, options = {}) => {
    store.set(options.service ?? 'default', { username, password });
    return { service: options.service ?? 'default', storage: 'mock' };
  }),
  getGenericPassword: jest.fn(async (options = {}) => store.get(options.service ?? 'default') ?? false),
  resetGenericPassword: jest.fn(async (options = {}) => store.delete(options.service ?? 'default')),
};
