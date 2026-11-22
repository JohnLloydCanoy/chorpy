import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, iconSizes, spacing, typography } from '../../theme';
import { Chore, ChoreStatus } from '../../types';
import { formatCompactChoreTiming } from '../../utils/choreScheduleUtils';
import { ChevronRightIcon } from '../home/HomeHeaderIcons';

export const CHORE_ROW_HEIGHT = 76;

interface ChoreRowProps {
  chore: Chore;
  assignedLabel: string;
  isPendingSync: boolean;
  canEdit?: boolean;
  onPress?: (chore: Chore) => void;
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
  canEdit = false,
  onPress,
}: ChoreRowProps) {
  const isDisabled = !onPress || isPendingSync || chore.id.startsWith('temp-');

  const handlePress = useCallback(() => {
    if (!isDisabled && onPress) {
      onPress(chore);
    }
  }, [chore, isDisabled, onPress]);

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
  const timingLabel = formatCompactChoreTiming(chore);
  const isUrgentLock = chore.lock_mode === 'immediate' && chore.status === 'pending';

  return (
    <TouchableOpacity
      style={[styles.row, isDisabled && styles.rowDisabled]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${chore.title}, assigned to ${assignedLabel}, status ${statusText}`}
      accessibilityHint={canEdit ? 'Opens chore details to edit' : 'Opens chore details'}
      accessibilityState={{ disabled: isDisabled }}
    >
      <View style={styles.colTitle}>
        <Text style={styles.rowTitle} numberOfLines={1}>{chore.title}</Text>
        {chore.description ? (
          <Text style={styles.rowSub} numberOfLines={1}>{chore.description}</Text>
        ) : null}
        <Text style={[styles.rowTiming, isUrgentLock && styles.rowTimingUrgent]} numberOfLines={1}>
          {timingLabel}
        </Text>
      </View>
      <Text style={styles.colChild} numberOfLines={1}>{assignedLabel}</Text>
      <View style={styles.colStatus}>
        <View style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, badgeTextStyle]} numberOfLines={1}>{statusText}</Text>
        </View>
        {onPress ? <ChevronRightIcon size={iconSizes.sm} color={colors.textMuted} /> : null}
      </View>
    </TouchableOpacity>
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
    backgroundColor: colors.surface,
  },
  rowDisabled: {
    opacity: 0.65,
  },
  colTitle: { flex: 2, paddingRight: spacing.sm },
  colChild: {
    flex: 1.1,
    paddingRight: spacing.sm,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
  },
  colStatus: {
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  rowTitle: { fontSize: typography.fontSizes.base, fontFamily: typography.fontFamily.mainSemiBold, color: colors.text },
  rowSub: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondary, color: colors.textSecondary, marginTop: 2 },
  rowTiming: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryMedium, color: colors.primary, marginTop: 2 },
  rowTimingUrgent: { fontFamily: typography.fontFamily.secondaryBold, color: colors.danger },
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
