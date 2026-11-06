import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PasswordCriteria } from '../utils/validation';
import { colors, spacing, borderRadius } from '../theme';

interface PasswordEntropyChipsProps {
  criteria: PasswordCriteria;
}

export function PasswordEntropyChips({ criteria }: PasswordEntropyChipsProps) {
  const requirements = [
    { key: 'minLength', label: '8+ Characters', met: criteria.minLength },
    { key: 'hasUpper', label: '1 Uppercase (A-Z)', met: criteria.hasUpper },
    { key: 'hasLower', label: '1 Lowercase (a-z)', met: criteria.hasLower },
    { key: 'hasNumber', label: '1 Number (0-9)', met: criteria.hasNumber },
  ] as const;

  return (
    <View style={styles.container}>
      {requirements.map((req) => (
        <View
          key={req.key}
          style={[
            styles.chip,
            req.met ? styles.chipSuccess : styles.chipPending,
          ]}
        >
          <Text
            style={[
              styles.icon,
              req.met ? styles.iconSuccess : styles.iconPending,
            ]}
          >
            {req.met ? '✓' : '○'}
          </Text>
          <Text
            style={[
              styles.label,
              req.met ? styles.labelSuccess : styles.labelPending,
            ]}
          >
            {req.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    minHeight: 28,
  },
  chipPending: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  chipSuccess: {
    backgroundColor: colors.successSoft,
    borderColor: colors.successBorder,
  },
  icon: {
    fontSize: 11,
    fontWeight: '700',
    marginRight: spacing.xs,
  },
  iconPending: {
    color: colors.textMuted,
  },
  iconSuccess: {
    color: colors.success,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  labelPending: {
    color: colors.textSecondary,
  },
  labelSuccess: {
    color: colors.success,
  },
});
