/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  // act async: chờ checkLocalToken() (đọc Keystore mock) chạy xong rồi mới kết thúc test
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
  });
});
