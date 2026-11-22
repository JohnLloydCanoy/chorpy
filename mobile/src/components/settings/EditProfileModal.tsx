import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, BackHandler, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme';
import { Profile } from '../../types';
import { UpdateProfileParams } from '../../services/authService';
import { DobWheelPicker } from '../onboarding/DobWheelPicker';
import { calculateAgeFromDOB, formatE164Phone, formatTitleCase } from '../../utils/validation';
import { ProfileFieldErrors, validateProfileUpdate } from '../../utils/profileValidation';

export interface EditProfileModalProps {
  visible: boolean;
  profile: Profile | null;
  emailFallback: string | null;
  onClose: () => void;
  onSave: (payload: UpdateProfileParams) => Promise<void>;
}

export const EditProfileModal = React.memo(function EditProfileModal({
  visible, profile, emailFallback, onClose, onSave,
}: EditProfileModalProps) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [ageText, setAgeText] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setFullName(profile?.full_name ?? '');
    setPhoneNumber(profile?.phone_number ?? '');
    setDateOfBirth(profile?.date_of_birth ?? '');
    setAgeText(typeof profile?.age === 'number' ? String(profile.age) : '');
    setFieldErrors({});
    setSubmitError(null);
    setIsSaving(false);
  }, [visible, profile]);

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isSaving) onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, isSaving, onClose]);

  const phonePreview = useMemo(() => {
    const trimmed = phoneNumber.trim();
    if (!trimmed) return null;
    const res = formatE164Phone(trimmed);
    return res.isValid ? res.formatted : null;
  }, [phoneNumber]);

  const handleNameBlur = useCallback(() => {
    setFullName((prev) => formatTitleCase(prev));
  }, []);

  const handleDobChange = useCallback((nextDob: string) => {
    setDateOfBirth(nextDob);
    const calc = calculateAgeFromDOB(nextDob);
    if (calc.isValidDate && calc.age !== null) {
      setAgeText(String(calc.age));
      setFieldErrors((prev) => ({ ...prev, dateOfBirth: undefined, ageText: undefined }));
    }
  }, []);

  const handleAgeChange = useCallback((raw: string) => {
    setAgeText(raw.replace(/\D/g, '').slice(0, 3));
  }, []);

  const handleSavePress = useCallback(async () => {
    const check = validateProfileUpdate({ fullName, phoneNumber, dateOfBirth, ageText });
    if (!check.isValid || !check.payload) {
      setFieldErrors(check.fieldErrors);
      setSubmitError(check.formError);
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    setIsSaving(true);
    try {
      await onSave(check.payload);
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message.trim().length > 0
          ? err.message
          : 'Unable to save profile changes. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSaving(false);
    }
  }, [fullName, phoneNumber, dateOfBirth, ageText, onSave]);

  if (!visible) return null;

  const lockedEmail = profile?.email || emailFallback || 'Not registered';

  return (
    <View style={styles.overlayBackdrop} accessibilityViewIsModal>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.sheetCard}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Edit Profile</Text>
            <Text style={styles.sheetSubtitle}>Update your personal details below</Text>
          </View>

          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {submitError ? (
              <View style={styles.errorBanner} accessibilityLiveRegion="polite">
                <Text style={styles.errorBannerText}>{submitError}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, fieldErrors.fullName ? styles.inputError : null]}
              value={fullName}
              onChangeText={setFullName}
              onBlur={handleNameBlur}
              editable={!isSaving}
              autoCapitalize="words"
              placeholder="Enter your full name"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Full Name"
            />
            {fieldErrors.fullName ? <Text style={styles.fieldError}>{fieldErrors.fullName}</Text> : null}

            <Text style={styles.label}>Phone Number (Optional)</Text>
            <TextInput
              style={[styles.input, fieldErrors.phoneNumber ? styles.inputError : null]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              editable={!isSaving}
              keyboardType="phone-pad"
              placeholder="e.g. 09171234567"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Phone Number"
            />
            {phonePreview ? <Text style={styles.previewHint}>Standardized: {phonePreview}</Text> : null}
            {fieldErrors.phoneNumber ? <Text style={styles.fieldError}>{fieldErrors.phoneNumber}</Text> : null}

            <Text style={styles.label}>Date of Birth</Text>
            <DobWheelPicker
              value={dateOfBirth}
              onChange={handleDobChange}
              hasError={Boolean(fieldErrors.dateOfBirth)}
            />
            {fieldErrors.dateOfBirth ? <Text style={styles.fieldError}>{fieldErrors.dateOfBirth}</Text> : null}

            <Text style={styles.label}>Age</Text>
            <TextInput
              style={[styles.input, fieldErrors.ageText ? styles.inputError : null]}
              value={ageText}
              onChangeText={handleAgeChange}
              editable={!isSaving}
              keyboardType="number-pad"
              maxLength={3}
              placeholder="Autofilled from Date of Birth"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel="Age"
            />
            {fieldErrors.ageText ? <Text style={styles.fieldError}>{fieldErrors.ageText}</Text> : null}

            <View style={styles.lockedContextBox}>
              <Text style={styles.lockedContextTitle}>Account Security</Text>
              <Text style={styles.lockedContextBody}>
                Email ({lockedEmail}) is locked for household security.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing profile"
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSavePress}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Save profile changes"
              activeOpacity={0.85}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
});

const styles = StyleSheet.create({
  overlayBackdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', justifyContent: 'center', alignItems: 'center', padding: spacing.md, zIndex: 50 },
  keyboardContainer: { width: '100%', maxWidth: 440, maxHeight: '90%' },
  sheetCard: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  sheetHeader: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  sheetTitle: { fontFamily: typography.fontFamily.mainBold, fontSize: typography.fontSizes.xl, color: colors.primary },
  sheetSubtitle: { fontFamily: typography.fontFamily.secondary, fontSize: typography.fontSizes.xs, color: colors.textSecondary, marginTop: 2 },
  formScroll: { maxHeight: 420 },
  formContent: { padding: spacing.lg },
  errorBanner: { backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.dangerBorder, borderRadius: borderRadius.md, padding: spacing.sm, marginBottom: spacing.md },
  errorBannerText: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: typography.fontSizes.xs, color: colors.danger },
  label: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.xs, color: colors.text, marginBottom: spacing.xs, marginTop: spacing.xs },
  input: { minHeight: 48, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, fontFamily: typography.fontFamily.secondary, fontSize: typography.fontSizes.base, color: colors.text, marginBottom: spacing.xs },
  inputError: { borderColor: colors.danger },
  previewHint: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: typography.fontSizes.xs, color: colors.success, marginBottom: spacing.xs },
  fieldError: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: typography.fontSizes.xs, color: colors.danger, marginBottom: spacing.xs },
  lockedContextBox: { marginTop: spacing.sm, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.sm },
  lockedContextTitle: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.xs, color: colors.primary, marginBottom: 2 },
  lockedContextBody: { fontFamily: typography.fontFamily.secondary, fontSize: typography.fontSizes.xs, color: colors.textSecondary },
  actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
  cancelButton: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: colors.border },
  cancelButtonText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  saveButton: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  saveButtonText: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.sm, color: colors.textLight },
});
