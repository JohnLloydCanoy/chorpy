import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { authService } from '../services/authService';
import { validateEmail } from '../utils/validation';
import { DeveloperQuickPreview } from '../components/DeveloperQuickPreview';
import { Button } from '../components/Button';
import { colors, spacing, borderRadius, typography } from '../theme';

const whiteBgAsset = require('../../assets/White-Background-Assets.png');

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
    <View style={styles.screenWrapper}>
      <Image
        source={whiteBgAsset}
        style={styles.screenBgImage}
        resizeMode="cover"
      />
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

          <Button
            title="Sign In"
            variant="primary"
            loading={loading}
            onPress={handleSignIn}
            style={styles.primaryBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{"Don't have an account? "}</Text>
            <TouchableOpacity onPress={onNavigateToSignUp} disabled={loading} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.signUpLink}>Sign up Here</Text>
            </TouchableOpacity>
          </View>

          <DeveloperQuickPreview onDemoLogin={onDemoLogin} disabled={loading} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  screenBgImage: {
    position: 'absolute',
    top: '-8%',
    bottom: '-8%',
    left: '-6%',
    right: '-6%',
    width: '112%',
    height: '116%',
  },
  container: { padding: spacing.lg, backgroundColor: 'transparent', flexGrow: 1, justifyContent: 'center' },
  mascot: { fontSize: 48, textAlign: 'center', marginBottom: spacing.xs },
  title: { fontSize: typography.fontSizes.xxl, fontFamily: typography.fontFamily.mainBold, color: colors.primary, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  form: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border },
  errorBox: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder, borderWidth: 1, borderRadius: borderRadius.sm, padding: spacing.sm, marginBottom: spacing.md },
  errorText: { color: colors.danger, fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryMedium, textAlign: 'center' },
  label: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondarySemiBold, color: colors.text, marginBottom: spacing.xs },
  input: { backgroundColor: colors.background, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.fontSizes.base, fontFamily: typography.fontFamily.secondary, color: colors.text, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, minHeight: 48 },
  inputError: { borderColor: colors.danger, marginBottom: spacing.xs },
  fieldError: { color: colors.danger, fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryMedium, marginBottom: spacing.md },
  primaryBtn: { marginTop: spacing.xs },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg, minHeight: 32 },
  footerText: { color: colors.textSecondary, fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary },
  signUpLink: { color: colors.primary, fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryBold },
});
