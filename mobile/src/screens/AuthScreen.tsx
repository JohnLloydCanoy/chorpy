import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';

interface AuthScreenProps {
  onDemoLogin?: (role?: 'parent' | 'child') => void;
}

/**
 * Auth Coordinator Screen
 * Manages view switching between LoginScreen (default) and SignUpScreen.
 */
export default function AuthScreen({ onDemoLogin }: AuthScreenProps) {
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  if (authView === 'signup') {
    return (
      <SignUpScreen
        onNavigateToLogin={() => setAuthView('login')}
        onDemoLogin={onDemoLogin}
      />
    );
  }

  return (
    <LoginScreen
      onNavigateToSignUp={() => setAuthView('signup')}
      onDemoLogin={onDemoLogin}
    />
  );
}
