import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, borderRadius, typography } from '../theme';

interface HomeScreenProps {
  role: 'parent' | 'child';
  dbStatus: 'checking' | 'connected' | 'error';
  statusMessage: string;
}

export default function HomeScreen({ role, dbStatus, statusMessage }: HomeScreenProps) {
  return (
    <View style={styles.screenWrapper}>
      {/* Top Action Row - Right-aligned Notification Cube */}
      <View style={styles.topActionRow}>
        <TouchableOpacity
          style={styles.notificationCube}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
              stroke={colors.primary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M13.73 21a2 2 0 0 1-3.46 0"
              stroke={colors.primary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <View style={styles.badgeDot} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Dashboard Body */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.mascot}>🐦</Text>
        <Text style={styles.title}>Chorpy Dashboard</Text>
        <Text style={styles.subtitle}>Household Chore & Digital Wellbeing System</Text>

        <View style={styles.roleCard}>
          <Text style={styles.roleLabel}>CURRENT ACTIVE ROLE</Text>
          <Text style={styles.roleValue}>{role.toUpperCase()}</Text>
          <Text style={styles.roleHint}>
            {role === 'parent'
              ? 'You have authority to assign chores and approve photo proof.'
              : 'Complete mandatory chores to unlock your device screen time.'}
          </Text>
        </View>

        <View
          style={[
            styles.statusCard,
            dbStatus === 'connected'
              ? styles.statusOk
              : dbStatus === 'error'
              ? styles.statusError
              : styles.statusLoading,
          ]}
        >
          {dbStatus === 'checking' && (
            <ActivityIndicator color={colors.primary} style={styles.statusSpinner} />
          )}
          <Text style={styles.statusText}>
            {dbStatus === 'connected'
              ? '● Supabase Connected'
              : dbStatus === 'error'
              ? '✕ Connection Issue'
              : 'Connecting to Supabase...'}
          </Text>
          <Text style={styles.statusDetail}>{statusMessage}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: { flex: 1, backgroundColor: colors.background },
  topActionRow: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  notificationCube: {
    width: 48,
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.danger,
  },
  scrollContent: { alignItems: 'center', padding: spacing.lg },
  mascot: { fontSize: 54, marginBottom: spacing.xs },
  title: {
    fontSize: typography.fontSizes.xxl,
    fontFamily: typography.fontFamily.mainBold,
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  roleLabel: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.secondaryBold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  roleValue: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.mainBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  roleHint: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  statusCard: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
  },
  statusSpinner: { marginBottom: spacing.xs },
  statusLoading: { backgroundColor: colors.primarySoft, borderColor: colors.border },
  statusOk: { backgroundColor: colors.successSoft, borderColor: colors.successBorder },
  statusError: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder },
  statusText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondaryBold,
    color: colors.text,
    marginBottom: 2,
  },
  statusDetail: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
