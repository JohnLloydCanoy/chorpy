import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

interface AppLoaderScreenProps {
  message?: string;
  subMessage?: string;
  error?: string | null;
  onRetry?: () => void;
}

export default function AppLoaderScreen({
  message = 'Getting Data...',
  subMessage = 'Checking session and syncing your profile...',
  error = null,
  onRetry,
}: AppLoaderScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Chorpy the Maya Mascot Anchor */}
        <Text style={styles.mascot}>🐦</Text>
        <Text style={styles.title}>Chorpy</Text>
        <Text style={styles.subtitle}>Household Chore & Digital Wellbeing</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Connection Notice</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            {onRetry && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={onRetry}
                accessibilityRole="button"
                accessibilityLabel="Retry connection to Supabase"
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
            <Text style={styles.loadingMessage}>{message}</Text>
            {subMessage ? <Text style={styles.subMessage}>{subMessage}</Text> : null}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  mascot: {
    fontSize: 56,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  loaderBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  spinner: {
    marginBottom: spacing.md,
  },
  loadingMessage: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subMessage: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  errorIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
    marginBottom: spacing.xs,
  },
  errorMessage: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    minHeight: 48,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: colors.textLight,
    fontWeight: '700',
    fontSize: 14,
  },
});
