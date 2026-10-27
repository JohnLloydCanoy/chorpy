import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export default function AuthScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.mascot}>🐦</Text>
      <Text style={styles.title}>Join Chorpy</Text>
      <Text style={styles.subtitle}>Create your account to start managing chores & screen time</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} placeholder="e.g. John Doe" placeholderTextColor="#94A3B8" editable={false} />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} placeholder="e.g. +63 912 345 6789" placeholderTextColor="#94A3B8" editable={false} />

        <View style={styles.row}>
          <View style={[styles.column, { marginRight: 8 }]}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor="#94A3B8" editable={false} />
          </View>
          <View style={[styles.column, { marginLeft: 8 }]}>
            <Text style={styles.label}>Age</Text>
            <TextInput style={styles.input} placeholder="e.g. 14" placeholderTextColor="#94A3B8" editable={false} />
          </View>
        </View>

        <Text style={styles.label}>Email Address</Text>
        <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="#94A3B8" editable={false} />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} placeholder="••••••••" secureTextEntry placeholderTextColor="#94A3B8" editable={false} />

        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Create Account (Placeholder)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
    justifyContent: 'center',
  },
  mascot: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryButtonText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '600',
  },
});
