import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function RoleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.mascot}>🐦</Text>
      <Text style={styles.title}>Who is using this phone?</Text>
      <Text style={styles.subtitle}>Select your role to set up this device</Text>

      <TouchableOpacity style={styles.roleCard}>
        <Text style={styles.roleIcon}>👨‍👩‍👧</Text>
        <View style={styles.roleInfo}>
          <Text style={styles.roleTitle}>I am a Parent</Text>
          <Text style={styles.roleDescription}>
            Manage chores, approve photo proof, and control device locks.
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.roleCard}>
        <Text style={styles.roleIcon}>🧒</Text>
        <View style={styles.roleInfo}>
          <Text style={styles.roleTitle}>I am a Child</Text>
          <Text style={styles.roleDescription}>
            Complete chores, submit photos, and earn screen time.
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 24,
    justifyContent: 'center',
  },
  mascot: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 28,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  roleIcon: {
    fontSize: 36,
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});
