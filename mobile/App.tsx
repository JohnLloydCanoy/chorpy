import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useFonts, Fredoka_400Regular, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { supabase } from './src/lib/supabase';
import { AuthProvider, useAuthContext } from './src/context/AuthContext';
import AppLoaderScreen from './src/screens/AppLoaderScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import MyFamilyScreen from './src/screens/MyFamilyScreen';
import ChildLockScreen from './src/screens/ChildLockScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { colors, spacing, borderRadius, typography } from './src/theme';

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
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [statusMessage, setStatusMessage] = useState('Connecting to Supabase...');
  const [demoRole, setDemoRole] = useState<'parent' | 'child' | null>(null);

  const effectiveRole = profile?.role || demoRole || 'parent';

  useEffect(() => {
    async function testConnection() {
      try {
        const { error } = await supabase.from('households').select('count', { count: 'exact', head: true });
        if (error) {
          setDbStatus('error');
          setStatusMessage(`Supabase: ${error.message}`);
        } else {
          setDbStatus('connected');
          setStatusMessage('Backend Connected Successfully');
        }
      } catch (err: any) {
        setDbStatus('error');
        setStatusMessage(err?.message || 'Connection failed');
      }
    }

    testConnection();
  }, []);

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

  // 1. Initial App Loader Screen with "Getting Data..." placeholder
  if (loading) {
    return <AppLoaderScreen message="Getting Data..." subMessage="Verifying session with Supabase Cloud..." />;
  }

  // 2. Unauthenticated: route directly to AuthScreen (no top navigation bar)
  const isAuthenticated = Boolean(user || demoRole);
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.authSafeArea}>
        <AuthScreen onDemoLogin={(role) => setDemoRole(role || 'parent')} />
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
          <Text style={styles.headerMascot}>🐦</Text>
          <View>
            <Text style={styles.headerTitle}>Chorpy</Text>
            <Text style={styles.headerUser}>
              {user?.email || (demoRole ? `Demo ${demoRole.toUpperCase()}` : 'Authenticated')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out of Chorpy"
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular, Fredoka_600SemiBold, Fredoka_700Bold,
    Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <AppLoaderScreen message="Loading Chorpy..." subMessage="Setting up theme and typography..." />;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  authSafeArea: { flex: 1, backgroundColor: 'transparent' },
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: '2.5%',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerMascot: { fontSize: 24 },
  headerTitle: { fontFamily: typography.fontFamily.mainBold, fontSize: 18, color: colors.primary },
  headerUser: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: 11, color: colors.textSecondary },
  signOutButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    minHeight: 36,
    justifyContent: 'center',
  },
  signOutText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: 12, color: colors.danger },
  navBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: '2.5%',
    justifyContent: 'space-around',
    zIndex: 10,
  },
  navButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 36,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  navButtonActive: { backgroundColor: colors.primary },
  navButtonBgImage: { position: 'absolute', top: 0, left: '-6%', right: '-6%', bottom: 0, width: '112%', height: '100%', zIndex: 1 },
  navButtonText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: 12, color: colors.textSecondary },
  navButtonTextActive: { fontFamily: typography.fontFamily.secondaryBold, color: colors.textLight, zIndex: 2, position: 'relative' },
  content: { flex: 1 },
});
