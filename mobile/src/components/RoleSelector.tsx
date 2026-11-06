import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { UserRole } from '../types';
import { colors, spacing, borderRadius, typography } from '../theme';

const primaryBgImage = require('../../assets/Background-of-Primary-Color.png');

interface RoleSelectorProps {
  role: UserRole;
  onSelectRole: (role: UserRole) => void;
  isParentDisabled: boolean;
}

export function RoleSelector({ role, onSelectRole, isParentDisabled }: RoleSelectorProps) {
  const isParentActive = role === 'parent' && !isParentDisabled;
  const isChildActive = role === 'child';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Account Role</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.btn,
            isParentActive && styles.btnActive,
            isParentDisabled && styles.btnDisabled,
          ]}
          onPress={() => !isParentDisabled && onSelectRole('parent')}
          disabled={isParentDisabled}
          accessibilityRole="button"
          accessibilityState={{ disabled: isParentDisabled, selected: role === 'parent' }}
        >
          {isParentActive && (
            <Image
              source={primaryBgImage}
              style={styles.btnBgImage}
              resizeMode="cover"
            />
          )}
          <Text
            style={[
              styles.btnText,
              isParentActive && styles.btnTextActive,
            ]}
          >
            Parent
          </Text>
          {isParentDisabled ? <Text style={styles.badge}>Requires age 18+</Text> : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, isChildActive && styles.btnActive]}
          onPress={() => onSelectRole('child')}
          accessibilityRole="button"
          accessibilityState={{ selected: role === 'child' }}
        >
          {isChildActive && (
            <Image
              source={primaryBgImage}
              style={styles.btnBgImage}
              resizeMode="cover"
            />
          )}
          <Text style={[styles.btnText, isChildActive && styles.btnTextActive]}>Child</Text>
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
    fontFamily: typography.fontFamily.secondarySemiBold,
    fontSize: typography.fontSizes.sm,
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
    minHeight: 48,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  btnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  btnBgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  btnDisabled: {
    opacity: 0.5,
    backgroundColor: colors.border,
  },
  btnText: {
    fontFamily: typography.fontFamily.secondarySemiBold,
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  btnTextActive: {
    fontFamily: typography.fontFamily.secondaryBold,
    color: colors.textLight,
    zIndex: 2,
    position: 'relative',
  },
  badge: {
    fontFamily: typography.fontFamily.secondarySemiBold,
    fontSize: typography.fontSizes.xs,
    color: colors.danger,
    marginTop: 2,
    zIndex: 2,
    position: 'relative',
  },
});
