// src/constants/theme.ts
// Design System cốt lõi của ShopAI — Chương 3

export const COLORS = {
  // Brand
  primary: '#FF4D4F',
  primaryLight: '#FF7875',
  primaryDark: '#CF1322',

  // Neutral
  background: '#F5F5F5',
  surface: '#FFFFFF',
  border: '#E8E8E8',

  // Text
  text: '#1A1A2E',
  textLight: '#7F8C8D',
  textInverse: '#FFFFFF',

  // Semantic
  success: '#52C41A',
  warning: '#FAAD14',
  error: '#FF4D4F',
  info: '#1890FF',

  // UI
  overlay: 'rgba(0,0,0,0.5)',
  shadow: 'rgba(0,0,0,0.08)',
};

export const SIZES = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 12,
  padding: 16,
  lg: 20,
  xl: 24,
  xxl: 32,

  // Border
  radius: 12,
  radiusSm: 8,
  radiusLg: 20,

  // Typography
  h1: 28,
  h2: 22,
  h3: 18,
  body1: 16,
  body2: 14,
  caption: 12,

  // Component
  buttonHeight: 50,
  inputHeight: 52,
  tabBarHeight: 60,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export type Colors = typeof COLORS;
export type Sizes = typeof SIZES;
