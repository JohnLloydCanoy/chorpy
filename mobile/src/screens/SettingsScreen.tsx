import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import { authService, UpdateProfileParams } from '../services/authService';
import { HouseholdPinCard } from '../components/settings/HouseholdPinCard';
import { ProfileHeaderCard } from '../components/settings/ProfileHeaderCard';
import { EditProfileModal } from '../components/settings/EditProfileModal';
import { colors, spacing, borderRadius, typography } from '../theme';
import { UserRole } from '../types';

interface SettingsScreenProps {
  role?: UserRole;
}

export default function SettingsScreen({ role: propRole }: SettingsScreenProps) {
  const { user, profile, loading, signOut, refreshProfile } = useAuthContext();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const effectiveRole: UserRole = profile?.role || propRole || 'parent';
  const isDemoMode = !user;
  const hasProfileError = Boolean(user && !profile && !loading);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  const handleOpenEdit = useCallback(() => {
    setIsEditOpen(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setIsEditOpen(false);
  }, []);

  const handleSaveProfile = useCallback(
    async (payload: UpdateProfileParams) => {
      await authService.updateProfile(payload);
      await refreshProfile();
      setIsEditOpen(false);
      setStatusMessage('Profile updated');
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
      statusTimerRef.current = setTimeout(() => setStatusMessage(null), 3500);
    },
    [refreshProfile]
  );

  const handleRetryLoad = useCallback(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const handleSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch {
      setIsSigningOut(false);
    }
  }, [signOut]);

  return (
    <View style={styles.screenRoot}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Centered Profile Picture, Basic Info & Edit Profile placed before Settings & Preferences */}
        <ProfileHeaderCard
          profile={profile}
          emailFallback={user?.email ?? null}
          role={effectiveRole}
          isDemoMode={isDemoMode}
          isLoading={loading}
          hasProfileError={hasProfileError}
          statusMessage={statusMessage}
          onEditPress={handleOpenEdit}
          onRetryLoad={handleRetryLoad}
        />

        {/* Settings & Preferences Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings & Preferences</Text>
          <Text style={styles.headerSubtitle}>Manage your account, circle & device wellbeing</Text>
        </View>

        {/* Preferences & Household Info */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Household Circle</Text>
          <HouseholdPinCard householdId={profile?.household_id ?? null} role={effectiveRole} />
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

      <EditProfileModal
        visible={isEditOpen}
        profile={profile}
        emailFallback={user?.email ?? null}
        onClose={handleCloseEdit}
        onSave={handleSaveProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  contentContainer: {
    width: '95%',
    alignSelf: 'center',
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: { marginBottom: spacing.sm, marginTop: spacing.xs },
  headerTitle: { fontFamily: typography.fontFamily.mainBold, fontSize: typography.fontSizes.xl, color: colors.primary },
  headerSubtitle: { fontFamily: typography.fontFamily.secondary, fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  section: { marginTop: spacing.md },
  sectionHeader: { fontFamily: typography.fontFamily.mainSemiBold, fontSize: typography.fontSizes.sm, color: colors.textSecondary, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs },
  infoLabel: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  infoValue: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.sm, color: colors.text },
  infoValueSuccess: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.sm, color: colors.success },
  aboutHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs, gap: spacing.sm },
  mascot: { fontSize: 28 },
  aboutInfo: { flex: 1 },
  aboutTitle: { fontFamily: typography.fontFamily.mainSemiBold, fontSize: typography.fontSizes.base, color: colors.text },
  aboutVersion: { fontFamily: typography.fontFamily.secondary, fontSize: typography.fontSizes.xs, color: colors.textSecondary },
  aboutEthos: { fontFamily: typography.fontFamily.secondary, fontSize: typography.fontSizes.xs, color: colors.textSecondary, lineHeight: 18, marginTop: spacing.xs },
  signOutButton: { marginTop: spacing.lg, backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder, borderWidth: 1, borderRadius: borderRadius.md, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  signOutText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.base, color: colors.danger },
});
