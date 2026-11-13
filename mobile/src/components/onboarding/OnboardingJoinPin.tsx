import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Button } from '../Button';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface OnboardingJoinPinProps {
  pin: string;
  onPinChange: (pin: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
  error?: string | null;
}

export function OnboardingJoinPin({
  pin,
  onPinChange,
  onSubmit,
  onBack,
  loading,
  error,
}: OnboardingJoinPinProps) {
  const isPinValid = pin.trim().length === 6 && /^\d{6}$/.test(pin.trim());

  return (
    <View style={styles.card}>
      <Text style={styles.stepIndicator}>Step 2 of 2: Join Family</Text>
      <Text style={styles.heading}>Enter Family PIN</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit PIN provided by your household guardian
      </Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.pinContainer}>
        <TextInput
          style={styles.pinInput}
          placeholder="••••••"
          placeholderTextColor={colors.textMuted}
          value={pin}
          onChangeText={(val) => onPinChange(val.replace(/\D/g, '').slice(0, 6))}
          keyboardType="numeric"
          maxLength={6}
          editable={!loading}
          autoFocus
        />
      </View>

      <Text style={styles.hintText}>
        Ask your parent or guardian to share their Circle PIN found in Settings.
      </Text>

      <Button
        title="Join Family & Complete Setup"
        variant="primary"
        loading={loading}
        disabled={!isPinValid || loading}
        onPress={onSubmit}
        style={styles.submitBtn}
      />

      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}
        disabled={loading}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        <Text style={styles.backBtnText}>← Choose Another Option</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepIndicator: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.secondaryBold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  heading: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.mainBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondaryMedium,
    textAlign: 'center',
  },
  pinContainer: {
    marginVertical: spacing.md,
    alignItems: 'center',
  },
  pinInput: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamily.mainBold,
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 10,
    borderWidth: 2,
    borderColor: colors.primarySoft,
    minHeight: 56,
  },
  hintText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  submitBtn: {
    marginBottom: spacing.sm,
  },
  backBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  backBtnText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondarySemiBold,
    color: colors.textSecondary,
  },
});