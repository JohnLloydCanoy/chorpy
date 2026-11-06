import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { authService } from '../services/authService';
import { validateEmail, evaluatePasswordEntropy, formatTitleCase, formatE164Phone, calculateAgeFromDOB } from '../utils/validation';
import { PasswordEntropyChips } from '../components/PasswordEntropyChips';
import { DeveloperQuickPreview } from '../components/DeveloperQuickPreview';
import { RoleSelector } from '../components/RoleSelector';
import { Button } from '../components/Button';
import { colors, spacing, borderRadius, typography } from '../theme';
import { UserRole } from '../types';

interface SignUpScreenProps {
  onNavigateToLogin: () => void;
  onDemoLogin?: (role?: 'parent' | 'child') => void;
}

export default function SignUpScreen({ onNavigateToLogin, onDemoLogin }: SignUpScreenProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [role, setRole] = useState<UserRole>('parent');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

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

  async function handleSignUp() {
    setAuthError(null);
    const formattedName = formatTitleCase(fullName);
    if (!formattedName) return setAuthError('Please enter your full name.');
    const emailRes = validateEmail(email);
    if (!emailRes.isValid) return setEmailError(emailRes.error || 'Please enter a valid email address.');
    if (phone.trim() && !phoneResult.isValid) return setAuthError('Please provide a valid phone number (e.g. +639171234567).');
    if (!ageResult.isValidDate || ageResult.age === null) return setAuthError(ageResult.error || 'Please provide a valid date of birth (YYYY-MM-DD).');
    if (!entropy.isValid) return setAuthError('Password must satisfy all security requirements.');
    if (!agreeTerms) return setAuthError('Please agree to the Chorpy rules and regulations to proceed.');

    const effectiveRole: UserRole = ageResult.isUnder18 ? 'child' : role;
    setLoading(true);
    try {
      await authService.signUp({
        email: email.trim(),
        password,
        fullName: formattedName,
        phoneNumber: phone.trim() ? phoneResult.e164 : undefined,
        dateOfBirth: dob.trim(),
        age: ageResult.age,
        role: effectiveRole,
      });
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.mascot}>🐦</Text>
      <Text style={styles.title}>Join Chorpy</Text>
      <Text style={styles.subtitle}>Create your digital wellbeing household account</Text>

      <View style={styles.form}>
        {authError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Alex Smith"
          placeholderTextColor={colors.textMuted}
          value={fullName}
          onChangeText={setFullName}
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
          onChangeText={setPhone}
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
          onChangeText={setDob}
          autoCapitalize="none"
          maxLength={10}
        />
        {dob.trim() && ageResult.isValidDate && ageResult.age !== null ? (
          <Text style={styles.hintSuccess}>
            Calculated Age: {ageResult.age} years old {ageResult.isUnder18 ? '• Under 18' : ''}
          </Text>
        ) : dob.trim() && ageResult.error ? (
          <Text style={styles.fieldError}>{ageResult.error}</Text>
        ) : null}

        <RoleSelector
          role={effectiveRole}
          onSelectRole={setRole}
          isParentDisabled={isParentDisabled}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <PasswordEntropyChips criteria={entropy.criteria} />

        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreeTerms(!agreeTerms)}
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
          title="Create Account"
          variant="primary"
          loading={loading}
          disabled={!agreeTerms || !entropy.isValid || loading}
          onPress={handleSignUp}
          style={styles.primaryBtn}
        />

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={onNavigateToLogin} disabled={loading} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.loginLink}>Log In Here</Text>
          </TouchableOpacity>
        </View>

        <DeveloperQuickPreview onDemoLogin={onDemoLogin} disabled={loading} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: colors.background, flexGrow: 1, justifyContent: 'center' },
  mascot: { fontSize: 44, textAlign: 'center', marginBottom: spacing.xs },
  title: { fontSize: typography.fontSizes.xl, fontFamily: typography.fontFamily.mainBold, color: colors.primary, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  form: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border },
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
  primaryBtn: { marginTop: spacing.xs },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg, minHeight: 32 },
  footerText: { color: colors.textSecondary, fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary },
  loginLink: { color: colors.primary, fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryBold },
});
