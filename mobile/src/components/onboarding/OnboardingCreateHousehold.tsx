import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Button } from '../Button';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface OnboardingCreateHouseholdProps {
  householdName: string;
  numChildren: number;
  numCoParents: number;
  onHouseholdNameChange: (name: string) => void;
  onNumChildrenChange: (num: number) => void;
  onNumCoParentsChange: (num: number) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
  error?: string | null;
}

export function OnboardingCreateHousehold({
  householdName,
  numChildren,
  numCoParents,
  onHouseholdNameChange,
  onNumChildrenChange,
  onNumCoParentsChange,
  onSubmit,
  onBack,
  loading,
  error,
}: OnboardingCreateHouseholdProps) {
  const isFormValid = householdName.trim().length > 0;

  return (
    <View style={styles.card}>
      <Text style={styles.stepIndicator}>Step 2 of 2: Create Household</Text>
      <Text style={styles.heading}>Create Your Household</Text>
      <Text style={styles.subtitle}>Set up your family circle to manage chores and screen time</Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Household Circle Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Canoy Family Circle"
        placeholderTextColor={colors.textMuted}
        value={householdName}
        onChangeText={onHouseholdNameChange}
        autoCapitalize="words"
        editable={!loading}
      />

      <View style={styles.stepperSection}>
        <View style={styles.stepperRow}>
          <View style={styles.stepperInfo}>
            <Text style={styles.stepperLabel}>Number of Children</Text>
            <Text style={styles.stepperHint}>Profiles receiving chore assignments</Text>
          </View>
          <View style={styles.stepperControls}>
            <TouchableOpacity
              style={[styles.stepperBtn, numChildren <= 1 && styles.stepperBtnDisabled]}
              onPress={() => onNumChildrenChange(Math.max(1, numChildren - 1))}
              disabled={numChildren <= 1 || loading}
              accessibilityRole="button"
              accessibilityLabel="Decrease number of children"
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{numChildren}</Text>
            <TouchableOpacity
              style={[styles.stepperBtn, numChildren >= 20 && styles.stepperBtnDisabled]}
              onPress={() => onNumChildrenChange(Math.min(20, numChildren + 1))}
              disabled={numChildren >= 20 || loading}
              accessibilityRole="button"
              accessibilityLabel="Increase number of children"
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stepperRow}>
          <View style={styles.stepperInfo}>
            <Text style={styles.stepperLabel}>Number of Co-parents</Text>
            <Text style={styles.stepperHint}>Guardians who can approve chores</Text>
          </View>
          <View style={styles.stepperControls}>
            <TouchableOpacity
              style={[styles.stepperBtn, numCoParents <= 0 && styles.stepperBtnDisabled]}
              onPress={() => onNumCoParentsChange(Math.max(0, numCoParents - 1))}
              disabled={numCoParents <= 0 || loading}
              accessibilityRole="button"
              accessibilityLabel="Decrease number of co-parents"
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{numCoParents}</Text>
            <TouchableOpacity
              style={[styles.stepperBtn, numCoParents >= 10 && styles.stepperBtnDisabled]}
              onPress={() => onNumCoParentsChange(Math.min(10, numCoParents + 1))}
              disabled={numCoParents >= 10 || loading}
              accessibilityRole="button"
              accessibilityLabel="Increase number of co-parents"
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Button
        title="Create Family & Complete Setup"
        variant="primary"
        loading={loading}
        disabled={!isFormValid || loading}
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
  card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border },
  stepIndicator: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryBold, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  heading: { fontSize: typography.fontSizes.xl, fontFamily: typography.fontFamily.mainBold, color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary, color: colors.textSecondary, marginBottom: spacing.md, lineHeight: 20 },
  errorBox: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder, borderWidth: 1, borderRadius: borderRadius.sm, padding: spacing.sm, marginBottom: spacing.md },
  errorText: { color: colors.danger, fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryMedium, textAlign: 'center' },
  label: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondarySemiBold, color: colors.text, marginBottom: spacing.xs },
  input: { backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.fontSizes.base, fontFamily: typography.fontFamily.secondary, color: colors.text, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border, minHeight: 48 },
  stepperSection: { gap: spacing.md, marginBottom: spacing.lg },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border },
  stepperInfo: { flex: 1, paddingRight: spacing.sm },
  stepperLabel: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryBold, color: colors.text },
  stepperHint: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondary, color: colors.textSecondary, marginTop: 2 },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepperBtn: { width: 36, height: 36, borderRadius: borderRadius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepperBtnDisabled: { opacity: 0.35 },
  stepperBtnText: { fontSize: typography.fontSizes.lg, fontFamily: typography.fontFamily.secondaryBold, color: colors.primary, lineHeight: 22 },
  stepperValue: { fontSize: typography.fontSizes.base, fontFamily: typography.fontFamily.secondaryBold, color: colors.text, minWidth: 24, textAlign: 'center' },
  submitBtn: { marginBottom: spacing.sm },
  backBtn: { paddingVertical: spacing.sm, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  backBtnText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondarySemiBold, color: colors.textSecondary },
});
