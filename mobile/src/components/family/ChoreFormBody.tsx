import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme';
import { ChoreLockMode, ChoreStatus, Profile } from '../../types';
import { CHORE_STATUS_LABELS } from '../calendar/calendarUtils';
import { ChildMemberPicker } from './ChildMemberPicker';
import { ChoreScheduleSection } from './ChoreScheduleSection';

export interface ChoreFormBodyProps {
  isEditMode: boolean;
  status?: ChoreStatus;
  title: string;
  description: string;
  selectedChildId: string;
  scheduledAt: Date;
  lockAt: Date;
  lockMode: ChoreLockMode;
  childMembers: Profile[];
  membersLoading: boolean;
  membersError: string | null;
  submitting: boolean;
  fieldError: string | null;
  scheduleError: string | null;
  submitError: string | null;
  onChangeTitle: (text: string) => void;
  onChangeDescription: (text: string) => void;
  onSelectChild: (id: string) => void;
  onRetryMembers: () => void;
  onChangeSchedule: (scheduledAt: Date, lockAt: Date, lockMode: ChoreLockMode) => void;
}

export const ChoreFormBody = React.memo(function ChoreFormBody({
  isEditMode,
  status,
  title,
  description,
  selectedChildId,
  scheduledAt,
  lockAt,
  lockMode,
  childMembers,
  membersLoading,
  membersError,
  submitting,
  fieldError,
  scheduleError,
  submitError,
  onChangeTitle,
  onChangeDescription,
  onSelectChild,
  onRetryMembers,
  onChangeSchedule,
}: ChoreFormBodyProps) {
  const badgeStyle =
    status === 'approved'
      ? styles.badgeApproved
      : status === 'awaiting_approval'
      ? styles.badgeReview
      : status === 'rejected'
      ? styles.badgeRejected
      : styles.badgePending;

  const badgeTextStyle =
    status === 'approved'
      ? styles.badgeApprovedText
      : status === 'awaiting_approval'
      ? styles.badgeReviewText
      : status === 'rejected'
      ? styles.badgeRejectedText
      : styles.badgePendingText;

  return (
    <ScrollView
      style={styles.bodyScroll}
      contentContainerStyle={styles.bodyContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.formContainer}>
        {isEditMode && status ? (
          <View style={styles.statusRow}>
            <Text style={styles.statusCaption}>Current Status</Text>
            <View style={[styles.badge, badgeStyle]}>
              <Text style={[styles.badgeText, badgeTextStyle]}>
                {CHORE_STATUS_LABELS[status]}
              </Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.label}>Chore Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={onChangeTitle}
          placeholder="e.g., Clean study desk"
          placeholderTextColor={colors.textMuted}
          maxLength={100}
          editable={!submitting}
          accessibilityLabel="Chore title"
        />

        <Text style={styles.label}>Instructions (Optional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={description}
          onChangeText={onChangeDescription}
          placeholder="e.g., Put books away and wipe surface"
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={240}
          editable={!submitting}
          accessibilityLabel="Chore instructions"
        />

        <Text style={styles.label}>Assign to Child</Text>
        <ChildMemberPicker
          childMembers={childMembers}
          selectedChildId={selectedChildId}
          loading={membersLoading}
          error={membersError}
          onSelectChild={onSelectChild}
          onRetry={onRetryMembers}
        />

        <ChoreScheduleSection
          scheduledAt={scheduledAt}
          lockAt={lockAt}
          lockMode={lockMode}
          disabled={submitting}
          error={scheduleError}
          onChangeSchedule={onChangeSchedule}
        />

        {fieldError ? <Text style={styles.errorText}>{fieldError}</Text> : null}
        {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  bodyScroll: { flex: 1 },
  bodyContent: { padding: spacing.md, paddingBottom: spacing.xl },
  formContainer: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.sm },
  statusCaption: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryMedium, color: colors.textSecondary },
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
  label: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryMedium, color: colors.text, marginBottom: spacing.xs, marginTop: spacing.xs },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 48, fontSize: typography.fontSizes.base, fontFamily: typography.fontFamily.secondary, color: colors.text },
  notesInput: { minHeight: 72, textAlignVertical: 'top' },
  errorText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryMedium, color: colors.danger, marginTop: spacing.sm },
});
