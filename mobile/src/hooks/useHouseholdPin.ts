import { useCallback, useEffect, useState } from 'react';
import { householdService } from '../services/householdService';
import { Household, UserRole } from '../types';

interface HouseholdSnapshotState {
  fetchedForId: string | null;
  household: Household | null;
  serverOffsetMs: number;
  error: string | null;
}

export interface UseHouseholdPinResult {
  activeHousehold: Household | null;
  loadError: string | null;
  loading: boolean;
  remainingSeconds: number;
  hasActivePin: boolean;
  isRegenerating: boolean;
  isRegenerateDisabled: boolean;
  actionError: string | null;
  loadHousehold: () => Promise<void>;
  handleRegenerate: () => Promise<void>;
}

function getRemainingSeconds(expiresAt: string | null, serverOffsetMs: number): number {
  if (!expiresAt) return 0;
  const expiresMs = Date.parse(expiresAt);
  if (Number.isNaN(expiresMs)) return 0;
  return Math.max(0, Math.floor((expiresMs - (Date.now() + serverOffsetMs)) / 1000));
}

export function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function useHouseholdPin(
  householdId: string | null,
  role: UserRole
): UseHouseholdPinResult {
  const [snapshot, setSnapshot] = useState<HouseholdSnapshotState>({
    fetchedForId: null,
    household: null,
    serverOffsetMs: 0,
    error: null,
  });
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const applyHouseholdSnapshot = useCallback((targetId: string | null, next: Household | null) => {
    const offset =
      next?.server_now && !Number.isNaN(Date.parse(next.server_now))
        ? Date.parse(next.server_now) - Date.now()
        : 0;
    setSnapshot({ fetchedForId: targetId, household: next, serverOffsetMs: offset, error: null });
    setRemainingSeconds(next ? getRemainingSeconds(next.pin_expires_at, offset) : 0);
  }, []);

  const loadHousehold = useCallback(async () => {
    if (!householdId) return;
    setRetrying(true);
    setActionError(null);
    try {
      const data = await householdService.getMyHousehold();
      applyHouseholdSnapshot(householdId, data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load household details.';
      setSnapshot({ fetchedForId: householdId, household: null, serverOffsetMs: 0, error: msg });
    } finally {
      setRetrying(false);
    }
  }, [householdId, applyHouseholdSnapshot]);

  useEffect(() => {
    if (!householdId) return;
    let active = true;
    householdService
      .getMyHousehold()
      .then((data) => {
        if (active) applyHouseholdSnapshot(householdId, data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        const msg = err instanceof Error ? err.message : 'Unable to load household details.';
        setSnapshot({ fetchedForId: householdId, household: null, serverOffsetMs: 0, error: msg });
      });
    return () => {
      active = false;
    };
  }, [householdId, applyHouseholdSnapshot]);

  const activeHousehold =
    householdId && snapshot.fetchedForId === householdId ? snapshot.household : null;
  const loadError = householdId && snapshot.fetchedForId === householdId ? snapshot.error : null;
  const loading = Boolean(householdId) && (retrying || snapshot.fetchedForId !== householdId);
  const hasActivePin = Boolean(
    activeHousehold?.pairing_pin && activeHousehold?.pin_expires_at && remainingSeconds > 0
  );
  const isRegenerateDisabled = isRegenerating || hasActivePin;

  useEffect(() => {
    if (role !== 'parent' || !activeHousehold?.pin_expires_at) return;
    const expiresAt = activeHousehold.pin_expires_at;
    const offsetMs = snapshot.serverOffsetMs;
    const intervalId = setInterval(
      () => setRemainingSeconds(getRemainingSeconds(expiresAt, offsetMs)),
      1000
    );
    return () => clearInterval(intervalId);
  }, [role, activeHousehold?.pin_expires_at, snapshot.serverOffsetMs]);

  const handleRegenerate = useCallback(async () => {
    if (role !== 'parent' || isRegenerating || !householdId || hasActivePin) return;
    setIsRegenerating(true);
    setActionError(null);
    try {
      const updated = await householdService.regeneratePin();
      applyHouseholdSnapshot(householdId, updated);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Could not regenerate pairing PIN. Please try again.';
      setActionError(msg);
    } finally {
      setIsRegenerating(false);
    }
  }, [role, isRegenerating, householdId, hasActivePin, applyHouseholdSnapshot]);

  return {
    activeHousehold,
    loadError,
    loading,
    remainingSeconds,
    hasActivePin,
    isRegenerating,
    isRegenerateDisabled,
    actionError,
    loadHousehold,
    handleRegenerate,
  };
}
