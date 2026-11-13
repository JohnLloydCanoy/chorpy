import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
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
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshQuietly = useCallback(async () => {
    if (!householdId) return;

    try {
      const data = await householdService.getHouseholdMembers(householdId);
      if (isMountedRef.current) {
        setMembersState({ householdId, list: data, error: null });
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        const msg =
          err instanceof Error && err.message.trim().length > 0
            ? err.message
            : 'Unable to load household members.';
        setMembersState((prev) => ({
          householdId,
          list: prev.householdId === householdId ? prev.list : [],
          error: msg,
        }));
      }
    }
  }, [householdId]);

  const refetchMembers = useCallback(async () => {
    if (!householdId) return;

    setRetrying(true);
    try {
      const data = await householdService.getHouseholdMembers(householdId);
      if (isMountedRef.current) {
        setMembersState({ householdId, list: data, error: null });
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        const msg =
          err instanceof Error && err.message.trim().length > 0
            ? err.message
            : 'Unable to load household members.';
        setMembersState({ householdId, list: [], error: msg });
      }
    } finally {
      if (isMountedRef.current) {
        setRetrying(false);
      }
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

    const channel = supabase
      .channel(`household_members:${householdId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `household_id=eq.${householdId}`,
        },
        () => {
          void refreshQuietly();
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [householdId, refreshQuietly]);

  const members = useMemo(
    () => (householdId && membersState.householdId === householdId ? membersState.list : []),
    [householdId, membersState]
  );

  const error =
    householdId && membersState.householdId === householdId ? membersState.error : null;

  const loading = Boolean(householdId) && (retrying || membersState.householdId !== householdId);

  return { members, loading, error, refetchMembers };
}
