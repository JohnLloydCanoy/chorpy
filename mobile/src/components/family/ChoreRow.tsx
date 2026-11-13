import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { Chore, ChoreStatus } from '../../types';

export const CHORE_ROW_HEIGHT = 68;

interface ChoreRowProps {
  chore: Chore;
  assignedLabel: string;
  isPendingSync: boolean;
}

const STATUS_LABELS: Record<ChoreStatus, string> = {
  pending: 'Pending',
  awaiting_approval: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const ChoreRow = React.memo(function ChoreRow({
  chore,
  assignedLabel,
  isPendingSync,
}: ChoreRowProps) {
  const badgeStyle = isPendingSync
    ? styles.badgeSync
    : chore.status === 'approved'
    ? styles.badgeApproved
    : chore.status === 'awaiting_approval'
    ? styles.badgeReview
    : chore.status === 'rejected'
    ? styles.badgeRejected
    : styles.badgePending;

  const badgeTextStyle = isPendingSync
    ? styles.badgeSyncText
    : chore.status === 'approved'
    ? styles.badgeApprovedText
    : chore.status === 'awaiting_approval'
    ? styles.badgeReviewText
    : chore.status === 'rejected'
    ? styles.badgeRejectedText
    : styles.badgePendingText;

  const statusText = isPendingSync ? 'Saving' : STATUS_LABELS[chore.status];

  return (
    <View style={styles.row}>
      <View style={styles.colTitle}>
        <Text style={styles.rowTitle} numberOfLines={1}>{chore.title}</Text>
        {chore.description ? (
          <Text style={styles.rowSub} numberOfLines={1}>{chore.description}</Text>
        ) : null}
      </View>
      <Text style={styles.colChild} numberOfLines={1}>{assignedLabel}</Text>
      <View style={styles.colStatus}>
        <View style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, badgeTextStyle]} numberOfLines={1}>{statusText}</Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    height: CHORE_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  colTitle: { flex: 2, paddingRight: spacing.sm },
  colChild: {
    flex: 1.2,
    paddingRight: spacing.sm,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
  },
  colStatus: { flex: 1, alignItems: 'flex-end' },
  rowTitle: { fontSize: typography.fontSizes.base, fontFamily: typography.fontFamily.mainSemiBold, color: colors.text },
  rowSub: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondary, color: colors.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  badgeText: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryBold },
  badgePending: { backgroundColor: colors.warningSoft },
  badgePendingText: { color: colors.text },
  badgeReview: { backgroundColor: colors.secondarySoft },
  badgeReviewText: { color: colors.primary },
  badgeApproved: { backgroundColor: colors.successSoft },
  badgeApprovedText: { color: colors.success },
  badgeRejected: { backgroundColor: colors.dangerSoft },
  badgeRejectedText: { color: colors.danger },
  badgeSync: { backgroundColor: colors.primarySoft },
  badgeSyncText: { color: colors.primary },
});
