import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function ChildLockScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.lockIcon}>🔒</Text>
      <Text style={styles.title}>Device Locked</Text>
      <Text style={styles.subtitle}>Complete your assigned chore to unlock screen time</Text>

      <View style={styles.choreCard}>
        <Text style={styles.badge}>PENDING CHORE</Text>
        <Text style={styles.choreTitle}>🧹 Clean Computer Desk</Text>
        <Text style={styles.choreDesc}>Wipe the desk surface and arrange keyboard and cords.</Text>
      </View>

      <TouchableOpacity style={styles.cameraButton}>
        <Text style={styles.cameraButtonText}>📸 Take Photo Proof</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>Screen will automatically unlock once approved by Parent</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 54,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 28,
  },
  choreCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badge: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  choreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  choreDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  cameraButton: {
    backgroundColor: '#FF6B4A',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});
