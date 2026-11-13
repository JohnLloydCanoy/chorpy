import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useFonts, Fredoka_400Regular, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { AuthProvider, useAuthContext } from './src/context/AuthContext';
import { useAppSplash } from './src/hooks/useAppSplash';
import AppLoaderScreen from './src/screens/AppLoaderScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import MyFamilyScreen from './src/screens/MyFamilyScreen';
import ChildLockScreen from './src/screens/ChildLockScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { colors, spacing, borderRadius, typography } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const primaryBgImage = require('./assets/Background-of-Primary-Color.png');

// Navigation Screen Registry with Role-Based Access Control (RBAC)
type ScreenName = 'home' | 'my_family' | 'child' | 'settings';

interface NavTabItem {
  id: ScreenName;
  label: string;
}

const PARENT_NAV_TABS: readonly NavTabItem[] = [
  { id: 'home', label: 'HOME' },
  { id: 'my_family', label: 'MY FAMILY' },
  { id: 'settings', label: 'SETTING' },
];
const CHILD_NAV_TABS: readonly NavTabItem[] = [
  { id: 'home', label: 'HOME' },
  { id: 'my_family', label: 'MY FAMILY' },
  { id: 'child', label: 'CHILD' },
  { id: 'settings', label: 'SETTING' },
];

function AppContent() {
  const { user, profile, loading, signOut } = useAuthContext();
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [demoRole, setDemoRole] = useState<'parent' | 'child' | null>(null);
  const {
    dbStatus, statusMessage, isStartupLoading,
    demoSplashVisible, demoStatusText, triggerDemoSplash, dismissDemoSplash,
  } = useAppSplash(loading);

  const effectiveRole = profile?.role || demoRole || 'parent';

  // Active route guard: reset to 'home' if currentScreen is not permitted for effectiveRole
  useEffect(() => {
    const allowedScreens: ScreenName[] =
      effectiveRole === 'parent'
        ? ['home', 'my_family', 'settings']
        : ['home', 'my_family', 'child', 'settings'];
    if (!allowedScreens.includes(currentScreen)) {
      setCurrentScreen('home');
    }
  }, [effectiveRole, currentScreen]);

  // 1. Initial App Loader / Demo Splash Screen
  if (isStartupLoading || demoSplashVisible) {
    const subMessage = demoSplashVisible
      ? 'Chorpy is flying while testing live Supabase response time.'
      : loading ? 'Verifying session with Supabase Cloud...' : statusMessage;
    return (
      <AppLoaderScreen
        message={demoSplashVisible ? 'Demo Splash Preview' : 'Getting Data...'}
        subMessage={subMessage}
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
  const visibleTabs = effectiveRole === 'parent' ? PARENT_NAV_TABS : CHILD_NAV_TABS;

  async function handleSignOut() {
    setDemoRole(null);
    await signOut();
  }

  return (
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

      {/* Dynamic RBAC Navigation Bar */}
      <View style={styles.navBar}>
        {visibleTabs.map((tab) => {
          const isActive = currentScreen === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setCurrentScreen(tab.id)}
              style={[styles.navButton, isActive && styles.navButtonActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              {isActive && (
                <Image
                  source={primaryBgImage}
                  style={styles.navButtonBgImage}
                  resizeMode="cover"
                />
              )}
              <Text style={[styles.navButtonText, isActive && styles.navButtonTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Screen Content with Strict RBAC Guards */}
      <View style={styles.content}>
        {currentScreen === 'home' && (
          <HomeScreen
            role={effectiveRole}
            dbStatus={dbStatus}
            statusMessage={statusMessage}
            onNavigateToFamily={() => setCurrentScreen('my_family')}
          />
        )}
        {currentScreen === 'my_family' && <MyFamilyScreen role={effectiveRole} />}
        {currentScreen === 'child' && effectiveRole === 'child' && <ChildLockScreen />}
        {currentScreen === 'settings' && <SettingsScreen />}
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
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
  navBar: { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: spacing.sm, paddingHorizontal: '2.5%', justifyContent: 'space-around', zIndex: 10 },
  navButton: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: borderRadius.md, minHeight: 36, justifyContent: 'center', overflow: 'hidden' },
  navButtonActive: { backgroundColor: colors.primary },
  navButtonBgImage: { position: 'absolute', top: 0, left: '-6%', right: '-6%', bottom: 0, width: '112%', height: '100%', zIndex: 1 },
  navButtonText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: 12, color: colors.textSecondary },
  navButtonTextActive: { fontFamily: typography.fontFamily.secondaryBold, color: colors.textLight, zIndex: 2, position: 'relative' },
  content: { flex: 1 },
});
