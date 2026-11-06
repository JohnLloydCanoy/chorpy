import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

interface HomeScreenProps {
  role: 'parent' | 'child';
  dbStatus: 'checking' | 'connected' | 'error';
  statusMessage: string;
}

export default function HomeScreen({ role, dbStatus, statusMessage }: HomeScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.mascot}>🐦</Text>
      <Text style={styles.title}>Chorpy Dashboard</Text>
      <Text style={styles.subtitle}>Household Chore & Digital Wellbeing System</Text>

      <View style={styles.roleCard}>
        <Text style={styles.roleLabel}>CURRENT ACTIVE ROLE</Text>
        <Text style={styles.roleValue}>{role.toUpperCase()}</Text>
        <Text style={styles.roleHint}>
          {role === 'parent'
            ? 'You have authority to assign chores and approve photo proof.'
            : 'Complete mandatory chores to unlock your device screen time.'}
        </Text>
      </View>

      <View
        style={[
          styles.statusCard,
          dbStatus === 'connected'
            ? styles.statusOk
            : dbStatus === 'error'
            ? styles.statusError
            : styles.statusLoading,
        ]}
      >
        {dbStatus === 'checking' && (
          <ActivityIndicator color={colors.primary} style={styles.statusSpinner} />
        )}
        <Text style={styles.statusText}>
          {dbStatus === 'connected'
            ? '● Supabase Connected'
            : dbStatus === 'error'
            ? '✕ Connection Issue'
            : 'Connecting to Supabase...'}
        </Text>
        <Text style={styles.statusDetail}>{statusMessage}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  mascot: {
    fontSize: 54,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamily.mainBold,
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.secondaryBold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  roleValue: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.mainBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  roleHint: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  statusCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
  },
  statusSpinner: {
    marginBottom: spacing.xs,
  },
  statusLoading: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
  },
  statusOk: {
    backgroundColor: colors.successSoft,
    borderColor: colors.successBorder,
  },
  statusError: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerBorder,
  },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondaryBold,
    color: colors.text,
    marginBottom: 2,
  },
  statusDetail: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
