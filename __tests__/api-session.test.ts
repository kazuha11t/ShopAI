import { AxiosError } from 'axios';
import { apiClient } from '../src/services/api';
import { useAuthStore } from '../src/store/useAuthStore';

test('requests attach the current JWT and a protected 401 expires the session', async () => {
  await useAuthStore.getState().login('current-token');
  await expect(apiClient.get('/orders', { adapter: async config => {
    expect(config.headers.Authorization).toBe('Bearer current-token');
    throw new AxiosError('expired', 'ERR_BAD_REQUEST', config, undefined, {
      status: 401, statusText: 'Unauthorized', headers: {}, config, data: {},
    });
  } })).rejects.toBeInstanceOf(AxiosError);
  expect(useAuthStore.getState().token).toBeNull();
});

test('a failed login does not clear an existing session', async () => {
  await useAuthStore.getState().login('current-token');
  await expect(apiClient.post('/auth/login', {}, { adapter: async config => {
    expect(config.headers.Authorization).toBeUndefined();
    throw new AxiosError('wrong password', 'ERR_BAD_REQUEST', config, undefined, {
      status: 401, statusText: 'Unauthorized', headers: {}, config, data: {},
    });
  } })).rejects.toBeInstanceOf(AxiosError);
  expect(useAuthStore.getState().token).toBe('current-token');
});
