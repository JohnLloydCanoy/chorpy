import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import OnboardingScreen from './OnboardingScreen';

interface AuthScreenProps {
  onDemoLogin?: (role?: 'parent' | 'child') => void;
}

/**
 * Auth Coordinator Screen
 * Manages view switching between LoginScreen (default) and OnboardingScreen.
 */
export default function AuthScreen({ onDemoLogin }: AuthScreenProps) {
  const [authView, setAuthView] = useState<'login' | 'onboarding'>('login');

  if (authView === 'onboarding') {
    return (
      <OnboardingScreen
        onNavigateToLogin={() => setAuthView('login')}
        onDemoLogin={onDemoLogin}
      />
    );
  }

  return (
    <LoginScreen
      onNavigateToSignUp={() => setAuthView('onboarding')}
      onDemoLogin={onDemoLogin}
    />
  );
}
