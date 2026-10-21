/* global jest, afterEach */
jest.mock('@react-native-async-storage/async-storage', () => {
  const values = new Map();
  return {
    getItem: jest.fn(async key => values.get(key) ?? null),
    setItem: jest.fn(async (key, value) => { values.set(key, value); }),
    removeItem: jest.fn(async key => { values.delete(key); }),
    clear: jest.fn(async () => { values.clear(); }),
  };
});
jest.mock('@react-native-firebase/app', () => ({ getApp: jest.fn(() => ({})) }));
jest.mock('@react-native-firebase/crashlytics', () => ({
  getCrashlytics: jest.fn(() => ({})),
  setAttribute: jest.fn(async () => {}),
  recordError: jest.fn(),
  crash: jest.fn(),
}));
jest.mock('react-native-keychain');
jest.mock('react-native-biometrics');
jest.mock('react-native-vision-camera');
jest.mock('@react-native-community/geolocation');
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
require('react-native-gesture-handler/jestSetup');
require('react-native-reanimated').setUpTests();
afterEach(() => {
  require('./src/services/queryClient').queryClient.clear();
});
