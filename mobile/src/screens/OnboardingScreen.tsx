import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import { authService } from '../services/authService';
import { householdService } from '../services/householdService';
import {
  OnboardingStep1Form,
  Step1FormData,
  OnboardingFamilyFork,
  OnboardingJoinPin,
  OnboardingCreateHousehold,
} from '../components/onboarding';
import { colors, spacing, typography } from '../theme';

const whiteBgAsset = require('../../assets/White-Background-Assets.png');

interface OnboardingScreenProps {
  onNavigateToLogin: () => void;
  onDemoLogin?: (role?: 'parent' | 'child') => void;
}

type OnboardingStep = 1 | 2 | 'join' | 'create';

export default function OnboardingScreen({ onNavigateToLogin, onDemoLogin }: OnboardingScreenProps) {
  const [step, setStep] = useState<OnboardingStep>(1);
  const [step1Data, setStep1Data] = useState<Step1FormData>({
    fullName: '', email: '', phone: '', dob: '', role: 'parent', password: '',
  });
  const [pin, setPin] = useState('');
  const [householdName, setHouseholdName] = useState('');
  const [numChildren, setNumChildren] = useState(1);
  const [numCoParents, setNumCoParents] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleStep1Continue(values: Step1FormData) {
    setStep1Data(values);
    if (!householdName.trim()) {
      const parts = values.fullName.trim().split(' ');
      const lastName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
      setHouseholdName(`${lastName} Family Circle`);
    }
    setError(null);
    setStep(2);
  }

  async function registerAndLink(action: (userId: string) => Promise<unknown>, fallbackMsg: string) {
    setError(null);
    setLoading(true);
    try {
      const authRes = await authService.signUp({
        email: step1Data.email,
        password: step1Data.password,
        fullName: step1Data.fullName,
        phoneNumber: step1Data.phone || undefined,
        dateOfBirth: step1Data.dob || undefined,
        role: step1Data.role,
      });
      const userId = authRes.user?.id;
      if (!userId) {
        throw new Error('Registration completed. Please verify your email before logging in.');
      }
      await action(userId);
    } catch (err: any) {
      setError(err?.message || fallbackMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinSubmit() {
    if (pin.trim().length !== 6) return setError('Please enter a valid 6-digit Family PIN.');
    await householdService.verifyPin(pin).catch((err) => {
      setError(err?.message || 'Invalid or expired Family PIN.');
      throw err;
    });
    await registerAndLink(
      (userId) => householdService.joinHouseholdWithPin(pin, userId),
      'Failed to join family. Please check the PIN and try again.'
    );
  }

  async function handleCreateSubmit() {
    if (!householdName.trim()) return setError('Please enter a household name.');
    await registerAndLink(
      (userId) => householdService.createHousehold(householdName.trim(), userId, { numChildren, numCoParents }),
      'Failed to create family circle. Please try again.'
    );
  }

  return (
    <View style={styles.screenWrapper}>
      <Image source={whiteBgAsset} style={styles.screenBgImage} resizeMode="cover" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.mascot}>🐦</Text>
        <Text style={styles.title}>Join Chorpy</Text>
        <Text style={styles.subtitle}>Digital wellbeing for modern families</Text>

        {step === 1 && (
          <OnboardingStep1Form
            initialValues={step1Data}
            onContinue={handleStep1Continue}
            onNavigateToLogin={onNavigateToLogin}
            onDemoLogin={onDemoLogin}
          />
        )}
        {step === 2 && (
          <OnboardingFamilyFork
            onSelectJoin={() => { setError(null); setStep('join'); }}
            onSelectCreate={() => { setError(null); setStep('create'); }}
            onBack={() => { setError(null); setStep(1); }}
          />
        )}
        {step === 'join' && (
          <OnboardingJoinPin
            pin={pin}
            onPinChange={(val) => { setPin(val); if (error) setError(null); }}
            onSubmit={handleJoinSubmit}
            onBack={() => { setError(null); setStep(2); }}
            loading={loading}
            error={error}
          />
        )}
        {step === 'create' && (
          <OnboardingCreateHousehold
            householdName={householdName}
            numChildren={numChildren}
            numCoParents={numCoParents}
            onHouseholdNameChange={(val) => { setHouseholdName(val); if (error) setError(null); }}
            onNumChildrenChange={setNumChildren}
            onNumCoParentsChange={setNumCoParents}
            onSubmit={handleCreateSubmit}
            onBack={() => { setError(null); setStep(2); }}
            loading={loading}
            error={error}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  screenBgImage: { position: 'absolute', top: '-8%', bottom: '-8%', left: '-6%', right: '-6%', width: '112%', height: '116%' },
  container: { padding: spacing.lg, backgroundColor: 'transparent', flexGrow: 1, justifyContent: 'center' },
  mascot: { fontSize: 44, textAlign: 'center', marginBottom: spacing.xs },
  title: { fontSize: typography.fontSizes.xl, fontFamily: typography.fontFamily.mainBold, color: colors.primary, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
});
