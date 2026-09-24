// src/components/ShopButton.tsx
// Chương 3: Atomic Design — Atom cơ bản, nút bấm tái sử dụng

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { COLORS, SIZES } from '@constants/theme';

interface ShopButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'outline' | 'ghost';
}

const ShopButton: React.FC<ShopButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  style,
  variant = 'primary',
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? COLORS.textInverse : COLORS.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'outline' && styles.labelOutline,
            variant === 'ghost' && styles.labelGhost,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: SIZES.buttonHeight,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  label: {
    fontSize: SIZES.body1,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  labelOutline: {
    color: COLORS.primary,
  },
  labelGhost: {
    color: COLORS.primary,
  },
});

export default ShopButton;
