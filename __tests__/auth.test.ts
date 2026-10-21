import * as Keychain from 'react-native-keychain';
import { useAuthStore } from '../src/store/useAuthStore';
import { useCartStore } from '../src/store/useCartStore';
import { queryClient } from '../src/services/queryClient';
test('logout removes sensitive session cache and cart', async () => {
  await useAuthStore.getState().login('test-token');
  queryClient.setQueryData(['orders'], [{ id: 'private-order' }]);
  useCartStore.getState().addItem({ id: '1', name: 'Phone', price: 100, image: '' });
  await useAuthStore.getState().logout();
  expect(useAuthStore.getState().token).toBeNull();
  expect(queryClient.getQueryData(['orders'])).toBeUndefined();
  expect(useCartStore.getState().items).toHaveLength(0);
});
test('a restored token remains behind the biometric gate', async () => {
  await useAuthStore.getState().login('test-token');
  await useAuthStore.getState().checkLocalToken();
  expect(useAuthStore.getState().isUnlocked).toBe(false);
  expect(useAuthStore.getState().token).toBe('test-token');
});
test('an expired session is locked even when device credential deletion fails', async () => {
  jest.mocked(Keychain.resetGenericPassword).mockRejectedValueOnce(new Error('device unavailable'));
  await useAuthStore.getState().expireSession();
  expect(useAuthStore.getState().token).toBeNull();
});
