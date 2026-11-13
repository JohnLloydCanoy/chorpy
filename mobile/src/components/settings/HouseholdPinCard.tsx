import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatCountdown, useHouseholdPin } from '../../hooks/useHouseholdPin';
import { UserRole } from '../../types';
import { borderRadius, colors, spacing, typography } from '../../theme';

interface HouseholdPinCardProps {
  householdId: string | null;
  role: UserRole;
}

export function HouseholdPinCard({ householdId, role }: HouseholdPinCardProps) {
  const {
    activeHousehold,
    loadError,
    loading,
    remainingSeconds,
    hasActivePin,
    isRegenerating,
    isRegenerateDisabled,
    actionError,
    loadHousehold,
    handleRegenerate,
  } = useHouseholdPin(householdId, role);

  if (loading && !activeHousehold) {
    return (
      <View style={styles.card} accessibilityLabel="Loading household circle">
        <View style={styles.centerState}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.stateText}>Loading household circle...</Text>
        </View>
      </View>
    );
  }

  if (loadError && !activeHousehold) {
    return (
      <View style={styles.card}>
        <Text style={styles.errorBannerText}>{loadError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadHousehold} accessibilityRole="button" accessibilityLabel="Retry loading household details">
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!householdId || !activeHousehold) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyTitle}>No Household Linked</Text>
        <Text style={styles.stateText}>Join or create a family circle during onboarding to sync chores and pairing controls.</Text>
        {householdId ? (
          <TouchableOpacity style={styles.retryButton} onPress={loadHousehold} accessibilityRole="button" accessibilityLabel="Refresh household circle status">
            <Text style={styles.retryButtonText}>Refresh Status</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  const isParent = role === 'parent';
  const pinDisplay = isRegenerating ? 'Generating...' : hasActivePin ? activeHousehold.pairing_pin : 'Expired';
  const regenerateLabel = hasActivePin ? `Regenerate in ${formatCountdown(remainingSeconds)}` : 'Regenerate PIN';

  return (
    <View style={styles.card}>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Circle Name</Text>
        <Text style={styles.infoValue} numberOfLines={1}>{activeHousehold.name}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Circle Status</Text>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusBadgeText}>Active & Synced</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Pairing PIN</Text>
        {isParent ? (
          <Text style={hasActivePin || isRegenerating ? styles.pinValue : styles.pinExpiredBadge}>{pinDisplay}</Text>
        ) : (
          <Text style={styles.mutedBadge}>Parent Only</Text>
        )}
      </View>
      {isParent ? (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>PIN Validity</Text>
          <Text style={hasActivePin ? styles.countdownText : styles.expiredText}>
            {isRegenerating ? 'Issuing 30:00 window...' : hasActivePin ? `${formatCountdown(remainingSeconds)} remaining` : 'Expired — Regenerate to invite'}
          </Text>
        </View>
      ) : null}
      {actionError ? <View style={styles.actionErrorBox}><Text style={styles.errorBannerText}>{actionError}</Text></View> : null}
      {isParent ? (
        <TouchableOpacity
          style={[styles.regenerateButton, isRegenerateDisabled && styles.regenerateDisabled]}
          onPress={handleRegenerate}
          disabled={isRegenerateDisabled}
          accessibilityRole="button"
          accessibilityState={{ disabled: isRegenerateDisabled }}
          accessibilityLabel={hasActivePin ? `Regenerate household pairing PIN available in ${formatCountdown(remainingSeconds)}` : 'Regenerate household pairing PIN'}
        >
          {isRegenerating ? <ActivityIndicator size="small" color={colors.textLight} /> : <Text style={styles.regenerateText}>{regenerateLabel}</Text>}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  centerState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, gap: spacing.xs },
  emptyTitle: { fontFamily: typography.fontFamily.mainSemiBold, fontSize: typography.fontSizes.base, color: colors.text, marginBottom: spacing.xs },
  stateText: { fontFamily: typography.fontFamily.secondary, fontSize: typography.fontSizes.sm, color: colors.textSecondary, lineHeight: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.sm },
  infoLabel: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  infoValue: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.sm, color: colors.text, maxWidth: '60%', textAlign: 'right' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statusDot: { width: 8, height: 8, borderRadius: borderRadius.full, backgroundColor: colors.success },
  statusBadgeText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.sm, color: colors.success },
  pinValue: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.sm, color: colors.primary, backgroundColor: colors.primarySoft, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  pinExpiredBadge: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.sm, color: colors.danger, backgroundColor: colors.dangerSoft, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  mutedBadge: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.xs, color: colors.textSecondary, backgroundColor: colors.background, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.border },
  countdownText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.xs, color: colors.primary },
  expiredText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.xs, color: colors.danger, textAlign: 'right', flexShrink: 1 },
  actionErrorBox: { marginTop: spacing.sm, backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.dangerBorder, borderRadius: borderRadius.sm, padding: spacing.sm },
  errorBannerText: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: typography.fontSizes.xs, color: colors.danger },
  retryButton: { marginTop: spacing.sm, minHeight: 48, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  retryButtonText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.sm, color: colors.primary },
  regenerateButton: { marginTop: spacing.md, minHeight: 48, borderRadius: borderRadius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  regenerateDisabled: { opacity: 0.6 },
  regenerateText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.sm, color: colors.textLight },
});
