import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, spacing, typography } from '../../theme';
import { UserRole } from '../../types';

interface CalendarBannersProps {
  isPartial: boolean;
  error: string | null;
  mutationError: string | null;
  onRetry: () => void;
  onDismissMutationError: () => void;
}

export const CalendarStatusBanners = React.memo(function CalendarStatusBanners({
  isPartial,
  error,
  mutationError,
  onRetry,
  onDismissMutationError,
}: CalendarBannersProps) {
  return (
    <>
      {mutationError ? (
        <View style={styles.bannerError}>
          <Text style={styles.bannerErrorText}>{mutationError}</Text>
          <TouchableOpacity
            style={styles.bannerAction}
            onPress={onDismissMutationError}
            accessibilityRole="button"
            accessibilityLabel="Dismiss rollback notice"
          >
            <Text style={styles.bannerActionText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {isPartial ? (
        <View style={styles.bannerPartial}>
          <Text style={styles.bannerPartialText}>
            {error ? `Showing cached schedule. Sync issue: ${error}` : 'Saving chore updates...'}
          </Text>
          {error ? (
            <TouchableOpacity
              style={styles.bannerAction}
              onPress={onRetry}
              accessibilityRole="button"
              accessibilityLabel="Retry syncing calendar"
            >
              <Text style={styles.bannerActionText}>Retry</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </>
  );
});

export const CalendarLoadingSkeleton = React.memo(function CalendarLoadingSkeleton() {
  return (
    <View style={styles.skeletonCard} accessibilityLabel="Loading chore calendar">
      <View style={styles.skeletonToolbar}>
        <View style={styles.skeletonPill} />
        <View style={styles.skeletonPillWide} />
        <View style={styles.skeletonPill} />
      </View>
      <View style={styles.skeletonGridRow}><View style={styles.skeletonCell} /><View style={styles.skeletonCell} /><View style={styles.skeletonCell} /></View>
      <View style={styles.skeletonGridRow}><View style={styles.skeletonCell} /><View style={styles.skeletonCell} /><View style={styles.skeletonCell} /></View>
      <View style={styles.skeletonGridRow}><View style={styles.skeletonCell} /><View style={styles.skeletonCell} /><View style={styles.skeletonCell} /></View>
      <View style={styles.skeletonGridRow}><View style={styles.skeletonCell} /><View style={styles.skeletonCell} /><View style={styles.skeletonCell} /></View>
    </View>
  );
});

interface CalendarErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const CalendarErrorState = React.memo(function CalendarErrorState({
  error,
  onRetry,
}: CalendarErrorStateProps) {
  return (
    <View style={styles.stateBox}>
      <Text style={styles.stateTitle}>Unable to Load Calendar</Text>
      <Text style={styles.stateBody}>{error}</Text>
      <TouchableOpacity
        style={styles.primaryAction}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry loading chore calendar"
      >
        <Text style={styles.primaryActionText}>Retry Loading Calendar</Text>
      </TouchableOpacity>
    </View>
  );
});

interface CalendarEmptyStateProps {
  role: UserRole;
  hasHousehold: boolean;
  mutationError: string | null;
  onDismissMutationError: () => void;
  onOpenAddChore?: () => void;
}

export const CalendarEmptyState = React.memo(function CalendarEmptyState({
  role,
  hasHousehold,
  mutationError,
  onDismissMutationError,
  onOpenAddChore,
}: CalendarEmptyStateProps) {
  const emptyBody = !hasHousehold
    ? 'No household is linked yet. Join or create a family circle in Settings first.'
    : role === 'parent'
    ? 'Chirp! Add your first household chore to see it scheduled across Day, Week, and Month views.'
    : 'You have no scheduled chores right now. Check back soon.';

  return (
    <View style={styles.stateBox}>
      {mutationError ? (
        <View style={styles.bannerError}>
          <Text style={styles.bannerErrorText}>{mutationError}</Text>
          <TouchableOpacity
            style={styles.bannerAction}
            onPress={onDismissMutationError}
            accessibilityRole="button"
            accessibilityLabel="Dismiss error"
          >
            <Text style={styles.bannerActionText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <Text style={styles.stateTitle}>No Scheduled Chores Yet</Text>
      <Text style={styles.stateBody}>{emptyBody}</Text>
      {role === 'parent' && hasHousehold && onOpenAddChore ? (
        <TouchableOpacity
          style={styles.primaryAction}
          onPress={onOpenAddChore}
          accessibilityRole="button"
          accessibilityLabel="Add your first household chore"
        >
          <Text style={styles.primaryActionText}>Add First Chore</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  skeletonCard: { flex: 1, minHeight: 420, backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  skeletonToolbar: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm },
  skeletonPill: { width: 64, height: 32, borderRadius: borderRadius.sm, backgroundColor: colors.border },
  skeletonPillWide: { flex: 1, height: 32, borderRadius: borderRadius.sm, backgroundColor: colors.border },
  skeletonGridRow: { flexDirection: 'row', padding: spacing.md, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  skeletonCell: { flex: 1, height: 64, borderRadius: borderRadius.sm, backgroundColor: colors.background },
  stateBox: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  stateTitle: { fontSize: typography.fontSizes.lg, fontFamily: typography.fontFamily.mainSemiBold, color: colors.primary, marginBottom: spacing.xs, textAlign: 'center' },
  stateBody: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  primaryAction: { minHeight: 48, backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  primaryActionText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryBold, color: colors.textLight },
  bannerPartial: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.secondarySoft, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  bannerPartialText: { flex: 1, fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryMedium, color: colors.primary },
  bannerError: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.dangerSoft, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.dangerBorder, width: '100%', marginBottom: spacing.sm },
  bannerErrorText: { flex: 1, fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryMedium, color: colors.danger },
  bannerAction: { minHeight: 48, paddingHorizontal: spacing.sm, justifyContent: 'center' },
  bannerActionText: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryBold, color: colors.primary },
});
