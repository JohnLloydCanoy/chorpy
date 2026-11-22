import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChoreSheetMode } from '../../hooks/useChoreSheetState';
import { CreateChoreParams, UpdateChoreParams } from '../../services/choreService';
import { borderRadius, colors, spacing, typography } from '../../theme';
import { Chore, ChoreLockMode, Profile, UserRole } from '../../types';
import {
  ChoreScheduleState,
  createDefaultChoreSchedule,
  createScheduleFromChore,
  validateChoreSchedule,
} from '../../utils/choreScheduleUtils';
import { SlideUpPage } from '../common/SlideUpPage';
import { ChoreDetailReadOnlyBody } from './ChoreDetailReadOnlyBody';
import { ChoreFormBody } from './ChoreFormBody';

export interface AddChoreFormProps {
  visible: boolean;
  mode?: ChoreSheetMode;
  role?: UserRole;
  chore?: Chore | null;
  assignedLabel?: string;
  initialScheduledAt?: Date | null;
  openSessionKey?: number;
  householdId?: string | null;
  childMembers: Profile[];
  membersLoading: boolean;
  membersError: string | null;
  onRetryMembers: () => void;
  onSubmitChore?: (params: CreateChoreParams) => Promise<void>;
  onUpdateChore?: (params: UpdateChoreParams) => Promise<void>;
  onCancel: () => void;
}

function sanitizeText(value: string): string {
  return value.replace(/\0/g, '').replace(/<[^>]*>/g, '').trim();
}

export const AddChorePageContent = React.memo(function AddChorePageContent({
  visible, mode = 'create', role = 'parent', chore = null, assignedLabel,
  initialScheduledAt, openSessionKey, householdId, childMembers, membersLoading,
  membersError, onRetryMembers, onSubmitChore, onUpdateChore, onCancel,
}: AddChoreFormProps) {
  const resolvedMode: ChoreSheetMode = role !== 'parent' ? 'view' : mode;
  const isEditMode = resolvedMode === 'edit' && Boolean(chore);

  const [title, setTitle] = useState(() => (isEditMode && chore ? chore.title : ''));
  const [description, setDescription] = useState(() => (isEditMode && chore ? chore.description ?? '' : ''));
  const [selectedChildId, setSelectedChildId] = useState(() => (isEditMode && chore ? chore.assigned_child_id : ''));
  const [schedule, setSchedule] = useState<ChoreScheduleState>(() =>
    isEditMode && chore ? createScheduleFromChore(chore) : createDefaultChoreSchedule(initialScheduledAt ?? undefined)
  );
  const [scheduleTouched, setScheduleTouched] = useState(false);
  const [prevVisible, setPrevVisible] = useState(visible);
  const [prevSessionKey, setPrevSessionKey] = useState(openSessionKey);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (visible !== prevVisible || openSessionKey !== prevSessionKey) {
    setPrevVisible(visible);
    setPrevSessionKey(openSessionKey);
    if (visible) {
      setTitle(isEditMode && chore ? chore.title : '');
      setDescription(isEditMode && chore ? chore.description ?? '' : '');
      setSelectedChildId(isEditMode && chore ? chore.assigned_child_id : '');
      setSchedule(
        isEditMode && chore ? createScheduleFromChore(chore) : createDefaultChoreSchedule(initialScheduledAt ?? undefined)
      );
      setScheduleTouched(false);
      setFieldError(null);
      setScheduleError(null);
      setSubmitError(null);
    }
  }

  const effectiveSelectedChildId = useMemo(() => {
    if (selectedChildId && childMembers.some((m) => m.id === selectedChildId)) return selectedChildId;
    if (membersLoading && selectedChildId) return selectedChildId;
    return childMembers[0]?.id ?? '';
  }, [childMembers, membersLoading, selectedChildId]);

  const handleSelectChild = useCallback((id: string) => {
    setSelectedChildId(id);
    setFieldError(null);
  }, []);

  const handleTitleChange = useCallback((text: string) => {
    setTitle(text);
    setFieldError((prev) => (prev ? null : prev));
  }, []);

  const handleScheduleChange = useCallback(
    (scheduledAt: Date, lockAt: Date, lockMode: ChoreLockMode) => {
      setSchedule({ scheduledAt, lockAt, lockMode });
      setScheduleTouched(true);
      setScheduleError(null);
    },
    []
  );

  const handleCancel = useCallback(() => {
    if (submitting) return;
    setFieldError(null);
    setScheduleError(null);
    setSubmitError(null);
    onCancel();
  }, [submitting, onCancel]);

  const handleSave = useCallback(async () => {
    if (role !== 'parent') return;
    if (!householdId) { setSubmitError('No household linked to your profile yet.'); return; }
    const cleanTitle = sanitizeText(title);
    const cleanDescription = sanitizeText(description);
    if (!cleanTitle) { setFieldError('Chore title is required.'); return; }
    if (cleanTitle.length > 100) { setFieldError('Chore title must be 100 characters or fewer.'); return; }
    if (!effectiveSelectedChildId) { setFieldError('Please select a child to assign this chore.'); return; }

    const timingError = validateChoreSchedule(schedule.scheduledAt, schedule.lockAt, schedule.lockMode);
    if (timingError) { setScheduleError(timingError); return; }

    setFieldError(null);
    setScheduleError(null);
    setSubmitError(null);
    setSubmitting(true);

    try {
      const now = new Date();
      const shouldSnapImmediate = schedule.lockMode === 'immediate' && (!isEditMode || scheduleTouched);
      const effectiveScheduled = shouldSnapImmediate ? now : schedule.scheduledAt;
      const effectiveLock = shouldSnapImmediate ? now : schedule.lockAt;

      if (isEditMode && chore && onUpdateChore) {
        await onUpdateChore({
          choreId: chore.id, householdId, assignedChildId: effectiveSelectedChildId,
          title: cleanTitle, description: cleanDescription || null,
          scheduledAt: effectiveScheduled.toISOString(), lockAt: effectiveLock.toISOString(), lockMode: schedule.lockMode,
        });
      } else if (onSubmitChore) {
        await onSubmitChore({
          householdId, assignedChildId: effectiveSelectedChildId,
          title: cleanTitle, description: cleanDescription || undefined,
          scheduledAt: effectiveScheduled.toISOString(), lockAt: effectiveLock.toISOString(), lockMode: schedule.lockMode,
        });
        setTitle('');
        setDescription('');
      }
      onCancel();
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message.trim().length > 0
          ? err.message
          : 'Could not save chore. Your inputs were kept; please try again.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }, [
    role, householdId, title, description, effectiveSelectedChildId, schedule,
    isEditMode, scheduleTouched, chore, onUpdateChore, onSubmitChore, onCancel,
  ]);

  const pageTitle = resolvedMode === 'view' ? 'Chore Details' : isEditMode ? 'Edit Household Chore' : 'Add Household Chore';
  const saveLabel = isEditMode ? 'Save Changes' : 'Save Chore';

  const footerNode =
    resolvedMode === 'view' ? (
      <View style={styles.footerInner}>
        <TouchableOpacity style={styles.closeFooterButton} onPress={handleCancel} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Close chore details">
          <Text style={styles.closeFooterText}>Close</Text>
        </TouchableOpacity>
      </View>
    ) : householdId ? (
      <View style={styles.footerInner}>
        <TouchableOpacity
          style={[styles.saveButton, (submitting || childMembers.length === 0) && styles.disabledButton]}
          onPress={handleSave}
          disabled={submitting || childMembers.length === 0}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={saveLabel}
        >
          {submitting ? <ActivityIndicator size="small" color={colors.textLight} /> : <Text style={styles.saveText}>{saveLabel}</Text>}
        </TouchableOpacity>
      </View>
    ) : null;

  return (
    <SlideUpPage visible={visible} title={pageTitle} onClose={handleCancel} disableClose={submitting} footer={footerNode}>
      {resolvedMode === 'view' && chore ? (
        <ChoreDetailReadOnlyBody chore={chore} assignedLabel={assignedLabel || 'Assigned Child'} />
      ) : !householdId ? (
        <View style={styles.unlinkedContainer}>
          <View style={styles.unlinkedCard}>
            <Text style={styles.noticeTitle}>No Household Linked</Text>
            <Text style={styles.noticeText}>Create or join a family circle in Settings before assigning household chores.</Text>
          </View>
        </View>
      ) : (
        <ChoreFormBody
          isEditMode={isEditMode} status={chore?.status} title={title} description={description}
          selectedChildId={effectiveSelectedChildId} scheduledAt={schedule.scheduledAt}
          lockAt={schedule.lockAt} lockMode={schedule.lockMode} childMembers={childMembers}
          membersLoading={membersLoading} membersError={membersError} submitting={submitting}
          fieldError={fieldError} scheduleError={scheduleError} submitError={submitError}
          onChangeTitle={handleTitleChange} onChangeDescription={setDescription}
          onSelectChild={handleSelectChild} onRetryMembers={onRetryMembers} onChangeSchedule={handleScheduleChange}
        />
      )}
    </SlideUpPage>
  );
});

const styles = StyleSheet.create({
  unlinkedContainer: { flex: 1, padding: spacing.md, justifyContent: 'center', alignItems: 'center' },
  unlinkedCard: { width: '100%', maxWidth: 440, backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.xs },
  noticeTitle: { fontSize: typography.fontSizes.lg, fontFamily: typography.fontFamily.mainSemiBold, color: colors.primary },
  noticeText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary, color: colors.textSecondary, lineHeight: 20 },
  footerInner: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  saveButton: { width: '100%', minHeight: 48, backgroundColor: colors.primary, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  saveText: { fontSize: typography.fontSizes.base, fontFamily: typography.fontFamily.secondaryBold, color: colors.textLight },
  closeFooterButton: { width: '100%', minHeight: 48, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primary, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  closeFooterText: { fontSize: typography.fontSizes.base, fontFamily: typography.fontFamily.secondaryBold, color: colors.primary },
  disabledButton: { opacity: 0.5 },
});
