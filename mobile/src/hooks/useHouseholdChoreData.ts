import { useMemo } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useChores } from './useChores';
import { useHouseholdMembers } from './useHouseholdMembers';
import { UserRole } from '../types';

export function useHouseholdChoreData(role?: UserRole) {
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

  const choresState = useChores(householdId);
  const membersState = useHouseholdMembers(householdId);

  const childMembers = useMemo(
    () => membersState.members.filter((member) => member.role === 'child'),
    [membersState.members]
  );

  const memberNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const member of membersState.members) {
      map[member.id] = member.full_name?.trim() || member.email.split('@')[0] || 'Child';
    }
    if (profile?.id && !map[profile.id]) {
      map[profile.id] = profile.full_name?.trim() || profile.email.split('@')[0] || 'Member';
    }
    return map;
  }, [membersState.members, profile]);

  const visibleChores = useMemo(() => {
    if (effectiveRole === 'parent') return choresState.chores;
    if (!userId) return [];
    return choresState.chores.filter((chore) => chore.assigned_child_id === userId);
  }, [choresState.chores, effectiveRole, userId]);

  return {
    effectiveRole,
    householdId,
    hasHousehold: Boolean(householdId),
    userId,
    displayName,
    visibleChores,
    childMembers,
    memberNameMap,
    ...choresState,
    members: membersState.members,
    membersLoading: membersState.loading,
    membersError: membersState.error,
    refetchMembers: membersState.refetchMembers,
  };
}
