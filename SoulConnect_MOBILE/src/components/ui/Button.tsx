import React from 'react';
import {Pressable, StyleSheet, Text, ViewStyle} from 'react-native';
import {colors, radii} from '../../theme/colors';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({label, onPress, variant = 'primary', disabled, style}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'outline' && styles.outline,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={[styles.label, variant !== 'primary' && styles.darkLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  primary: {backgroundColor: colors.plum},
  outline: {backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.plum},
  pressed: {opacity: 0.86},
  disabled: {opacity: 0.5},
  label: {color: colors.white, fontSize: 16, fontWeight: '600'},
  darkLabel: {color: colors.plum},
});
