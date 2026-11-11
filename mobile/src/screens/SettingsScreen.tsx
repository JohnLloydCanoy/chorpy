import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import { colors, spacing, borderRadius, typography } from '../theme';

export default function SettingsScreen() {
  const { user, profile, signOut } = useAuthContext();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const role = profile?.role || 'parent';
  const displayName = profile?.full_name || (user?.email ? user.email.split('@')[0] : 'Chorpy Member');
  const displayEmail = profile?.email || user?.email || 'No email registered';
  const displayPhone = profile?.phone_number || 'Not provided';
  const displayAge = profile?.age ? `${profile.age} years old` : profile?.date_of_birth || 'Not specified';

  async function handleSignOut() {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch {
      setIsSigningOut(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings & Preferences</Text>
        <Text style={styles.headerSubtitle}>Manage your account, circle & device wellbeing</Text>
      </View>

      {/* Profile & Account Overview */}
      <View style={styles.card}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileEmail}>{displayEmail}</Text>
          </View>
          <View style={role === 'parent' ? styles.roleBadgeParent : styles.roleBadgeChild}>
            <Text style={role === 'parent' ? styles.roleTextParent : styles.roleTextChild}>
              {role.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone Number</Text>
          <Text style={styles.infoValue}>{displayPhone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Age / Birthday</Text>
          <Text style={styles.infoValue}>{displayAge}</Text>
        </View>
      </View>

      {/* Preferences & Household Info */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Household Circle</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Circle Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusDot}>●</Text>
              <Text style={styles.statusBadgeText}>Active & Synced</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pairing PIN</Text>
            <Text style={styles.pinValue}>482910</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Household ID</Text>
            <Text style={styles.infoValue}>
              {profile?.household_id ? `${profile.household_id.substring(0, 12)}...` : 'Default Family Circle'}
            </Text>
          </View>
        </View>
      </View>

      {/* App & Device Wellbeing Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>App & Device Wellbeing</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hardware Overlay</Text>
            <Text style={styles.infoValueSuccess}>SYSTEM_ALERT_WINDOW Active</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Emergency SOS</Text>
            <Text style={styles.infoValue}>Accessible (911 / Guardian)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Realtime Sync</Text>
            <Text style={styles.infoValueSuccess}>Supabase WebSockets Active</Text>
          </View>
        </View>
      </View>

      {/* About Chorpy */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>About Chorpy</Text>
        <View style={styles.card}>
          <View style={styles.aboutHeader}>
            <Text style={styles.mascot}>🐦</Text>
            <View style={styles.aboutInfo}>
              <Text style={styles.aboutTitle}>Chorpy Digital Wellbeing</Text>
              <Text style={styles.aboutVersion}>Version 1.0.0 (Expo SDK 58)</Text>
            </View>
          </View>
          <Text style={styles.aboutEthos}>
            Chorpy the Maya balances household accountability with mindful digital screen habits, creating harmony for modern families.
          </Text>
        </View>
      </View>

      {/* Clean Sign Out Action */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        disabled={isSigningOut}
        accessibilityRole="button"
        accessibilityLabel="Sign out of Chorpy account"
      >
        {isSigningOut ? (
          <ActivityIndicator color={colors.danger} />
        ) : (
          <Text style={styles.signOutText}>Sign Out of Chorpy</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: { padding: spacing.md, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.md, marginTop: spacing.xs },
  headerTitle: { fontFamily: typography.fontFamily.mainBold, fontSize: typography.fontSizes.xl, color: colors.primary },
  headerSubtitle: { fontFamily: typography.fontFamily.secondary, fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 44, height: 44, borderRadius: borderRadius.full, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  avatarText: { fontFamily: typography.fontFamily.mainBold, fontSize: typography.fontSizes.lg, color: colors.primary },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: typography.fontFamily.mainSemiBold, fontSize: typography.fontSizes.base, color: colors.text },
  profileEmail: { fontFamily: typography.fontFamily.secondary, fontSize: typography.fontSizes.xs, color: colors.textSecondary },
  roleBadgeParent: { backgroundColor: colors.primarySoft, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  roleBadgeChild: { backgroundColor: colors.secondarySoft, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  roleTextParent: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.xs, color: colors.primary },
  roleTextChild: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.xs, color: colors.secondaryDark },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  section: { marginTop: spacing.md },
  sectionHeader: { fontFamily: typography.fontFamily.mainSemiBold, fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
  infoLabel: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  infoValue: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.sm, color: colors.text },
  infoValueSuccess: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.sm, color: colors.success },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statusDot: { color: colors.success, fontSize: typography.fontSizes.xs },
  statusBadgeText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.sm, color: colors.success },
  pinValue: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.sm, color: colors.primary, backgroundColor: colors.primarySoft, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  aboutHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs, gap: spacing.sm },
  mascot: { fontSize: 28 },
  aboutInfo: { flex: 1 },
  aboutTitle: { fontFamily: typography.fontFamily.mainSemiBold, fontSize: typography.fontSizes.base, color: colors.text },
  aboutVersion: { fontFamily: typography.fontFamily.secondary, fontSize: typography.fontSizes.xs, color: colors.textSecondary },
  aboutEthos: { fontFamily: typography.fontFamily.secondary, fontSize: typography.fontSizes.xs, color: colors.textSecondary, lineHeight: 18, marginTop: spacing.xs },
  signOutButton: { marginTop: spacing.lg, backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder, borderWidth: 1, borderRadius: borderRadius.md, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  signOutText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.base, color: colors.danger },
});
