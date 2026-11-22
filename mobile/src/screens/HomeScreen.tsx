import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { UserRole } from '../types';
import { CreateChoreParams, UpdateChoreParams } from '../services/choreService';
import { useHouseholdChoreData } from '../hooks/useHouseholdChoreData';
import { useChoreSheetState } from '../hooks/useChoreSheetState';
import { ChoreCalendarView } from '../components/calendar/ChoreCalendarView';
import { FloatingAddButton } from '../components/common/FloatingAddButton';
import { AddChoreForm } from '../components/family/AddChoreForm';
import { HomeHeaderActions } from '../components/home/HomeHeaderActions';

interface HomeScreenProps {
  role?: UserRole;
}

export default function HomeScreen({ role }: HomeScreenProps) {
  const {
    effectiveRole,
    householdId,
    hasHousehold,
    displayName,
    visibleChores,
    childMembers,
    memberNameMap,
    loading,
    error,
    isPartial,
    pendingIds,
    mutationError,
    refetch,
    createChoreOptimistic,
    updateChoreOptimistic,
    clearMutationError,
    membersLoading,
    membersError,
    refetchMembers,
  } = useHouseholdChoreData(role);

  const {
    isOpen,
    mode,
    selectedChore,
    initialScheduledAt,
    sessionKey,
    openCreate,
    openChore,
    closeSheet,
  } = useChoreSheetState(effectiveRole);

  const handleOpenAddButton = useCallback(() => {
    openCreate();
  }, [openCreate]);

  const handleSubmitChore = useCallback(
    async (params: CreateChoreParams) => {
      await createChoreOptimistic(params);
    },
    [createChoreOptimistic]
  );

  const handleUpdateChore = useCallback(
    async (params: UpdateChoreParams) => {
      await updateChoreOptimistic(params);
    },
    [updateChoreOptimistic]
  );

  const selectedAssignedLabel = selectedChore
    ? memberNameMap[selectedChore.assigned_child_id] || 'Assigned Child'
    : undefined;

  return (
    <View style={styles.screenWrapper}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {effectiveRole === 'parent' ? 'Household Calendar' : 'My Chore Calendar'}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              Hello, {displayName}
            </Text>
          </View>

          <HomeHeaderActions
            role={effectiveRole}
            chores={visibleChores}
            memberNameMap={memberNameMap}
            loading={loading}
            error={error}
            isPartial={isPartial}
            pendingIds={pendingIds}
            onRetry={refetch}
            onSelectChore={openChore}
          />
        </View>

        <View style={styles.calendarSection}>
          <ChoreCalendarView
            chores={visibleChores}
            role={effectiveRole}
            loading={loading}
            error={error}
            isPartial={isPartial}
            mutationError={mutationError}
            pendingIds={pendingIds}
            memberNameMap={memberNameMap}
            hasHousehold={hasHousehold}
            onRetry={refetch}
            onDismissMutationError={clearMutationError}
            onOpenAddChore={effectiveRole === 'parent' ? openCreate : undefined}
            onSelectChore={openChore}
          />
        </View>
      </View>

      {effectiveRole === 'parent' && !isOpen ? (
        <FloatingAddButton
          onPress={handleOpenAddButton}
          accessibilityLabel="Add a new chore"
          accessibilityHint="Opens the form to assign a household chore"
          expanded={isOpen}
        />
      ) : null}

      <AddChoreForm
        visible={isOpen}
        mode={mode}
        role={effectiveRole}
        chore={selectedChore}
        assignedLabel={selectedAssignedLabel}
        initialScheduledAt={initialScheduledAt}
        openSessionKey={sessionKey}
        householdId={householdId}
        childMembers={childMembers}
        membersLoading={membersLoading}
        membersError={membersError}
        onRetryMembers={refetchMembers}
        onSubmitChore={effectiveRole === 'parent' ? handleSubmitChore : undefined}
        onUpdateChore={effectiveRole === 'parent' ? handleUpdateChore : undefined}
        onCancel={closeSheet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    width: '95%',
    alignSelf: 'center',
    paddingVertical: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.mainBold,
    color: colors.primary,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
  },
  calendarSection: {
    flex: 1,
  },
});
