import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthContext } from './AuthContext';

interface NotificationReadState {
  lastSeenAt: number;
  readIds: Record<string, boolean>;
  hydrated: boolean;
}

interface NotificationContextValue extends NotificationReadState {
  markAllRead: (newestTimestampMs?: number) => void;
  markItemRead: (choreId: string) => void;
}

const DEFAULT_VALUE: NotificationContextValue = {
  lastSeenAt: 0,
  readIds: {},
  hydrated: true,
  markAllRead: () => {},
  markItemRead: () => {},
};

const NotificationContext = createContext<NotificationContextValue>(DEFAULT_VALUE);

function buildStorageKey(userId?: string): string {
  return `chorpy_notif_seen_v1_${userId || 'demo'}`;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const storageKey = buildStorageKey(user?.id);

  const [prevKey, setPrevKey] = useState(storageKey);
  const [lastSeenAt, setLastSeenAt] = useState<number>(0);
  const [readIds, setReadIds] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState<boolean>(false);

  if (storageKey !== prevKey) {
    setPrevKey(storageKey);
    setLastSeenAt(0);
    setReadIds({});
    setHydrated(false);
  }

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (!active) return;
        const parsed = raw ? Number(raw) : 0;
        setLastSeenAt(Number.isFinite(parsed) && parsed > 0 ? parsed : 0);
        setHydrated(true);
      })
      .catch(() => {
        if (!active) return;
        setHydrated(true);
      });

    return () => {
      active = false;
    };
  }, [storageKey]);

  const markAllRead = useCallback(
    (newestTimestampMs?: number) => {
      const target = Math.max(Date.now(), newestTimestampMs ?? 0);
      setLastSeenAt((prev) => {
        const next = Math.max(prev, target);
        void AsyncStorage.setItem(storageKey, String(next)).catch(() => {});
        return next;
      });
    },
    [storageKey]
  );

  const markItemRead = useCallback((choreId: string) => {
    if (!choreId) return;
    setReadIds((prev) => (prev[choreId] ? prev : { ...prev, [choreId]: true }));
  }, []);

  const value = useMemo<NotificationContextValue>(
    () => ({
      lastSeenAt,
      readIds,
      hydrated,
      markAllRead,
      markItemRead,
    }),
    [hydrated, lastSeenAt, markAllRead, markItemRead, readIds]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotificationState(): NotificationContextValue {
  return useContext(NotificationContext);
}
