import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { validateEmail, evaluatePasswordEntropy, formatTitleCase, formatE164Phone, calculateAgeFromDOB } from '../../utils/validation';
import { PasswordEntropyChips } from '../PasswordEntropyChips';
import { DeveloperQuickPreview } from '../DeveloperQuickPreview';
import { RoleSelector } from '../RoleSelector';
import { Button } from '../Button';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { UserRole } from '../../types';

export interface Step1FormData {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  role: UserRole;
  password: string;
}

interface OnboardingStep1FormProps {
  initialValues: Step1FormData;
  onContinue: (values: Step1FormData) => void;
  onNavigateToLogin: () => void;
  onDemoLogin?: (role?: 'parent' | 'child') => void;
}

function formatDobInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

export function OnboardingStep1Form({
  initialValues,
  onContinue,
  onNavigateToLogin,
  onDemoLogin,
}: OnboardingStep1FormProps) {
  const [fullName, setFullName] = useState(initialValues.fullName);
  const [email, setEmail] = useState(initialValues.email);
  const [phone, setPhone] = useState(initialValues.phone);
  const [dob, setDob] = useState(initialValues.dob);
  const [role, setRole] = useState<UserRole>(initialValues.role);
  const [password, setPassword] = useState(initialValues.password);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const phoneResult = formatE164Phone(phone);
  const ageResult = calculateAgeFromDOB(dob);
  const entropy = evaluatePasswordEntropy(password);
  const isParentDisabled = Boolean(ageResult.isValidDate && ageResult.isUnder18);
  const effectiveRole: UserRole = isParentDisabled ? 'child' : role;

  function handleEmailBlur() {
    if (!email.trim()) return setEmailError(null);
    const res = validateEmail(email);
    setEmailError(res.isValid ? null : res.error || 'Invalid email address.');
  }

  function handleContinue() {
    setFormError(null);
    if (!fullName.trim()) {
      return setFormError('Please enter your full name.');
    }
    const emailRes = validateEmail(email);
    if (!emailRes.isValid) {
      return setFormError(emailRes.error || 'Please enter a valid email address.');
    }
    if (phone.trim() && !phoneResult.isValid) {
      return setFormError('Please enter a valid phone number (e.g. 09171234567 or +639171234567).');
    }
    if (!dob.trim()) {
      return setFormError('Please enter your date of birth (YYYY-MM-DD).');
    }
    if (!ageResult.isValidDate || ageResult.age === null) {
      return setFormError(ageResult.error || 'Please enter a valid date of birth (YYYY-MM-DD).');
    }
    if (!entropy.isValid) {
      return setFormError('Password must meet all 4 security requirements below.');
    }
    if (!agreeTerms) {
      return setFormError('Please agree to the Chorpy rules and regulations to continue.');
    }

    onContinue({
      fullName: formatTitleCase(fullName),
      email: email.trim(),
      phone: phone.trim() && phoneResult.isValid ? phoneResult.e164 : phone.trim(),
      dob: dob.trim(),
      role: effectiveRole,
      password,
    });
  }

  return (
    <View style={styles.card}>
      <Text style={styles.stepIndicator}>Step 1 of 2: Account Details</Text>

      {formError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{formError}</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Alex Smith"
        placeholderTextColor={colors.textMuted}
        value={fullName}
        onChangeText={(v) => { setFullName(v); if (formError) setFormError(null); }}
        onBlur={() => setFullName(formatTitleCase(fullName))}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={[styles.input, emailError ? styles.inputError : null]}
        placeholder="parent@example.com"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          if (emailError) setEmailError(null);
          if (formError) setFormError(null);
        }}
        onBlur={handleEmailBlur}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
      />
      {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. +63 917 123 4567 or 09171234567"
        placeholderTextColor={colors.textMuted}
        value={phone}
        onChangeText={(v) => { setPhone(v); if (formError) setFormError(null); }}
        keyboardType="phone-pad"
      />
      {phone.trim() && phoneResult.isValid ? (
        <Text style={styles.hintSuccess}>Standardized: {phoneResult.formatted}</Text>
      ) : null}

      <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD (e.g. 2011-05-10)"
        placeholderTextColor={colors.textMuted}
        value={dob}
        onChangeText={(v) => {
          setDob(formatDobInput(v));
          if (formError) setFormError(null);
        }}
        autoCapitalize="none"
        maxLength={10}
        keyboardType="numeric"
      />
      {dob.trim() && ageResult.isValidDate && ageResult.age !== null ? (
        <Text style={styles.hintSuccess}>
          Calculated Age: {ageResult.age} years old {ageResult.isUnder18 ? '• Under 18' : ''}
        </Text>
      ) : dob.trim() && ageResult.error ? (
        <Text style={styles.fieldError}>{ageResult.error}</Text>
      ) : null}

      <RoleSelector role={effectiveRole} onSelectRole={setRole} isParentDisabled={isParentDisabled} />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="••••••••"
        secureTextEntry
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={(v) => { setPassword(v); if (formError) setFormError(null); }}
        autoCapitalize="none"
      />
      <PasswordEntropyChips criteria={entropy.criteria} />

      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => { setAgreeTerms(!agreeTerms); if (formError) setFormError(null); }}
        activeOpacity={0.8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: agreeTerms }}
      >
        <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
          {agreeTerms ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>
        <Text style={styles.termsText}>I agree to the Chorpy rules and regulations</Text>
      </TouchableOpacity>

      <Button
        title="Continue to Family Setup"
        variant="primary"
        onPress={handleContinue}
      />

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={onNavigateToLogin} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.loginLink}>Log In Here</Text>
        </TouchableOpacity>
      </View>

      <DeveloperQuickPreview onDemoLogin={onDemoLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border },
  stepIndicator: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryBold, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },
  errorBox: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder, borderWidth: 1, borderRadius: borderRadius.sm, padding: spacing.sm, marginBottom: spacing.md },
  errorText: { color: colors.danger, fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryMedium, textAlign: 'center' },
  label: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondarySemiBold, color: colors.text, marginBottom: spacing.xs },
  input: { backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.fontSizes.base, fontFamily: typography.fontFamily.secondary, color: colors.text, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, minHeight: 48 },
  inputError: { borderColor: colors.danger },
  fieldError: { color: colors.danger, fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryMedium, marginBottom: spacing.sm },
  hintSuccess: { color: colors.success, fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryMedium, marginBottom: spacing.sm },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.md },
  checkbox: { width: 20, height: 20, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  checkmark: { color: colors.textLight, fontSize: 12, fontWeight: '700' },
  termsText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary, color: colors.text, flex: 1 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg, minHeight: 32 },
  footerText: { color: colors.textSecondary, fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary },
  loginLink: { color: colors.primary, fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryBold },
});
