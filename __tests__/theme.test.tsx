import React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { useThemedStyles } from '../src/hooks/useThemedStyles';
import { COLORS } from '../src/constants/theme';
const base = StyleSheet.create({
  card: { backgroundColor: COLORS.surface },
  inverse: { color: COLORS.textInverse },
});
function Example() {
  const { toggleTheme } = useTheme();
  const styles = useThemedStyles(base);
  return <View testID="card" style={styles.card}>
    <Text testID="inverse" style={styles.inverse}>White button text</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Toggle" onPress={toggleTheme} />
  </View>;
}
test('dark theme changes white surfaces without turning inverse text dark', async () => {
  await render(<ThemeProvider><Example /></ThemeProvider>);
  await fireEvent.press(screen.getByRole('button', { name: 'Toggle' }));
  expect(StyleSheet.flatten(screen.getByTestId('card').props.style).backgroundColor).toBe('#1E1E1E');
  expect(StyleSheet.flatten(screen.getByTestId('inverse').props.style).color).toBe('#FFFFFF');
});
