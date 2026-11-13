import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { Profile } from '../../types';
import { CreateChoreParams } from '../../services/choreService';
import { ChildMemberPicker } from './ChildMemberPicker';

interface AddChoreFormProps {
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

  if (!householdId) {
    return (
      <View style={styles.container}>
        <Text style={styles.formTitle}>Add Household Chore</Text>
        <Text style={styles.noticeText}>
          No household is linked to your profile yet. Create or join a family circle before assigning chores.
        </Text>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Close add chore form"
        >
          <Text style={styles.cancelText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.formTitle}>Add Household Chore</Text>

      <Text style={styles.label}>Chore Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={handleTitleChange}
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
        onChangeText={setDescription}
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
        onSelectChild={handleSelectChild}
        onRetry={onRetryMembers}
      />

      {fieldError ? <Text style={styles.errorText}>{fieldError}</Text> : null}
      {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel="Cancel adding chore"
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, (submitting || childMembers.length === 0) && styles.disabledButton]}
          onPress={handleSave}
          disabled={submitting || childMembers.length === 0}
          accessibilityRole="button"
          accessibilityLabel="Save new chore"
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.textLight} />
          ) : (
            <Text style={styles.saveText}>Save Chore</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md },
  formTitle: { fontSize: typography.fontSizes.lg, fontFamily: typography.fontFamily.mainSemiBold, color: colors.primary, marginBottom: spacing.sm },
  label: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryMedium, color: colors.text, marginBottom: spacing.xs, marginTop: spacing.xs },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 48, fontSize: typography.fontSizes.base, fontFamily: typography.fontFamily.secondary, color: colors.text },
  notesInput: { minHeight: 64, textAlignVertical: 'top' },
  noticeText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary, color: colors.textSecondary, marginVertical: spacing.xs },
  errorText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryMedium, color: colors.danger, marginTop: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  cancelButton: { flex: 1, minHeight: 48, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  cancelText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondarySemiBold, color: colors.text },
  saveButton: { flex: 2, minHeight: 48, borderRadius: borderRadius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  saveText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryBold, color: colors.textLight },
  disabledButton: { opacity: 0.5 },
});
