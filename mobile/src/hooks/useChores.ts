import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { choreService, CreateChoreParams } from '../services/choreService';
import { Chore } from '../types';

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message.trim().length > 0) {
    return err.message;
  }
  return fallback;
}

export function useChores(householdId?: string | null) {
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(householdId));
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Record<string, boolean>>({});
  const [mutationError, setMutationError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchChores = useCallback(async () => {
    if (!householdId) {
      if (isMountedRef.current) {
        setChores([]);
        setError(null);
        setLoading(false);
      }
      return;
    }

    if (isMountedRef.current) {
      setLoading(true);
    }

    try {
      const data = await choreService.getHouseholdChores(householdId);
      if (isMountedRef.current) {
        setChores(data);
        setError(null);
      }
    } catch (err: unknown) {
      if (isMountedRef.current) {
        setError(extractErrorMessage(err, 'Unable to load household chores. Please try again.'));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [householdId]);

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      if (!householdId) {
        if (active) {
          setChores([]);
          setError(null);
          setLoading(false);
        }
        return;
      }

      await fetchChores();
    }

    loadInitial();

    if (!householdId) {
      return () => {
        active = false;
      };
    }

    const channel = supabase
      .channel(`public:chores:household:${householdId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chores', filter: `household_id=eq.${householdId}` },
        () => {
          fetchChores();
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [householdId, fetchChores]);

  const createChoreOptimistic = useCallback(async (params: CreateChoreParams): Promise<Chore> => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const nowIso = new Date().toISOString();

    const optimisticChore: Chore = {
      id: tempId,
      household_id: params.householdId,
      assigned_child_id: params.assignedChildId,
      title: params.title,
      description: params.description || null,
      status: 'pending',
      proof_image_url: null,
      created_at: nowIso,
      updated_at: nowIso,
    };

    setMutationError(null);
    setPendingIds((prev) => ({ ...prev, [tempId]: true }));
    setChores((prev) => [optimisticChore, ...prev]);

    try {
      const created = await choreService.createChore(params);
      if (isMountedRef.current) {
        setChores((prev) => {
          const withoutDup = prev.filter((c) => c.id !== tempId && c.id !== created.id);
          return [created, ...withoutDup];
        });
        setPendingIds((prev) => {
          const next = { ...prev };
          delete next[tempId];
          return next;
        });
      }
      return created;
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Failed to save chore. Changes were rolled back.');
      if (isMountedRef.current) {
        // Roll back optimistic insertion on failure
        setChores((prev) => prev.filter((c) => c.id !== tempId));
        setPendingIds((prev) => {
          const next = { ...prev };
          delete next[tempId];
          return next;
        });
        setMutationError(message);
      }
      throw new Error(message);
    }
  }, []);

  const clearMutationError = useCallback(() => {
    setMutationError(null);
  }, []);

  const isPartial = Object.keys(pendingIds).length > 0 || (Boolean(error) && chores.length > 0);

  return {
    chores,
    loading,
    error,
    isPartial,
    pendingIds,
    mutationError,
    refetch: fetchChores,
    createChoreOptimistic,
    clearMutationError,
  };
}
