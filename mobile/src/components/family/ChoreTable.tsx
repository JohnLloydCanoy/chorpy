import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ListRenderItem } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { Chore, UserRole } from '../../types';
import { ChoreRow, CHORE_ROW_HEIGHT } from './ChoreRow';

interface ChoreTableProps {
  chores: Chore[];
  role: UserRole;
  loading: boolean;
  error: string | null;
  isPartial: boolean;
  mutationError: string | null;
  pendingIds: Record<string, boolean>;
  memberNameMap: Record<string, string>;
  hasHousehold: boolean;
  onRetry: () => void;
  onDismissMutationError: () => void;
  onOpenAddChore?: () => void;
}

export const ChoreTable = React.memo(function ChoreTable({
  chores,
  role,
  loading,
  error,
  isPartial,
  mutationError,
  pendingIds,
  memberNameMap,
  hasHousehold,
  onRetry,
  onDismissMutationError,
  onOpenAddChore,
}: ChoreTableProps) {
  const keyExtractor = useCallback((item: Chore) => item.id, []);

  const getItemLayout = useCallback(
    (_data: ArrayLike<Chore> | null | undefined, index: number) => ({
      length: CHORE_ROW_HEIGHT,
      offset: CHORE_ROW_HEIGHT * index,
      index,
    }),
    []
  );

  const renderItem: ListRenderItem<Chore> = useCallback(
    ({ item }) => (
      <ChoreRow
        chore={item}
        assignedLabel={memberNameMap[item.assigned_child_id] || 'Assigned Child'}
        isPendingSync={Boolean(pendingIds[item.id])}
      />
    ),
    [memberNameMap, pendingIds]
  );

  const listHeader = useMemo(
    () => (
      <View>
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
              {error ? `Showing cached chores. Sync issue: ${error}` : 'Saving chore updates...'}
            </Text>
            {error ? (
              <TouchableOpacity
                style={styles.bannerAction}
                onPress={onRetry}
                accessibilityRole="button"
                accessibilityLabel="Retry syncing chores"
              >
                <Text style={styles.bannerActionText}>Retry</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.colTitle]}>Chore</Text>
          <Text style={[styles.headerCell, styles.colChild]}>Assigned</Text>
          <Text style={[styles.headerCell, styles.colStatusText]}>Status</Text>
        </View>
      </View>
    ),
    [mutationError, isPartial, error, onDismissMutationError, onRetry]
  );

  if (loading && chores.length === 0) {
    return (
      <View style={styles.tableContainer} accessibilityLabel="Loading household chores">
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, styles.colTitle]}>Chore</Text>
          <Text style={[styles.headerCell, styles.colChild]}>Assigned</Text>
          <Text style={[styles.headerCell, styles.colStatusText]}>Status</Text>
        </View>
        <View style={styles.skeletonRow}><View style={styles.skeletonBarWide} /><View style={styles.skeletonBarNarrow} /></View>
        <View style={styles.skeletonRow}><View style={styles.skeletonBarWide} /><View style={styles.skeletonBarNarrow} /></View>
        <View style={styles.skeletonRow}><View style={styles.skeletonBarWide} /><View style={styles.skeletonBarNarrow} /></View>
        <View style={styles.skeletonRow}><View style={styles.skeletonBarWide} /><View style={styles.skeletonBarNarrow} /></View>
      </View>
    );
  }

  if (error && chores.length === 0) {
    return (
      <View style={styles.stateBox}>
        <Text style={styles.stateTitle}>Unable to Load Chores</Text>
        <Text style={styles.stateBody}>{error}</Text>
        <TouchableOpacity
          style={styles.primaryAction}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry loading household chores"
        >
          <Text style={styles.primaryActionText}>Retry Loading Chores</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!loading && chores.length === 0) {
    const emptyBody = !hasHousehold
      ? 'No household is linked yet. Join or create a family circle in Settings first.'
      : role === 'parent'
      ? 'Chirp! Ready to organize the household. Add your first chore to get started.'
      : 'You have no assigned chores right now. Check back soon.';

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
        <Text style={styles.stateTitle}>No Chores Yet</Text>
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
  }

  return (
    <View style={styles.tableContainer}>
      <FlatList
        data={chores}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        ListHeaderComponent={listHeader}
        removeClippedSubviews
        maxToRenderPerBatch={15}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={onRetry}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  tableContainer: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerCell: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryBold, color: colors.textSecondary },
  colTitle: { flex: 2, paddingRight: spacing.sm },
  colChild: { flex: 1.2, paddingRight: spacing.sm },
  colStatusText: { flex: 1, textAlign: 'right' },
  skeletonRow: { height: CHORE_ROW_HEIGHT, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  skeletonBarWide: { width: '55%', height: 14, borderRadius: borderRadius.sm, backgroundColor: colors.border },
  skeletonBarNarrow: { width: '24%', height: 14, borderRadius: borderRadius.sm, backgroundColor: colors.border },
  stateBox: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  stateTitle: { fontSize: typography.fontSizes.lg, fontFamily: typography.fontFamily.mainSemiBold, color: colors.primary, marginBottom: spacing.xs, textAlign: 'center' },
  stateBody: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.md },
  primaryAction: { minHeight: 48, backgroundColor: colors.primary, borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  primaryActionText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondaryBold, color: colors.textLight },
  bannerPartial: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.secondarySoft, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  bannerPartialText: { flex: 1, fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryMedium, color: colors.primary },
  bannerError: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.dangerSoft, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.dangerBorder, width: '100%', marginBottom: spacing.sm },
  bannerErrorText: { flex: 1, fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryMedium, color: colors.danger },
  bannerAction: { minHeight: 48, paddingHorizontal: spacing.sm, justifyContent: 'center' },
  bannerActionText: { fontSize: typography.fontSizes.xs, fontFamily: typography.fontFamily.secondaryBold, color: colors.primary },
});
