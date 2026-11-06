import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface DeveloperQuickPreviewProps {
  onDemoLogin?: (role?: 'parent' | 'child') => void;
  disabled?: boolean;
}

export function DeveloperQuickPreview({ onDemoLogin, disabled }: DeveloperQuickPreviewProps) {
  if (!onDemoLogin) return null;

  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <Text style={styles.label}>Developer Quick Preview</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => onDemoLogin('parent')}
          disabled={disabled}
          accessibilityRole="button"
        >
          <Text style={styles.btnText}>Preview as Parent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => onDemoLogin('child')}
          disabled={disabled}
          accessibilityRole="button"
        >
          <Text style={styles.btnText}>Preview as Child</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.secondaryBold,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryLight,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondaryBold,
    color: colors.primary,
  },
});
