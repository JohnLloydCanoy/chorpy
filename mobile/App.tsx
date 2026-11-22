import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useFonts, Fredoka_400Regular, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { AuthProvider, useAuthContext } from './src/context/AuthContext';
import { AddChoreOverlayHost, AddChoreOverlayProvider } from './src/context/AddChoreOverlayContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { useAppSplash } from './src/hooks/useAppSplash';
import { MainNavBar, ScreenName } from './src/components/navigation/MainNavBar';
import AppLoaderScreen from './src/screens/AppLoaderScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import MyFamilyScreen from './src/screens/MyFamilyScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { colors, spacing, borderRadius, typography } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppContent() {
  const {
    user,
    profile,
    loading,
    authError,
    signOut,
    retrySession,
    clearLocalSession,
  } = useAuthContext();
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [demoRole, setDemoRole] = useState<'parent' | 'child' | null>(null);
  const {
    statusMessage, isStartupLoading,
    demoSplashVisible, demoStatusText, triggerDemoSplash, dismissDemoSplash,
  } = useAppSplash(loading);

  const effectiveRole = profile?.role || demoRole || 'parent';

  // Active route guard: reset to 'home' if currentScreen is outside permitted routes
  useEffect(() => {
    const allowedScreens: readonly ScreenName[] = ['home', 'my_family', 'settings'];
    if (!allowedScreens.includes(currentScreen)) {
      setCurrentScreen('home');
    }
  }, [currentScreen]);

  const handleSignOut = useCallback(async () => {
    setDemoRole(null);
    await signOut();
  }, [signOut]);

  // 1. Initial App Loader / Demo Splash Screen
  if (isStartupLoading || demoSplashVisible) {
    const subMessage = demoSplashVisible
      ? 'Chorpy is flying while testing live Supabase response time.'
      : loading ? 'Verifying session with Supabase Cloud...' : statusMessage;
    return (
      <AppLoaderScreen
        message={demoSplashVisible ? 'Demo Splash Preview' : 'Getting Data...'}
        subMessage={subMessage}
        error={demoSplashVisible ? null : authError}
        onRetry={demoSplashVisible ? undefined : retrySession}
        secondaryActionLabel={demoSplashVisible ? undefined : 'Reset Local Session'}
        onSecondaryAction={demoSplashVisible ? undefined : clearLocalSession}
        demoStatusText={demoSplashVisible ? demoStatusText : undefined}
        onExitDemo={demoSplashVisible ? dismissDemoSplash : undefined}
      />
    );
  }

  // 2. Unauthenticated: route directly to AuthScreen (no top navigation bar)
  const isAuthenticated = Boolean(user || demoRole);
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.authSafeArea}>
        {authError ? (
          <View style={styles.authNoticeBar} accessibilityLiveRegion="polite">
            <Text style={styles.authNoticeText}>{authError}</Text>
            <View style={styles.authNoticeActions}>
              <TouchableOpacity
                style={styles.authNoticeButton}
                onPress={retrySession}
                accessibilityRole="button"
                accessibilityLabel="Retry session check"
              >
                <Text style={styles.authNoticeButtonText}>Retry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.authNoticeButton}
                onPress={clearLocalSession}
                accessibilityRole="button"
                accessibilityLabel="Reset local session"
              >
                <Text style={styles.authNoticeButtonText}>Reset Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        <AuthScreen onDemoLogin={(role) => setDemoRole(role || 'parent')} />
        {/* TODO(remove-after-testing): Temporary Demo Splash trigger */}
        <View style={styles.demoBar}>
          <TouchableOpacity
            style={styles.demoSplashButton}
            onPress={triggerDemoSplash}
            accessibilityRole="button"
            accessibilityLabel="Preview flying Chorpy splash screen"
          >
            <Text style={styles.demoSplashText}>Demo Splash</Text>
          </TouchableOpacity>
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }

  // 3. Authenticated: Render Home / Feature views with clean RBAC navigation
  return (
    <NotificationProvider>
      <AddChoreOverlayProvider>
        <SafeAreaView style={styles.safeArea}>
        {/* Authenticated Header with Sign Out action */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>C</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Chorpy</Text>
              <Text style={styles.headerUser}>
                {user?.email || (demoRole ? `Demo ${demoRole.toUpperCase()}` : 'Authenticated')}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {/* TODO(remove-after-testing): Temporary Demo Splash trigger */}
            <TouchableOpacity
              style={styles.headerDemoButton}
              onPress={triggerDemoSplash}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel="Preview flying Chorpy splash screen"
            >
              <Text style={styles.headerDemoText}>Demo Splash</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel="Sign out of Chorpy"
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Unified Top Navigation Bar with semantic tab icons */}
        <MainNavBar
          currentScreen={currentScreen}
          onSelectScreen={setCurrentScreen}
        />

        {/* Main Screen Content */}
        <View style={styles.content}>
          {currentScreen === 'home' && <HomeScreen role={effectiveRole} />}
          {currentScreen === 'my_family' && <MyFamilyScreen role={effectiveRole} />}
          {currentScreen === 'settings' && <SettingsScreen role={effectiveRole} />}
        </View>

        <AddChoreOverlayHost />
        <StatusBar style="dark" />
      </SafeAreaView>
    </AddChoreOverlayProvider>
    </NotificationProvider>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_400Regular, Fredoka_600SemiBold, Fredoka_700Bold,
    Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold,
  });
  const appReady = fontsLoaded || Boolean(fontError);

  const onLayoutRootView = useCallback(() => {
    if (appReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <View style={styles.rootContainer} onLayout={onLayoutRootView}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: colors.background },
  authSafeArea: { flex: 1, backgroundColor: colors.background },
  safeArea: { flex: 1, backgroundColor: colors.background },
  authNoticeBar: { backgroundColor: colors.dangerSoft, borderBottomWidth: 1, borderBottomColor: colors.dangerBorder, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xs },
  authNoticeText: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: typography.fontSizes.xs, color: colors.danger },
  authNoticeActions: { flexDirection: 'row', gap: spacing.sm },
  authNoticeButton: { minHeight: 48, paddingHorizontal: spacing.md, borderRadius: borderRadius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.dangerBorder, alignItems: 'center', justifyContent: 'center' },
  authNoticeButtonText: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.xs, color: colors.primary },
  demoBar: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignItems: 'center' },
  demoSplashButton: { minHeight: 48, minWidth: 180, paddingHorizontal: spacing.lg, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  demoSplashText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.sm, color: colors.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, paddingHorizontal: '2.5%', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerBadge: { width: 32, height: 32, borderRadius: borderRadius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  headerBadgeText: { fontFamily: typography.fontFamily.mainBold, fontSize: typography.fontSizes.lg, color: colors.textLight },
  headerTitle: { fontFamily: typography.fontFamily.mainBold, fontSize: 18, color: colors.primary },
  headerUser: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: 11, color: colors.textSecondary },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerDemoButton: { paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, backgroundColor: colors.primarySoft, borderColor: colors.primary, borderWidth: 1, borderRadius: borderRadius.sm, minHeight: 38, justifyContent: 'center' },
  headerDemoText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: 12, color: colors.primary },
  signOutButton: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder, borderWidth: 1, borderRadius: borderRadius.sm, minHeight: 38, justifyContent: 'center' },
  signOutText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: 12, color: colors.danger },
  content: { flex: 1 },
});
