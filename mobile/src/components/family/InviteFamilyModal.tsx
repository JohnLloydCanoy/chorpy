import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatCountdown, useHouseholdPin } from '../../hooks/useHouseholdPin';
import { borderRadius, colors, spacing, typography } from '../../theme';
import { UserRole } from '../../types';

interface InviteFamilyModalProps {
  visible: boolean;
  householdId: string | null;
  role: UserRole;
  onClose: () => void;
}

export const InviteFamilyModal = React.memo(function InviteFamilyModal({
  visible,
  householdId,
  role,
  onClose,
}: InviteFamilyModalProps) {
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

  useEffect(() => {
    if (visible && householdId) {
      void loadHousehold();
    }
  }, [visible, householdId, loadHousehold]);

  const handleClose = useCallback(() => {
    if (isRegenerating) return;
    onClose();
  }, [isRegenerating, onClose]);

  const isParent = role === 'parent';
  const showPopulated = !(loading && !activeHousehold) && !(loadError && !activeHousehold) && Boolean(householdId && activeHousehold);
  const pinDisplay = isRegenerating ? 'Generating...' : hasActivePin ? activeHousehold?.pairing_pin ?? 'Expired' : 'Expired';
  const validityDisplay = isRegenerating
    ? 'Issuing 30:00 window...'
    : hasActivePin
      ? `${formatCountdown(remainingSeconds)} remaining`
      : 'Expired — Regenerate to invite';
  const regenerateLabel = hasActivePin
    ? `Regenerate in ${formatCountdown(remainingSeconds)}`
    : 'Regenerate PIN';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard} accessibilityViewIsModal>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Invite Family</Text>
          </View>

          <View style={styles.modalBody}>
            {loading && !activeHousehold ? (
              <View style={styles.centerState} accessibilityLabel="Loading household details">
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.stateText}>Loading household details...</Text>
              </View>
            ) : loadError && !activeHousehold ? (
              <View style={styles.stateBlock}>
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{loadError}</Text>
                </View>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={loadHousehold}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading household details"
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : !householdId || !activeHousehold ? (
              <View style={styles.stateBlock}>
                <Text style={styles.emptyTitle}>No Household Linked</Text>
                <Text style={styles.stateText}>
                  Join or create a family circle during onboarding to invite family members.
                </Text>
                {householdId ? (
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={loadHousehold}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Refresh household circle status"
                  >
                    <Text style={styles.retryButtonText}>Refresh Status</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : (
              <View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Family Name</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>{activeHousehold.name}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Pairing PIN</Text>
                  {isParent ? (
                    <Text style={hasActivePin || isRegenerating ? styles.pinValue : styles.pinExpiredBadge}>
                      {pinDisplay}
                    </Text>
                  ) : (
                    <Text style={styles.mutedBadge}>Parent Only</Text>
                  )}
                </View>

                {isParent ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>PIN Validity</Text>
                    <Text style={hasActivePin ? styles.countdownText : styles.expiredText}>
                      {validityDisplay}
                    </Text>
                  </View>
                ) : null}

                {actionError ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{actionError}</Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.closeButton, showPopulated && isParent && styles.closeButtonSplit, isRegenerating && styles.disabledButton]}
              onPress={handleClose}
              disabled={isRegenerating}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Close invite family dialog"
              accessibilityState={{ disabled: isRegenerating }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>

            {showPopulated && isParent ? (
              <TouchableOpacity
                style={[styles.regenerateButton, isRegenerateDisabled && styles.disabledButton]}
                onPress={handleRegenerate}
                disabled={isRegenerateDisabled}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ disabled: isRegenerateDisabled }}
                accessibilityLabel={
                  hasActivePin
                    ? `Regenerate household pairing PIN available in ${formatCountdown(remainingSeconds)}`
                    : 'Regenerate household pairing PIN'
                }
              >
                {isRegenerating ? (
                  <ActivityIndicator size="small" color={colors.textLight} />
                ) : (
                  <Text style={styles.regenerateButtonText}>{regenerateLabel}</Text>
                )}
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, backgroundColor: 'rgba(15, 23, 42, 0.55)' },
  modalCard: { width: '100%', maxWidth: 420, backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  modalHeader: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.background },
  modalTitle: { fontSize: typography.fontSizes.lg, fontFamily: typography.fontFamily.mainSemiBold, color: colors.text, textAlign: 'center' },
  modalBody: { padding: spacing.md },
  centerState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, gap: spacing.xs },
  stateBlock: { gap: spacing.xs },
  emptyTitle: { fontFamily: typography.fontFamily.mainSemiBold, fontSize: typography.fontSizes.base, color: colors.text },
  stateText: { fontFamily: typography.fontFamily.secondary, fontSize: typography.fontSizes.sm, color: colors.textSecondary, lineHeight: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.sm },
  infoLabel: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  infoValue: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.sm, color: colors.text, maxWidth: '60%', textAlign: 'right' },
  pinValue: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.sm, color: colors.primary, backgroundColor: colors.primarySoft, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  pinExpiredBadge: { fontFamily: typography.fontFamily.secondaryBold, fontSize: typography.fontSizes.sm, color: colors.danger, backgroundColor: colors.dangerSoft, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  mutedBadge: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.xs, color: colors.textSecondary, backgroundColor: colors.background, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.border },
  countdownText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.xs, color: colors.primary },
  expiredText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.xs, color: colors.danger, textAlign: 'right', flexShrink: 1 },
  errorBox: { marginTop: spacing.xs, backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.dangerBorder, borderRadius: borderRadius.sm, padding: spacing.sm },
  errorText: { fontFamily: typography.fontFamily.secondaryMedium, fontSize: typography.fontSizes.xs, color: colors.danger },
  retryButton: { marginTop: spacing.sm, minHeight: 48, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  retryButtonText: { fontFamily: typography.fontFamily.secondarySemiBold, fontSize: typography.fontSizes.sm, color: colors.primary },
  actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
  closeButton: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  closeButtonSplit: { borderRightWidth: 1, borderRightColor: colors.border },
  closeButtonText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondarySemiBold, color: colors.textSecondary },
  regenerateButton: { flex: 2, minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, paddingHorizontal: spacing.md },
  regenerateButtonText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryBold, color: colors.textLight },
  disabledButton: { opacity: 0.6 },
});
