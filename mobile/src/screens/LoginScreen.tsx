import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { authService } from '../services/authService';
import { validateEmail } from '../utils/validation';
import { DeveloperQuickPreview } from '../components/DeveloperQuickPreview';
import { colors, spacing, borderRadius } from '../theme';

interface LoginScreenProps {
  onNavigateToSignUp: () => void;
  onDemoLogin?: (role?: 'parent' | 'child') => void;
}

export default function LoginScreen({ onNavigateToSignUp, onDemoLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleEmailBlur() {
    if (!email.trim()) {
      setEmailError(null);
      return;
    }
    const result = validateEmail(email);
    setEmailError(result.isValid ? null : result.error || 'Invalid email address.');
  }

  async function handleSignIn() {
    setAuthError(null);
    const emailResult = validateEmail(email);
    if (!emailResult.isValid) {
      setEmailError(emailResult.error || 'Please enter a valid email address.');
      return;
    }
    setEmailError(null);
    if (!password) {
      setAuthError('Please enter your password.');
      return;
    }
    setLoading(true);
    try {
      await authService.signIn(email.trim(), password);
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.mascot}>🐦</Text>
      <Text style={styles.title}>Welcome to Chorpy</Text>
      <Text style={styles.subtitle}>Sign in to access your household dashboard</Text>

      <View style={styles.form}>
        {authError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={[styles.input, emailError ? styles.inputError : null]}
          placeholder="parent@example.com"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (emailError) setEmailError(null);
          }}
          onBlur={handleEmailBlur}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />
        {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          secureTextEntry
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={(val) => {
            setPassword(val);
            if (authError) setAuthError(null);
          }}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.btnDisabled]}
          onPress={handleSignIn}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text style={styles.primaryBtnText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={onNavigateToSignUp} disabled={loading} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.signUpLink}>Sign up Here</Text>
          </TouchableOpacity>
        </View>

        <DeveloperQuickPreview onDemoLogin={onDemoLogin} disabled={loading} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: colors.background, flexGrow: 1, justifyContent: 'center' },
  mascot: { fontSize: 48, textAlign: 'center', marginBottom: spacing.xs },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  form: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border },
  errorBox: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder, borderWidth: 1, borderRadius: borderRadius.sm, padding: spacing.sm, marginBottom: spacing.md },
  errorText: { color: colors.danger, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: spacing.xs },
  input: { backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, color: colors.text, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, minHeight: 48 },
  inputError: { borderColor: colors.danger, marginBottom: spacing.xs },
  fieldError: { color: colors.danger, fontSize: 11, fontWeight: '600', marginBottom: spacing.md },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xs, minHeight: 48 },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: colors.textLight, fontWeight: '700', fontSize: 15 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg, minHeight: 32 },
  footerText: { color: colors.textSecondary, fontSize: 13 },
  signUpLink: { color: colors.accent, fontSize: 13, fontWeight: '700' },
});
