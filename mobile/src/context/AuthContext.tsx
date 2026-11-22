import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Profile } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authError: string | null;
  signOut: () => Promise<void>;
  clearLocalSession: () => Promise<void>;
  clearAuthError: () => void;
  retrySession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const MISSING_CONFIG_MESSAGE =
  'Supabase environment variables are missing. Start Expo from inside mobile/ with `npx expo start --web -c`.';

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  authError: null,
  signOut: async () => {},
  clearLocalSession: async () => {},
  clearAuthError: () => {},
  retrySession: async () => {},
  refreshProfile: async () => {},
});

function formatAuthFetchError(error: unknown): string {
  const errName = error instanceof Error ? error.name : '';
  const errMsg = error instanceof Error ? error.message : String(error ?? '');
  const lower = errMsg.toLowerCase();
  if (
    errName === 'AuthRetryableFetchError' ||
    lower.includes('failed to fetch') ||
    lower.includes('offline') ||
    lower.includes('abort')
  ) {
    return 'Unable to reach Chorpy Auth servers. Check your internet connection or browser blockers, then retry or reset your local session.';
  }
  return errMsg || 'Unable to verify your session right now. Please try again.';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured);
  const [authError, setAuthError] = useState<string | null>(
    isSupabaseConfigured ? null : MISSING_CONFIG_MESSAGE
  );

  const inFlightProfileUserIdRef = useRef<string | null>(null);
  const lastLoadedProfileUserIdRef = useRef<string | null>(null);

  const resetLocalState = useCallback(() => {
    setSession(null);
    setUser(null);
    setProfile(null);
    setAuthError(null);
    lastLoadedProfileUserIdRef.current = null;
  }, []);

  const loadProfile = useCallback(async (userId?: string, force = false) => {
    const targetId = userId ?? null;
    if (
      !force &&
      targetId &&
      (inFlightProfileUserIdRef.current === targetId ||
        lastLoadedProfileUserIdRef.current === targetId)
    ) {
      return;
    }
    inFlightProfileUserIdRef.current = targetId;
    try {
      const data = await authService.getCurrentProfile();
      setProfile(data);
      lastLoadedProfileUserIdRef.current = data?.id ?? targetId;
    } catch {
      setProfile(null);
      lastLoadedProfileUserIdRef.current = null;
    } finally {
      if (inFlightProfileUserIdRef.current === targetId) {
        inFlightProfileUserIdRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 6000);

    // 1. Hydrate initial session and surface fetch/config errors explicitly
    supabase.auth
      .getSession()
      .then(({ data: { session: nextSession }, error }) => {
        if (!isMounted) return;
        setAuthError(error ? formatAuthFetchError(error) : null);
        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        if (nextSession?.user) {
          loadProfile(nextSession.user.id).finally(() => {
            if (isMounted) {
              clearTimeout(timeoutId);
              setLoading(false);
            }
          });
        } else {
          setProfile(null);
          lastLoadedProfileUserIdRef.current = null;
          clearTimeout(timeoutId);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setAuthError(formatAuthFetchError(err));
        clearTimeout(timeoutId);
        setLoading(false);
      });

    // 2. Listen for auth changes (deduplicated against initial getSession via refs)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') setAuthError(null);

      if (nextSession?.user) {
        loadProfile(nextSession.user.id, event === 'USER_UPDATED').finally(() => {
          if (isMounted) setLoading(false);
        });
      } else {
        setProfile(null);
        lastLoadedProfileUserIdRef.current = null;
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
    } catch {
      await authService.clearLocalSession();
    } finally {
      resetLocalState();
    }
  }, [resetLocalState]);

  const clearLocalSession = useCallback(async () => {
    await authService.clearLocalSession();
    resetLocalState();
  }, [resetLocalState]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const retrySession = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setAuthError(MISSING_CONFIG_MESSAGE);
      setLoading(false);
      return;
    }
    setLoading(true);
    setAuthError(null);
    try {
      const { data: { session: nextSession }, error } = await supabase.auth.getSession();
      if (error) setAuthError(formatAuthFetchError(error));
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        await loadProfile(nextSession.user.id, true);
      } else {
        setProfile(null);
        lastLoadedProfileUserIdRef.current = null;
      }
    } catch (err) {
      setAuthError(formatAuthFetchError(err));
    } finally {
      setLoading(false);
    }
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    await loadProfile(user?.id, true);
  }, [loadProfile, user?.id]);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      session, user, profile, loading, authError,
      signOut, clearLocalSession, clearAuthError, retrySession, refreshProfile,
    }),
    [session, user, profile, loading, authError, signOut, clearLocalSession, clearAuthError, retrySession, refreshProfile]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
