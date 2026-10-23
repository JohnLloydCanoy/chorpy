import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { supabase } from './src/lib/supabase';
import { AuthProvider } from './src/context/AuthContext';
import AuthScreen from './src/screens/AuthScreen';
import RoleScreen from './src/screens/RoleScreen';
import ParentDashboard from './src/screens/ParentDashboard';
import ChildLockScreen from './src/screens/ChildLockScreen';

type ScreenName = 'home' | 'auth' | 'role' | 'parent' | 'child';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('home');
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [statusMessage, setStatusMessage] = useState('Connecting to Supabase...');

  useEffect(() => {
    async function testConnection() {
      try {
        const { error } = await supabase.from('households').select('count', { count: 'exact', head: true });
        if (error) {
          setDbStatus('error');
          setStatusMessage(`Error: ${error.message}`);
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

  return (
    <AuthProvider>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {currentScreen === 'home' && (
            <View style={styles.homeContainer}>
              <Text style={styles.mascot}>🐦</Text>
              <Text style={styles.title}>Chorpy</Text>
              <Text style={styles.subtitle}>Household Chore & Digital Wellbeing</Text>

              <View style={[styles.statusCard, dbStatus === 'connected' ? styles.statusOk : dbStatus === 'error' ? styles.statusError : styles.statusLoading]}>
                {dbStatus === 'checking' && <ActivityIndicator color="#0284C7" style={{ marginBottom: 6 }} />}
                <Text style={styles.statusText}>
                  {dbStatus === 'connected' ? '● Supabase Connected' : dbStatus === 'error' ? '✕ Connection Issue' : 'Connecting to Supabase...'}
                </Text>
                <Text style={styles.statusDetail}>{statusMessage}</Text>
              </View>
            </View>
          )}

          {currentScreen === 'auth' && <AuthScreen />}
          {currentScreen === 'role' && <RoleScreen />}
          {currentScreen === 'parent' && <ParentDashboard />}
          {currentScreen === 'child' && <ChildLockScreen />}
        </View>

        {/* Screen Preview Navigation Bar */}
        <View style={styles.navBar}>
          {(['home', 'auth', 'role', 'parent', 'child'] as ScreenName[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setCurrentScreen(tab)}
              style={[styles.navButton, currentScreen === tab && styles.navButtonActive]}
            >
              <Text style={[styles.navButtonText, currentScreen === tab && styles.navButtonTextActive]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <StatusBar style="auto" />
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  homeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  mascot: {
    fontSize: 54,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0284C7',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 28,
    textAlign: 'center',
  },
  statusCard: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
  },
  statusLoading: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  statusOk: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  statusDetail: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
  },
  navButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  navButtonActive: {
    backgroundColor: '#0284C7',
  },
  navButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
  },
  navButtonTextActive: {
    color: '#FFFFFF',
  },
});
