import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { FlyingBirdIllustration } from '../components/common/FlyingBirdIllustration';
import { colors, spacing, borderRadius, typography } from '../theme';

const primaryBgImage = require('../../assets/Background-of-Primary-Color.png');

interface AppLoaderScreenProps {
  message?: string;
  subMessage?: string;
  error?: string | null;
  onRetry?: () => void;
  // TODO(remove-after-testing): Temporary Demo Splash preview props
  demoStatusText?: string;
  onExitDemo?: () => void;
}

export default function AppLoaderScreen({
  message = 'Getting Data...',
  subMessage = 'Checking session and syncing your profile...',
  error = null,
  onRetry,
  demoStatusText,
  onExitDemo,
}: AppLoaderScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <FlyingBirdIllustration />
        <Text style={styles.title}>Chorpy</Text>
        <Text style={styles.subtitle}>Household Chore & Digital Wellbeing</Text>

        {error ? (
          <View style={styles.errorBox}>
            <View style={styles.errorBadge}>
              <Text style={styles.errorBadgeText}>!</Text>
            </View>
            <Text style={styles.errorTitle}>Connection Notice</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            {onRetry ? (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={onRetry}
                accessibilityRole="button"
                accessibilityLabel="Retry connection to Supabase"
              >
                <Image source={primaryBgImage} style={styles.retryButtonBgImage} resizeMode="cover" />
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
            <Text style={styles.loadingMessage}>{message}</Text>
            {subMessage ? <Text style={styles.subMessage}>{subMessage}</Text> : null}

            {demoStatusText ? (
              <View style={styles.demoStatusBox} accessibilityLiveRegion="polite">
                <Text style={styles.demoStatusText}>{demoStatusText}</Text>
              </View>
            ) : null}

            {onExitDemo ? (
              <TouchableOpacity
                style={styles.exitDemoButton}
                onPress={onExitDemo}
                accessibilityRole="button"
                accessibilityLabel="Exit splash screen demo"
              >
                <Text style={styles.exitDemoText}>Exit Demo</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  content: { width: '100%', maxWidth: 340, alignItems: 'center' },
  title: { fontFamily: typography.fontFamily.mainBold, fontSize: typography.fontSizes.display, color: colors.primary, marginBottom: spacing.xs, letterSpacing: -0.5 },
  subtitle: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.xl, textAlign: 'center' },
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
  spinner: { marginBottom: spacing.md },
  loadingMessage: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.lg, color: colors.text, marginBottom: spacing.xs, textAlign: 'center' },
  subMessage: { fontFamily: typography.fontFamily.secondary, fontSize: typography.fontSizes.xs, color: colors.textSecondary, textAlign: 'center' },
  demoStatusBox: {
    marginTop: spacing.md,
    backgroundColor: colors.secondarySoft,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    width: '100%',
  },
  demoStatusText: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: typography.fontSizes.xs, color: colors.primary, textAlign: 'center' },
  exitDemoButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    minHeight: 48,
    minWidth: 140,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitDemoText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.sm, color: colors.primary },
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
  errorBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  errorBadgeText: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.base, color: colors.textLight },
  errorTitle: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.base, color: colors.danger, marginBottom: spacing.xs },
  errorMessage: { fontFamily: typography.fontFamily.secondary, fontSize: typography.fontSizes.xs, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    minHeight: 48,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  retryButtonBgImage: { position: 'absolute', top: 0, left: '-6%', right: '-6%', bottom: 0, width: '112%', height: '100%', zIndex: 1 },
  retryButtonText: { fontFamily: typography.fontFamily.secondaryBold, color: colors.textLight, fontSize: typography.fontSizes.sm, zIndex: 2, position: 'relative' },
});
