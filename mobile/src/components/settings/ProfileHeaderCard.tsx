import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { borderRadius, colors, iconSizes, spacing, typography } from '../../theme';
import { Profile, UserRole } from '../../types';
import {
  formatProfileAgeDisplay,
  formatProfilePhoneDisplay,
  getProfileInitials,
} from '../../utils/profileValidation';

export interface ProfileHeaderCardProps {
  profile: Profile | null;
  emailFallback: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  isDemoMode: boolean;
  isLoading: boolean;
  hasProfileError: boolean;
  statusMessage: string | null;
  onEditPress: () => void;
  onRetryLoad: () => void;
}

const EditPencilIcon = React.memo(function EditPencilIcon({ color }: { color: string }) {
  return (
    <Svg
      width={iconSizes.sm}
      height={iconSizes.sm}
      viewBox="0 0 24 24"
      fill="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path
        d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});

export const ProfileHeaderCard = React.memo(function ProfileHeaderCard({
  profile,
  emailFallback,
  role,
  avatarUrl = null,
  isDemoMode,
  isLoading,
  hasProfileError,
  statusMessage,
  onEditPress,
  onRetryLoad,
}: ProfileHeaderCardProps) {
  if (isLoading && !profile && !isDemoMode) {
    return (
      <View style={styles.card} accessibilityLabel="Loading profile header">
        <View style={styles.skeletonAvatar} />
        <View style={styles.skeletonName} />
        <View style={styles.skeletonEmail} />
        <View style={styles.skeletonBadge} />
        <View style={styles.skeletonButton} />
      </View>
    );
  }

  const isParent = role === 'parent';
  const displayName =
    profile?.full_name?.trim() ||
    (emailFallback ? emailFallback.split('@')[0] : isDemoMode ? `Demo ${isParent ? 'Parent' : 'Child'}` : 'Chorpy Member');
  const displayEmail =
    profile?.email || emailFallback || (isDemoMode ? 'demo.preview@chorpy.app' : 'No email registered');
  const initials = getProfileInitials(displayName, displayEmail);
  const displayPhone = formatProfilePhoneDisplay(profile?.phone_number);
  const displayAge = formatProfileAgeDisplay(profile?.age, profile?.date_of_birth);

  return (
    <View style={styles.card}>
      <View
        style={[styles.avatarRing, isParent ? styles.avatarRingParent : styles.avatarRingChild]}
        accessible
        accessibilityRole="image"
        accessibilityLabel={`${displayName} profile avatar`}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatarImage} resizeMode="cover" />
        ) : (
          <Text style={[styles.avatarInitials, isParent ? styles.avatarInitialsParent : styles.avatarInitialsChild]}>
            {initials}
          </Text>
        )}
      </View>

      <Text style={styles.nameText} numberOfLines={2}>
        {displayName}
      </Text>
      <Text style={styles.emailText} numberOfLines={1} ellipsizeMode="middle">
        {displayEmail}
      </Text>

      <View style={[styles.roleBadge, isParent ? styles.roleBadgeParent : styles.roleBadgeChild]}>
        <Text style={[styles.roleText, isParent ? styles.roleTextParent : styles.roleTextChild]}>
          {isParent ? 'PARENT' : 'CHILD'}
        </Text>
      </View>

      <View style={styles.metaStrip}>
        <View style={styles.metaColumn}>
          <Text style={styles.metaLabel}>Phone</Text>
          <Text style={styles.metaValue} numberOfLines={1}>
            {displayPhone}
          </Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaColumn}>
          <Text style={styles.metaLabel}>Age / Birthday</Text>
          <Text style={styles.metaValue} numberOfLines={1}>
            {displayAge}
          </Text>
        </View>
      </View>

      {statusMessage ? (
        <View style={styles.statusBanner} accessibilityLiveRegion="polite">
          <Text style={styles.statusBannerText}>{statusMessage}</Text>
        </View>
      ) : null}

      {hasProfileError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Could not load your profile details.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetryLoad}
            accessibilityRole="button"
            accessibilityLabel="Retry loading profile"
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {isDemoMode ? (
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>
            Demo Preview Mode — sign in to edit and save profile details.
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.editButton, isDemoMode && styles.editButtonDisabled]}
        onPress={onEditPress}
        disabled={isDemoMode}
        accessibilityRole="button"
        accessibilityLabel="Edit Profile"
        accessibilityState={{ disabled: isDemoMode }}
        activeOpacity={0.85}
      >
        <EditPencilIcon color={colors.textLight} />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  avatarRingParent: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  avatarRingChild: { backgroundColor: colors.secondarySoft, borderColor: colors.secondaryDark },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitials: { fontFamily: typography.fontFamily.mainBold, fontSize: typography.fontSizes.xxl },
  avatarInitialsParent: { color: colors.primary },
  avatarInitialsChild: { color: colors.secondaryDark },
  nameText: { fontFamily: typography.fontFamily.mainBold, fontSize: typography.fontSizes.xl, color: colors.text, textAlign: 'center' },
  emailText: { fontFamily: typography.fontFamily.secondary, fontSize: typography.fontSizes.sm, color: colors.textSecondary, textAlign: 'center', marginTop: 2, maxWidth: '100%' },
  roleBadge: { marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  roleBadgeParent: { backgroundColor: colors.primarySoft },
  roleBadgeChild: { backgroundColor: colors.secondarySoft },
  roleText: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.xs, letterSpacing: 0.6 },
  roleTextParent: { color: colors.primary },
  roleTextChild: { color: colors.secondaryDark },
  metaStrip: { width: '100%', flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.md, paddingTop: spacing.md },
  metaColumn: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xs },
  metaDivider: { width: 1, height: 32, backgroundColor: colors.border },
  metaLabel: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: typography.fontSizes.xs, color: colors.textMuted, marginBottom: 2 },
  metaValue: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.sm, color: colors.text, textAlign: 'center' },
  statusBanner: { width: '100%', marginTop: spacing.md, backgroundColor: colors.successSoft, borderWidth: 1, borderColor: colors.successBorder, borderRadius: borderRadius.md, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, alignItems: 'center' },
  statusBannerText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.xs, color: colors.success, textAlign: 'center' },
  errorBox: { width: '100%', marginTop: spacing.md, backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.dangerBorder, borderRadius: borderRadius.md, padding: spacing.sm, alignItems: 'center', gap: spacing.xs },
  errorText: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: typography.fontSizes.xs, color: colors.danger, textAlign: 'center' },
  retryButton: { minHeight: 48, minWidth: 120, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.dangerBorder, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center' },
  retryButtonText: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.xs, color: colors.primary },
  demoBanner: { width: '100%', marginTop: spacing.md, backgroundColor: colors.secondarySoft, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  demoBannerText: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: typography.fontSizes.xs, color: colors.primary, textAlign: 'center' },
  editButton: { marginTop: spacing.md, minHeight: 48, minWidth: 184, paddingHorizontal: spacing.lg, backgroundColor: colors.primary, borderRadius: borderRadius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  editButtonDisabled: { opacity: 0.5 },
  editButtonText: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.sm, color: colors.textLight },
  skeletonAvatar: { width: 84, height: 84, borderRadius: borderRadius.full, backgroundColor: colors.border, marginBottom: spacing.sm },
  skeletonName: { width: 160, height: 22, borderRadius: borderRadius.sm, backgroundColor: colors.border, marginBottom: spacing.xs },
  skeletonEmail: { width: 200, height: 14, borderRadius: borderRadius.sm, backgroundColor: colors.background, marginBottom: spacing.sm },
  skeletonBadge: { width: 76, height: 24, borderRadius: borderRadius.full, backgroundColor: colors.background, marginBottom: spacing.md },
  skeletonButton: { width: 184, height: 48, borderRadius: borderRadius.md, backgroundColor: colors.border },
});
