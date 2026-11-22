import { useEffect, useState, useCallback, useRef, useId } from 'react';
import { supabase } from '../lib/supabase';
import { choreService, CreateChoreParams, UpdateChoreParams } from '../services/choreService';
import { Chore } from '../types';

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message.trim().length > 0) {
    return err.message;
  }
  return fallback;
}

function sortChoresDescending(list: Chore[]): Chore[] {
  return [...list].sort((a, b) => {
    const schedDiff = Date.parse(b.scheduled_at || b.created_at) - Date.parse(a.scheduled_at || a.created_at);
    if (!Number.isNaN(schedDiff) && schedDiff !== 0) {
      return schedDiff;
    }
    return Date.parse(b.created_at) - Date.parse(a.created_at);
  });
}

export function useChores(householdId?: string | null) {
  const instanceId = useId();
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(householdId));
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Record<string, boolean>>({});
  const [mutationError, setMutationError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const choresRef = useRef<Chore[]>([]);

  useEffect(() => {
    choresRef.current = chores;
  }, [chores]);

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
      .channel(`public:chores:household:${householdId}:${instanceId}`)
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
  }, [householdId, fetchChores, instanceId]);

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
      scheduled_at: params.scheduledAt,
      lock_at: params.lockAt,
      lock_mode: params.lockMode,
      created_at: nowIso,
      updated_at: nowIso,
    };

    setMutationError(null);
    setPendingIds((prev) => ({ ...prev, [tempId]: true }));
    setChores((prev) => sortChoresDescending([optimisticChore, ...prev]));

    try {
      const created = await choreService.createChore(params);
      if (isMountedRef.current) {
        setChores((prev) => {
          const withoutDup = prev.filter((c) => c.id !== tempId && c.id !== created.id);
          return sortChoresDescending([created, ...withoutDup]);
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

  const updateChoreOptimistic = useCallback(async (params: UpdateChoreParams): Promise<Chore> => {
    const previousSnapshot = choresRef.current.find((c) => c.id === params.choreId) ?? null;
    const updatedIso = new Date().toISOString();

    setMutationError(null);
    setPendingIds((prev) => ({ ...prev, [params.choreId]: true }));
    if (previousSnapshot) {
      const optimisticChore: Chore = {
        ...previousSnapshot,
        assigned_child_id: params.assignedChildId,
        title: params.title,
        description: params.description || null,
        scheduled_at: params.scheduledAt,
        lock_at: params.lockAt,
        lock_mode: params.lockMode,
        updated_at: updatedIso,
      };
      setChores((prev) =>
        sortChoresDescending(prev.map((c) => (c.id === params.choreId ? optimisticChore : c)))
      );
    }

    try {
      const updated = await choreService.updateChore(params);
      if (isMountedRef.current) {
        setChores((prev) =>
          sortChoresDescending(prev.map((c) => (c.id === updated.id ? updated : c)))
        );
        setPendingIds((prev) => {
          const next = { ...prev };
          delete next[params.choreId];
          return next;
        });
      }
      return updated;
    } catch (err: unknown) {
      const message = extractErrorMessage(err, 'Failed to update chore. Changes were rolled back.');
      if (isMountedRef.current) {
        if (previousSnapshot) {
          setChores((prev) =>
            sortChoresDescending(prev.map((c) => (c.id === params.choreId ? previousSnapshot : c)))
          );
        }
        setPendingIds((prev) => {
          const next = { ...prev };
          delete next[params.choreId];
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
    updateChoreOptimistic,
    clearMutationError,
  };
}
