import { useMemo } from 'react';
import { useTheme } from '@contexts/ThemeContext';
import { COLORS } from '@constants/theme';

export function useThemedStyles<T extends Record<string, object>>(base: T): T {
  const { colors } = useTheme();
  return useMemo(() => {
    const replacements = new Map(
      Object.keys(COLORS).map(key => [COLORS[key as keyof typeof COLORS], colors[key as keyof typeof colors]]),
    );
    return Object.fromEntries(Object.entries(base).map(([name, style]) => [
      name, Object.fromEntries(Object.entries(style).map(([property, value]) => [
        property, property === 'backgroundColor' && value === COLORS.surface
          ? colors.surface
          : typeof value === 'string' && /color$/i.test(property)
            ? replacements.get(value) ?? value : value,
      ])),
    ])) as T;
  }, [base, colors]);
}
