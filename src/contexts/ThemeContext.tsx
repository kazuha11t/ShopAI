// src/contexts/ThemeContext.tsx
// Chương 3: useContext — Dark/Light Mode cho toàn bộ App

import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@constants/theme';

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof COLORS;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleTheme: () => {},
  colors: COLORS,
});

const DARK_COLORS = {
  ...COLORS,
  background: '#121212',
  surface: '#1E1E1E',
  border: '#333333',
  text: '#F5F5F5',
  textLight: '#AAAAAA',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, dispatch] = useReducer((state: boolean, action: { type: 'toggle' } | { type: 'restore'; value: boolean }) =>
    action.type === 'toggle' ? !state : action.value, false);
  const changed = React.useRef(false);
  useEffect(() => {
    AsyncStorage.getItem('shopai-theme').then(value => {
      if (!changed.current) dispatch({ type: 'restore', value: value === 'dark' });
    }).catch(() => {});
  }, []);
  const toggleTheme = useCallback(() => {
    changed.current = true;
    dispatch({ type: 'toggle' });
  }, []);
  useEffect(() => {
    if (changed.current) void AsyncStorage.setItem('shopai-theme', isDark ? 'dark' : 'light').catch(() => {});
  }, [isDark]);
  const colors = isDark ? DARK_COLORS : COLORS;
  const value = useMemo(() => ({ isDark, toggleTheme, colors }), [isDark, toggleTheme, colors]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
