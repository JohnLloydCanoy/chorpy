import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator, Image } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../theme';

const primaryBgImage = require('../../assets/Background-of-Primary-Color.png');

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  loading?: boolean;
}

export function Button({ title, variant = 'primary', loading, style, disabled, ...props }: ButtonProps) {
  const isPrimary = variant === 'primary';
  const buttonStyle = [
    styles.base,
    styles[variant],
    disabled && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      {...props}
    >
      {isPrimary && (
        <Image
          source={primaryBgImage}
          style={styles.primaryBgImage}
          resizeMode="cover"
        />
      )}
      {loading ? (
        <ActivityIndicator style={styles.foregroundContent} color={variant === 'secondary' ? colors.primary : colors.textLight} />
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
    minHeight: 48,
    overflow: 'hidden',
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
  primaryBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  foregroundContent: {
    zIndex: 2,
    position: 'relative',
  },
  text: {
    color: colors.textLight,
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.secondarySemiBold,
    zIndex: 2,
    position: 'relative',
  },
  secondaryText: {
    color: colors.primary,
  },
});
