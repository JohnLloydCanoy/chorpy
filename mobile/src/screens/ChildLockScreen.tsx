import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

const primaryBgImage = require('../../assets/Background-of-Primary-Color.png');

export default function ChildLockScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.lockIcon}>🔒</Text>
      <Text style={styles.title}>Device Locked</Text>
      <Text style={styles.subtitle}>Complete your assigned chore to unlock screen time</Text>

      <View style={styles.choreCard}>
        <Text style={styles.badge}>PENDING CHORE</Text>
        <Text style={styles.choreTitle}>🧹 Clean Computer Desk</Text>
        <Text style={styles.choreDesc}>Wipe the desk surface and arrange keyboard and cords.</Text>
      </View>

      <TouchableOpacity
        style={styles.cameraButton}
        accessibilityRole="button"
        accessibilityLabel="Take photo proof of completed chore"
      >
        <Image
          source={primaryBgImage}
          style={styles.cameraButtonBgImage}
          resizeMode="cover"
        />
        <Text style={styles.cameraButtonText}>📸 Take Photo Proof</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>Screen will automatically unlock once approved by Parent</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 54,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamily.mainBold,
    color: colors.background,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  choreCard: {
    backgroundColor: colors.surfaceCardDark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  badge: {
    color: colors.warning,
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.secondaryBold,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  choreTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fontFamily.mainBold,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  choreDesc: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondary,
    color: colors.border,
    lineHeight: 18,
  },
  cameraButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    minHeight: 48,
    overflow: 'hidden',
  },
  cameraButtonBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  cameraButtonText: {
    color: colors.textLight,
    fontFamily: typography.fontFamily.secondaryBold,
    fontSize: typography.fontSizes.base,
    zIndex: 2,
    position: 'relative',
  },
  hint: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
