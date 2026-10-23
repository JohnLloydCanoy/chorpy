import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { choreService } from '../services/choreService';
import { Chore } from '../types';

export function useChores(householdId?: string | null) {
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChores = useCallback(async () => {
    if (!householdId) {
      setChores([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await choreService.getHouseholdChores(householdId);
      setChores(data);
    } catch (err) {
      console.warn('[useChores] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [householdId]);

  useEffect(() => {
    if (!householdId) return;

    fetchChores();

    // Subscribe to real-time changes on the chores table
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
      supabase.removeChannel(channel);
    };
  }, [householdId, fetchChores]);

  return { chores, loading, refetch: fetchChores };
}
