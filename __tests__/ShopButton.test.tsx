import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import ShopButton from '../src/components/ShopButton';
describe('ShopButton', () => {
  it('invokes the action when enabled', async () => {
    const press = jest.fn();
    await render(<ShopButton title="Đặt hàng" onPress={press} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Đặt hàng' }));
    expect(press).toHaveBeenCalledTimes(1);
  });
  it.each([{ disabled: true }, { isLoading: true }])('blocks duplicate/disabled actions: %p', async props => {
    const press = jest.fn();
    await render(<ShopButton title="Đặt hàng" onPress={press} {...props} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Đặt hàng' }));
    expect(press).not.toHaveBeenCalled();
  });
});
