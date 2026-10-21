import { useThemedStyles } from '@hooks/useThemedStyles';
// src/components/ui/ShopInput.tsx
// Chương 3: Input Atom có label, validation error, secureTextEntry

import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { COLORS, SIZES } from '@constants/theme';

interface ShopInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: KeyboardTypeOptions;
  editable?: boolean;
}

const ShopInput: React.FC<ShopInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  editable = true,
}) => {
  const styles = useThemedStyles(baseStyles);
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasError = !!error;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          focused && styles.inputFocused,
          hasError && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
      >
        <TextInput
          accessibilityLabel={label}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={editable}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setShowPassword(prev => !prev)}
            style={styles.eyeButton}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
          </Pressable>
        )}
      </View>
      {hasError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    marginBottom: SIZES.md,
  },
  label: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  inputWrapper: {
    height: SIZES.inputHeight,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputDisabled: {
    backgroundColor: COLORS.background,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: SIZES.body1,
    color: COLORS.text,
    height: '100%',
  },
  eyeButton: {
    padding: SIZES.xs,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    fontSize: SIZES.caption,
    color: COLORS.error,
    marginTop: SIZES.xs,
  },
});

export default ShopInput;
