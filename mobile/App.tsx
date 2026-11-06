import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { supabase } from './src/lib/supabase';
import { AuthProvider, useAuthContext } from './src/context/AuthContext';
import AppLoaderScreen from './src/screens/AppLoaderScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import RoleScreen from './src/screens/RoleScreen';
import ParentDashboard from './src/screens/ParentDashboard';
import ChildLockScreen from './src/screens/ChildLockScreen';
import { colors, spacing, borderRadius } from './src/theme';

// Navigation Screen Registry (Auth removed from navigation per requirement)
type ScreenName = 'home' | 'role' | 'parent' | 'child';
const NAV_TABS: readonly ScreenName[] = ['home', 'role', 'parent', 'child'];

function AppContent() {
  const { user, profile, loading, signOut } = useAuthContext();
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [statusMessage, setStatusMessage] = useState('Connecting to Supabase...');
  const [demoRole, setDemoRole] = useState<'parent' | 'child' | null>(null);

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

  // 1. Initial App Loader Screen with "Getting Data..." placeholder
  if (loading) {
    return <AppLoaderScreen message="Getting Data..." subMessage="Verifying session with Supabase Cloud..." />;
  }

  // 2. Unauthenticated: route directly to AuthScreen (no top navigation bar)
  const isAuthenticated = Boolean(user || demoRole);
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AuthScreen onDemoLogin={(role) => setDemoRole(role || 'parent')} />
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }

  // 3. Authenticated: Render Home / Feature views with clean navigation
  const effectiveRole = profile?.role || demoRole || 'parent';

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

      {/* Screen Preview Navigation Bar (Auth removed) */}
      <View style={styles.navBar}>
        {NAV_TABS.map((tab) => {
          const isActive = currentScreen === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setCurrentScreen(tab)}
              style={[styles.navButton, isActive && styles.navButtonActive]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.navButtonText, isActive && styles.navButtonTextActive]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Main Screen Content */}
      <View style={styles.content}>
        {currentScreen === 'home' && (
          <HomeScreen
            role={effectiveRole}
            dbStatus={dbStatus}
            statusMessage={statusMessage}
          />
        )}
        {currentScreen === 'role' && <RoleScreen />}
        {currentScreen === 'parent' && <ParentDashboard />}
        {currentScreen === 'child' && <ChildLockScreen />}
      </View>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerMascot: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  headerUser: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
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
  signOutText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    justifyContent: 'space-around',
    zIndex: 10,
  },
  navButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 36,
    justifyContent: 'center',
  },
  navButtonActive: {
    backgroundColor: colors.primary,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  navButtonTextActive: {
    color: colors.textLight,
  },
  content: {
    flex: 1,
  },
});
