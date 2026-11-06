import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { UserRole } from '../types';
import { colors, spacing, borderRadius } from '../theme';

interface RoleSelectorProps {
  role: UserRole;
  onSelectRole: (role: UserRole) => void;
  isParentDisabled: boolean;
}

export function RoleSelector({ role, onSelectRole, isParentDisabled }: RoleSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Account Role</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.btn,
            role === 'parent' && !isParentDisabled && styles.btnActive,
            isParentDisabled && styles.btnDisabled,
          ]}
          onPress={() => !isParentDisabled && onSelectRole('parent')}
          disabled={isParentDisabled}
          accessibilityRole="button"
          accessibilityState={{ disabled: isParentDisabled, selected: role === 'parent' }}
        >
          <Text
            style={[
              styles.btnText,
              role === 'parent' && !isParentDisabled && styles.btnTextActive,
            ]}
          >
            Parent
          </Text>
          {isParentDisabled ? <Text style={styles.badge}>Requires age 18+</Text> : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, role === 'child' && styles.btnActive]}
          onPress={() => onSelectRole('child')}
          accessibilityRole="button"
          accessibilityState={{ selected: role === 'child' }}
        >
          <Text style={[styles.btnText, role === 'child' && styles.btnTextActive]}>Child</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  btn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.background,
    minHeight: 44,
    justifyContent: 'center',
  },
  btnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  btnDisabled: {
    opacity: 0.5,
    backgroundColor: colors.border,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  btnTextActive: {
    color: colors.textLight,
  },
  badge: {
    fontSize: 10,
    color: colors.danger,
    fontWeight: '700',
    marginTop: 2,
  },
});
