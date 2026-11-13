import React, { useState, useCallback, useEffect } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Modal, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { Profile } from '../../types';
import { CreateChoreParams } from '../../services/choreService';
import { ChildMemberPicker } from './ChildMemberPicker';

interface AddChoreFormProps {
  visible: boolean;
  householdId?: string | null;
  childMembers: Profile[];
  membersLoading: boolean;
  membersError: string | null;
  onRetryMembers: () => void;
  onSubmitChore: (params: CreateChoreParams) => Promise<void>;
  onCancel: () => void;
}

function sanitizeText(value: string): string {
  return value.replace(/\0/g, '').replace(/<[^>]*>/g, '').trim();
}

export const AddChoreForm = React.memo(function AddChoreForm({
  visible,
  householdId,
  childMembers,
  membersLoading,
  membersError,
  onRetryMembers,
  onSubmitChore,
  onCancel,
}: AddChoreFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedChildId, setSelectedChildId] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (childMembers.length === 0) {
      setSelectedChildId('');
      return;
    }
    if (!childMembers.some((m) => m.id === selectedChildId)) {
      setSelectedChildId(childMembers[0].id);
    }
  }, [childMembers, selectedChildId]);

  const handleSelectChild = useCallback((id: string) => {
    setSelectedChildId(id);
    setFieldError(null);
  }, []);

  const handleTitleChange = useCallback((text: string) => {
    setTitle(text);
    setFieldError((prev) => (prev ? null : prev));
  }, []);

  const handleCancel = useCallback(() => {
    if (submitting) return;
    setFieldError(null);
    setSubmitError(null);
    onCancel();
  }, [submitting, onCancel]);

  const handleSave = useCallback(async () => {
    if (!householdId) {
      setSubmitError('No household linked to your profile yet.');
      return;
    }
    const cleanTitle = sanitizeText(title);
    const cleanDescription = sanitizeText(description);

    if (!cleanTitle) {
      setFieldError('Chore title is required.');
      return;
    }
    if (cleanTitle.length > 100) {
      setFieldError('Chore title must be 100 characters or fewer.');
      return;
    }
    if (!selectedChildId) {
      setFieldError('Please select a child to assign this chore.');
      return;
    }

    setFieldError(null);
    setSubmitError(null);
    setSubmitting(true);

    try {
      await onSubmitChore({
        householdId,
        assignedChildId: selectedChildId,
        title: cleanTitle,
        description: cleanDescription || undefined,
      });
      setTitle('');
      setDescription('');
      onCancel();
    } catch (err: unknown) {
      // Preserve inputs on failure (ux.md Rule 10)
      const message =
        err instanceof Error && err.message.trim().length > 0
          ? err.message
          : 'Could not save chore. Your inputs were kept; please try again.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }, [householdId, title, description, selectedChildId, onSubmitChore, onCancel]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.modalCard} accessibilityViewIsModal>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Household Chore</Text>
          </View>

          {!householdId ? (
            <View style={styles.unlinkedBody}>
              <Text style={styles.noticeText}>
                No household is linked to your profile yet. Create or join a family circle before assigning chores.
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleCancel} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Close add chore form">
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Chore Title</Text>
                <TextInput style={styles.input} value={title} onChangeText={handleTitleChange} placeholder="e.g., Clean study desk" placeholderTextColor={colors.textMuted} maxLength={100} editable={!submitting} accessibilityLabel="Chore title" />

                <Text style={styles.label}>Instructions (Optional)</Text>
                <TextInput style={[styles.input, styles.notesInput]} value={description} onChangeText={setDescription} placeholder="e.g., Put books away and wipe surface" placeholderTextColor={colors.textMuted} multiline maxLength={240} editable={!submitting} accessibilityLabel="Chore instructions" />

                <Text style={styles.label}>Assign to Child</Text>
                <ChildMemberPicker childMembers={childMembers} selectedChildId={selectedChildId} loading={membersLoading} error={membersError} onSelectChild={handleSelectChild} onRetry={onRetryMembers} />

                {fieldError ? <Text style={styles.errorText}>{fieldError}</Text> : null}
                {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
              </ScrollView>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={submitting} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Cancel adding chore">
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveButton, (submitting || childMembers.length === 0) && styles.disabledButton]} onPress={handleSave} disabled={submitting || childMembers.length === 0} activeOpacity={0.8} accessibilityRole="button" accessibilityLabel="Save new chore">
                  {submitting ? <ActivityIndicator size="small" color={colors.textLight} /> : <Text style={styles.saveText}>Save Chore</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, backgroundColor: 'rgba(15, 23, 42, 0.55)' },
  modalCard: { width: '100%', maxWidth: 440, maxHeight: '88%', backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  modalHeader: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background },
  modalTitle: { fontSize: typography.fontSizes.lg, fontFamily: typography.fontFamily.mainSemiBold, color: colors.text, textAlign: 'center' },
  unlinkedBody: { padding: spacing.md, gap: spacing.md },
  bodyScroll: { flexShrink: 1 },
  bodyContent: { padding: spacing.md },
  label: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryMedium, color: colors.text, marginBottom: spacing.xs, marginTop: spacing.xs },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 48, fontSize: typography.fontSizes.base, fontFamily: typography.fontFamily.secondary, color: colors.text },
  notesInput: { minHeight: 64, textAlignVertical: 'top' },
  noticeText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary, color: colors.textSecondary, lineHeight: 20 },
  errorText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryMedium, color: colors.danger, marginTop: spacing.xs },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
  closeButton: { minHeight: 48, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  cancelButton: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: colors.border, paddingHorizontal: spacing.md },
  cancelText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondarySemiBold, color: colors.textSecondary },
  saveButton: { flex: 2, minHeight: 48, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  saveText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryBold, color: colors.textLight },
  disabledButton: { opacity: 0.5 },
});
