import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { useHouseholdChoreData } from '../hooks/useHouseholdChoreData';
import { useChoreSheetState } from '../hooks/useChoreSheetState';
import { CreateChoreParams, UpdateChoreParams } from '../services/choreService';
import { UserRole } from '../types';
import { FloatingAddButton } from '../components/common/FloatingAddButton';
import { AddChoreForm } from '../components/family/AddChoreForm';
import { ChoreTable } from '../components/family/ChoreTable';
import { FamilyMembersList } from '../components/family/FamilyMembersList';
import { FamilySubNav, FamilySubTab } from '../components/family/FamilySubNav';
import { InviteFamilyModal } from '../components/family/InviteFamilyModal';
import { HomeHeaderActions } from '../components/home/HomeHeaderActions';

interface MyFamilyScreenProps {
  role?: UserRole;
}

export default function MyFamilyScreen({ role }: MyFamilyScreenProps) {
  const {
    effectiveRole,
    householdId,
    hasHousehold,
    userId,
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
    members,
    membersLoading,
    membersError,
    refetchMembers,
  } = useHouseholdChoreData(role);

  const [activeTab, setActiveTab] = useState<FamilySubTab>('chores');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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

  const handleSelectTab = useCallback(
    (tab: FamilySubTab) => {
      setActiveTab(tab);
      closeSheet();
      setIsInviteModalOpen(false);
      if (tab === 'family') {
        void refetchMembers();
      }
    },
    [closeSheet, refetchMembers]
  );

  const handleOpenInviteModal = useCallback(() => {
    setIsInviteModalOpen(true);
  }, []);

  const handleCloseInviteModal = useCallback(() => {
    setIsInviteModalOpen(false);
  }, []);

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

  const showParentFab = effectiveRole === 'parent' && !isOpen && !isInviteModalOpen;

  return (
    <View style={styles.screenWrapper}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.greeting} numberOfLines={1}>Hello, {displayName}!</Text>
            <Text style={styles.subgreeting} numberOfLines={1}>Canoy Family Circle</Text>
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

        <FamilySubNav activeTab={activeTab} onSelectTab={handleSelectTab} />

        {activeTab === 'chores' ? (
          <View style={styles.tableSection}>
            <Text style={styles.sectionTitle}>
              {effectiveRole === 'parent' ? 'Household Chores' : 'My Chores'}
            </Text>
            <ChoreTable
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
              onOpenAddChore={effectiveRole === 'parent' ? handleOpenAddButton : undefined}
              onSelectChore={openChore}
            />
          </View>
        ) : (
          <View style={styles.tableSection}>
            <Text style={styles.sectionTitle}>Family Members</Text>
            <FamilyMembersList
              members={members}
              loading={membersLoading}
              error={membersError}
              hasHousehold={hasHousehold}
              currentUserId={userId}
              onRetry={refetchMembers}
            />
          </View>
        )}
      </View>

      {showParentFab ? (
        <FloatingAddButton
          onPress={activeTab === 'family' ? handleOpenInviteModal : handleOpenAddButton}
          accessibilityLabel={
            activeTab === 'family' ? 'Invite family members' : 'Add a new chore'
          }
          accessibilityHint={
            activeTab === 'family'
              ? 'Opens the family invite PIN modal'
              : 'Opens the form to assign a household chore'
          }
          expanded={activeTab === 'family' ? isInviteModalOpen : isOpen}
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

      <InviteFamilyModal
        visible={effectiveRole === 'parent' && isInviteModalOpen}
        householdId={householdId}
        role={effectiveRole}
        onClose={handleCloseInviteModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, width: '95%', alignSelf: 'center', paddingVertical: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  headerTextBlock: { flex: 1, minWidth: 0 },
  greeting: { fontSize: typography.fontSizes.xl, fontFamily: typography.fontFamily.mainBold, color: colors.primary },
  subgreeting: { fontSize: typography.fontSizes.sm, fontFamily: typography.fontFamily.secondary, color: colors.textSecondary },
  tableSection: { flex: 1 },
  sectionTitle: { fontSize: typography.fontSizes.base, fontFamily: typography.fontFamily.mainSemiBold, color: colors.text, marginBottom: spacing.sm },
});
