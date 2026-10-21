/**
 * @format
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import App from '../App';
import * as Keychain from 'react-native-keychain';
// Navigation's native drawer is covered by device flows. This test verifies
// the real root providers and authentication boot path without opening Main.
jest.mock('../src/navigation/MainDrawerNavigator', () => () => null);
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: require('react-native').View,
}));

test('shows login when there is no stored session', async () => {
  jest.mocked(Keychain.getGenericPassword).mockResolvedValue(false);
  await render(<App />);
  expect(await screen.findByText('Đăng nhập để tiếp tục trải nghiệm', {}, { timeout: 10000 })).toBeTruthy();
});
