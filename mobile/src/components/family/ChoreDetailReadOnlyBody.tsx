import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme';
import { Chore, ChoreLockMode } from '../../types';
import { CHORE_STATUS_LABELS, formatEventDateTime } from '../calendar/calendarUtils';

export interface ChoreDetailReadOnlyBodyProps {
  chore: Chore;
  assignedLabel: string;
}

const LOCK_MODE_LABELS: Record<ChoreLockMode, string> = {
  immediate: 'Locks right away',
  offset_30m: '30 mins after start',
  offset_1h: '1 hr after start',
  offset_2h: '2 hrs after start',
  custom: 'Custom lock time',
};

function parseValidDate(iso?: string | null, fallbackIso?: string): Date {
  const candidate = new Date(iso || fallbackIso || '');
  return Number.isNaN(candidate.getTime()) ? new Date() : candidate;
}

/**
 * Strictly read-only Chore Details view for Child accounts.
 * Contains zero editable inputs or mutation actions (backed by fail-closed RLS).
 */
export const ChoreDetailReadOnlyBody = React.memo(function ChoreDetailReadOnlyBody({
  chore,
  assignedLabel,
}: ChoreDetailReadOnlyBodyProps) {
  const scheduledDate = parseValidDate(chore.scheduled_at, chore.created_at);
  const lockDate = parseValidDate(chore.lock_at, chore.scheduled_at || chore.created_at);
  const isLockUrgent =
    chore.status !== 'approved' &&
    (chore.lock_mode === 'immediate' || lockDate.getTime() <= Date.now());

  const badgeStyle =
    chore.status === 'approved'
      ? styles.badgeApproved
      : chore.status === 'awaiting_approval'
      ? styles.badgeReview
      : chore.status === 'rejected'
      ? styles.badgeRejected
      : styles.badgePending;

  const badgeTextStyle =
    chore.status === 'approved'
      ? styles.badgeApprovedText
      : chore.status === 'awaiting_approval'
      ? styles.badgeReviewText
      : chore.status === 'rejected'
      ? styles.badgeRejectedText
      : styles.badgePendingText;

  const lockDisplay =
    chore.lock_mode === 'immediate' ? 'Right Away' : formatEventDateTime(lockDate);

  const lockModeCaption = LOCK_MODE_LABELS[chore.lock_mode] ?? 'Scheduled lock';

  return (
    <ScrollView
      style={styles.bodyScroll}
      contentContainerStyle={styles.bodyContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.heroCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.eyebrow}>Assigned Task</Text>
            <View style={[styles.badge, badgeStyle]}>
              <Text style={[styles.badgeText, badgeTextStyle]}>
                {CHORE_STATUS_LABELS[chore.status]}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{chore.title}</Text>
          <Text style={styles.assignedLine}>Assigned to: {assignedLabel}</Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionLabel}>Instructions</Text>
          <Text style={chore.description ? styles.bodyText : styles.mutedBodyText}>
            {chore.description || 'No extra instructions provided for this chore.'}
          </Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionLabel}>Schedule & Phone Lock</Text>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>When to do</Text>
            <Text style={styles.metricValue}>{formatEventDateTime(scheduledDate)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Lock timing</Text>
            <Text style={styles.metricValue}>{lockModeCaption}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Phone locks</Text>
            <Text style={[styles.metricValue, isLockUrgent && styles.metricUrgent]}>
              {lockDisplay}
            </Text>
          </View>
        </View>

        <View style={styles.infoNote}>
          <Text style={styles.infoNoteText}>
            Only parents and co-parents can edit household chores.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  bodyScroll: { flex: 1 },
  bodyContent: { padding: spacing.md, paddingBottom: spacing.xl },
  container: { width: '100%', maxWidth: 640, alignSelf: 'center', gap: spacing.md },
  heroCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.xs },
  statusHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  eyebrow: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryBold, color: colors.primary },
  title: { fontSize: typography.fontSizes.xl, fontFamily: typography.fontFamily.mainBold, color: colors.text },
  assignedLine: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryMedium, color: colors.textSecondary },
  detailCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.xs },
  sectionLabel: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryBold, color: colors.primary, marginBottom: spacing.xs },
  bodyText: { fontSize: typography.fontSizes.base, fontFamily: typography.fontFamily.secondary, color: colors.text, lineHeight: 22 },
  mutedBodyText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary, color: colors.textMuted, lineHeight: 20 },
  metricRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, paddingVertical: spacing.xs },
  metricLabel: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryMedium, color: colors.textSecondary },
  metricValue: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondarySemiBold, color: colors.text, textAlign: 'right', flexShrink: 1 },
  metricUrgent: { fontFamily: typography.fontFamily.secondaryBold, color: colors.danger },
  divider: { height: 1, backgroundColor: colors.border },
  infoNote: { backgroundColor: colors.primarySoft, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.sm },
  infoNoteText: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryMedium, color: colors.primary, textAlign: 'center' },
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
});
