import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';

export default function MyFamilyScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Parent! 👋</Text>
          <Text style={styles.subgreeting}>Canoy Family Circle</Text>
        </View>
        <Text style={styles.pinBadge}>PIN: 482910</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Approvals</Text>
        <View style={styles.card}>
          <Text style={styles.choreTitle}>🧹 Clean Computer Desk</Text>
          <Text style={styles.childName}>Assigned to: Lloyd (Child)</Text>
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoText}>📸 Photo Proof Preview</Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.approveButton}
              accessibilityRole="button"
              accessibilityLabel="Approve chore and unlock device"
            >
              <Text style={styles.buttonText}>Approve & Unlock</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButton}
              accessibilityRole="button"
              accessibilityLabel="Reject chore photo proof"
            >
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected Devices</Text>
        <View style={styles.deviceRow}>
          <Text style={styles.deviceName}>{"📱 Lloyd's Phone (Galaxy A12)"}</Text>
          <Text style={styles.statusLocked}>LOCKED</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  greeting: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.mainBold,
    color: colors.primary,
  },
  subgreeting: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
  },
  pinBadge: {
    backgroundColor: colors.secondarySoft,
    color: colors.primary,
    fontFamily: typography.fontFamily.secondaryBold,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    fontSize: typography.fontSizes.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.mainSemiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  choreTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.mainSemiBold,
    color: colors.text,
  },
  childName: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  photoPlaceholder: {
    height: 140,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  photoText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  approveButton: {
    flex: 1,
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonText: {
    color: colors.textLight,
    fontFamily: typography.fontFamily.secondaryBold,
    fontSize: typography.fontSizes.sm,
  },
  rejectButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  rejectText: {
    color: colors.danger,
    fontFamily: typography.fontFamily.secondaryBold,
    fontSize: typography.fontSizes.sm,
  },
  deviceRow: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  deviceName: {
    fontSize: typography.fontSizes.sm,
    color: colors.text,
    fontFamily: typography.fontFamily.secondaryMedium,
  },
  statusLocked: {
    color: colors.danger,
    fontFamily: typography.fontFamily.secondaryBold,
    fontSize: typography.fontSizes.xs,
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
});
