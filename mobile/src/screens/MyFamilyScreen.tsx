import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme';
import { useAuthContext } from '../context/AuthContext';
import { useChores } from '../hooks/useChores';
import { useHouseholdMembers } from '../hooks/useHouseholdMembers';
import { CreateChoreParams } from '../services/choreService';
import { UserRole } from '../types';
import { AddChoreForm } from '../components/family/AddChoreForm';
import { ChoreTable } from '../components/family/ChoreTable';

interface MyFamilyScreenProps {
  role?: UserRole;
}

export default function MyFamilyScreen({ role }: MyFamilyScreenProps) {
  const { user, profile } = useAuthContext();
  const effectiveRole: UserRole = role ?? profile?.role ?? 'parent';
  const householdId = profile?.household_id ?? null;
  const userId = user?.id;
  const fullName = profile?.full_name;
  const userEmail = user?.email;

  const displayName = useMemo(() => {
    const trimmedName = fullName?.trim();
    if (trimmedName) return trimmedName;
    if (userEmail) return userEmail.split('@')[0];
    return 'Member';
  }, [fullName, userEmail]);

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const {
    chores,
    loading,
    error,
    isPartial,
    pendingIds,
    mutationError,
    refetch,
    createChoreOptimistic,
    clearMutationError,
  } = useChores(householdId);

  const {
    members,
    loading: membersLoading,
    error: membersError,
    refetchMembers,
  } = useHouseholdMembers(householdId);

  const childMembers = useMemo(
    () => members.filter((member) => member.role === 'child'),
    [members]
  );

  const memberNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const member of members) {
      map[member.id] = member.full_name?.trim() || member.email.split('@')[0] || 'Child';
    }
    if (profile?.id && !map[profile.id]) {
      map[profile.id] = profile.full_name?.trim() || profile.email.split('@')[0] || 'Member';
    }
    return map;
  }, [members, profile]);

  const visibleChores = useMemo(() => {
    if (effectiveRole === 'parent') return chores;
    if (!userId) return [];
    return chores.filter((chore) => chore.assigned_child_id === userId);
  }, [chores, effectiveRole, userId]);

  const handleToggleAddForm = useCallback(() => {
    setIsAddFormOpen((prev) => !prev);
  }, []);

  const handleCloseAddForm = useCallback(() => {
    setIsAddFormOpen(false);
  }, []);

  const handleOpenAddForm = useCallback(() => {
    setIsAddFormOpen(true);
  }, []);

  const handleSubmitChore = useCallback(
    async (params: CreateChoreParams) => {
      await createChoreOptimistic(params);
    },
    [createChoreOptimistic]
  );

  return (
    <View style={styles.screenWrapper}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.greeting} numberOfLines={1}>Hello, {displayName}!</Text>
            <Text style={styles.subgreeting}>Canoy Family Circle</Text>
          </View>
          {effectiveRole === 'parent' ? (
            <TouchableOpacity
              style={styles.addChoreButton}
              onPress={handleToggleAddForm}
              accessibilityRole="button"
              accessibilityLabel={isAddFormOpen ? 'Close add chore form' : 'Add a new chore'}
              accessibilityState={{ expanded: isAddFormOpen }}
              activeOpacity={0.8}
            >
              <Text style={styles.addChoreButtonText}>Add Chore</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {effectiveRole === 'parent' && isAddFormOpen ? (
          <AddChoreForm
            householdId={householdId}
            childMembers={childMembers}
            membersLoading={membersLoading}
            membersError={membersError}
            onRetryMembers={refetchMembers}
            onSubmitChore={handleSubmitChore}
            onCancel={handleCloseAddForm}
          />
        ) : null}

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
            hasHousehold={Boolean(householdId)}
            onRetry={refetch}
            onDismissMutationError={clearMutationError}
            onOpenAddChore={effectiveRole === 'parent' ? handleOpenAddForm : undefined}
          />
        </View>
      </View>
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
    marginBottom: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  headerTextBlock: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fontFamily.mainBold,
    color: colors.primary,
  },
  subgreeting: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.secondary,
    color: colors.textSecondary,
  },
  addChoreButton: {
    minHeight: 48,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChoreButtonText: {
    color: colors.textLight,
    fontFamily: typography.fontFamily.secondaryBold,
    fontSize: typography.fontSizes.sm,
  },
  tableSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.base,
    fontFamily: typography.fontFamily.mainSemiBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
});
