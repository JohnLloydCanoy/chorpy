import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { colors, borderRadius, spacing } from '../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  loading?: boolean;
}

export function Button({ title, variant = 'primary', loading, style, disabled, ...props }: ButtonProps) {
  const buttonStyle = [
    styles.base,
    styles[variant],
    disabled && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity style={buttonStyle} disabled={disabled || loading} activeOpacity={0.8} {...props}>
      {loading ? (
        <ActivityIndicator color={colors.textLight} />
      ) : (
        <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  accent: {
    backgroundColor: colors.accent,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.textLight,
    fontSize: 15,
    fontWeight: 'bold',
  },
  secondaryText: {
    color: colors.text,
  },
});
