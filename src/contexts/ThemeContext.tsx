// src/contexts/ThemeContext.tsx
// Chương 3: useContext — Dark/Light Mode cho toàn bộ App

import React, { createContext, useContext, useState } from 'react';
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
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark(prev => !prev);
  const colors = isDark ? DARK_COLORS : COLORS;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
