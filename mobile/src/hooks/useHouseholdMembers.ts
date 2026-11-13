import { useState, useEffect, useCallback, useMemo } from 'react';
import { householdService } from '../services/householdService';
import { Profile } from '../types';

interface MembersState {
  householdId: string | null;
  list: Profile[];
  error: string | null;
}

export function useHouseholdMembers(householdId?: string | null) {
  const [membersState, setMembersState] = useState<MembersState>({
    householdId: null,
    list: [],
    error: null,
  });
  const [retrying, setRetrying] = useState(false);

  const refetchMembers = useCallback(async () => {
    if (!householdId) return;

    setRetrying(true);
    try {
      const data = await householdService.getHouseholdMembers(householdId);
      setMembersState({ householdId, list: data, error: null });
    } catch (err: unknown) {
      const msg =
        err instanceof Error && err.message.trim().length > 0
          ? err.message
          : 'Unable to load household members.';
      setMembersState({ householdId, list: [], error: msg });
    } finally {
      setRetrying(false);
    }
  }, [householdId]);

  useEffect(() => {
    if (!householdId) return;
    let active = true;

    householdService
      .getHouseholdMembers(householdId)
      .then((data) => {
        if (active) {
          setMembersState({ householdId, list: data, error: null });
        }
      })
      .catch((err: unknown) => {
        if (active) {
          const msg =
            err instanceof Error && err.message.trim().length > 0
              ? err.message
              : 'Unable to load household members.';
          setMembersState({ householdId, list: [], error: msg });
        }
      });

    return () => {
      active = false;
    };
  }, [householdId]);

  const members = useMemo(
    () => (householdId && membersState.householdId === householdId ? membersState.list : []),
    [householdId, membersState]
  );

  const error =
    householdId && membersState.householdId === householdId ? membersState.error : null;

  const loading = Boolean(householdId) && (retrying || membersState.householdId !== householdId);

  return { members, loading, error, refetchMembers };
}
