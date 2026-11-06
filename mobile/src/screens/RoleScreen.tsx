import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

export default function RoleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.mascot}>🐦</Text>
      <Text style={styles.title}>Who is using this phone?</Text>
      <Text style={styles.subtitle}>Select your role to set up this device</Text>

      <TouchableOpacity
        style={styles.roleCard}
        accessibilityRole="button"
        accessibilityLabel="Select Parent role"
      >
        <Text style={styles.roleIcon}>👨‍👩‍👧</Text>
        <View style={styles.roleInfo}>
          <Text style={styles.roleTitle}>I am a Parent</Text>
          <Text style={styles.roleDescription}>
            Manage chores, approve photo proof, and control device locks.
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.roleCard}
        accessibilityRole="button"
        accessibilityLabel="Select Child role"
      >
        <Text style={styles.roleIcon}>🧒</Text>
        <View style={styles.roleInfo}>
          <Text style={styles.roleTitle}>I am a Child</Text>
          <Text style={styles.roleDescription}>
            Complete chores, submit photos, and earn screen time.
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  mascot: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamily.mainBold,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 48,
  },
  roleIcon: {
    fontSize: 36,
    marginRight: spacing.md,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.mainBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  roleDescription: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
