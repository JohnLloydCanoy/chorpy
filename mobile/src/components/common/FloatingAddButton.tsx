import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { borderRadius, colors, iconSizes, spacing } from '../../theme';

export interface FloatingAddButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
  expanded?: boolean;
  disabled?: boolean;
}

const FAB_SIZE = 56;

/**
 * Circular bottom-right primary floating action button (56x56dp)
 * with a crisp white SVG '+' icon over Chorpy Navy Blue (12.12:1 AAA contrast).
 */
export const FloatingAddButton = React.memo(function FloatingAddButton({
  onPress,
  accessibilityLabel,
  accessibilityHint,
  expanded,
  disabled = false,
}: FloatingAddButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.fab, disabled && styles.fabDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, expanded }}
    >
      <Svg
        width={iconSizes.lg}
        height={iconSizes.lg}
        viewBox="0 0 24 24"
        fill="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Path
          d="M12 5v14M5 12h14"
          stroke={colors.textLight}
          strokeWidth={2.75}
          strokeLinecap="round"
        />
      </Svg>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 20,
  },
  fabDisabled: {
    opacity: 0.5,
  },
});
