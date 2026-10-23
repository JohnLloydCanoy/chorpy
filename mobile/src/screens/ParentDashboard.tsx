import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';

export default function ParentDashboard() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Parent! 👋</Text>
          <Text style={styles.subgreeting}>Canoy Family Circle</Text>
        </View>
        <Text style={styles.pinBadge}>PIN: 482910</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Approvals</Text>
        <View style={styles.card}>
          <Text style={styles.choreTitle}>🧹 Clean Computer Desk</Text>
          <Text style={styles.childName}>Assigned to: Lloyd (Child)</Text>
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoText}>📸 Photo Proof Preview</Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.approveButton}>
              <Text style={styles.buttonText}>Approve & Unlock</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectButton}>
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connected Devices</Text>
        <View style={styles.deviceRow}>
          <Text style={styles.deviceName}>📱 Lloyd's Phone (Galaxy A12)</Text>
          <Text style={styles.statusLocked}>LOCKED</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subgreeting: {
    fontSize: 14,
    color: '#64748B',
  },
  pinBadge: {
    backgroundColor: '#E0F2FE',
    color: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 13,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  choreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  childName: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  photoPlaceholder: {
    height: 140,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  photoText: {
    color: '#64748B',
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  rejectButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DC2626',
    alignItems: 'center',
  },
  rejectText: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 13,
  },
  deviceRow: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deviceName: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  statusLocked: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 12,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
