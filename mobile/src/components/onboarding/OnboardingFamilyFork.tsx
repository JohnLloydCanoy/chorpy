import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, spacing, borderRadius, typography } from '../../theme';

const KeyIcon = React.memo(function KeyIcon() {
  return (
    <Svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx="7" cy="12" r="4" />
      <Path d="M11 12h10M17 12v4M21 12v3" />
    </Svg>
  );
});

const FamilyIcon = React.memo(function FamilyIcon() {
  return (
    <Svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx="6.5" cy="7.5" r="2.5" />
      <Path d="M2 18v-1.5a4 4 0 0 1 4-4h1" />
      <Circle cx="17.5" cy="7.5" r="2.5" />
      <Path d="M22 18v-1.5a4 4 0 0 0-4-4h-1" />
      <Circle cx="12" cy="11.5" r="2" />
      <Path d="M8.5 20v-1a3.5 3.5 0 0 1 7 0v1" />
    </Svg>
  );
});

interface OnboardingFamilyForkProps {
  onSelectJoin: () => void;
  onSelectCreate: () => void;
  onBack: () => void;
}

export function OnboardingFamilyFork({
  onSelectJoin,
  onSelectCreate,
  onBack,
}: OnboardingFamilyForkProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.stepIndicator}>Step 2 of 2: Family Setup</Text>
      <Text style={styles.heading}>Do you already have a family?</Text>
      <Text style={styles.subtitle}>
        Choose whether to join an existing family circle or create a new one
      </Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.choiceCard}
          onPress={onSelectJoin}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Yes, I already have a family"
        >
          <View style={styles.iconCircle}>
            <KeyIcon />
          </View>
          <View style={styles.choiceTextContainer}>
            <Text style={styles.choiceTitle}>Yes, I already have a family</Text>
            <Text style={styles.choiceSubtitle}>
              Join an existing circle using your 6-digit Family PIN
            </Text>
          </View>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.choiceCard}
          onPress={onSelectCreate}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="No, I dont have a family"
        >
          <View style={styles.iconCircle}>
            <FamilyIcon />
          </View>
          <View style={styles.choiceTextContainer}>
            <Text style={styles.choiceTitle}>{"No, I don't have a family"}</Text>
            <Text style={styles.choiceSubtitle}>
              Create a new household circle to assign chores and manage screen time
            </Text>
          </View>
          <Text style={styles.chevron}>→</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        <Text style={styles.backBtnText}>← Back to Account Details</Text>
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
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  optionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 72,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  choiceTextContainer: {
    flex: 1,
  },
  choiceTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.secondaryBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  choiceSubtitle: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  chevron: {
    fontSize: typography.fontSizes.lg,
    color: colors.primary,
    fontFamily: typography.fontFamily.secondaryBold,
    marginLeft: spacing.sm,
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