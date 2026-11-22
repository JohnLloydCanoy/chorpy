import 'react-native-url-polyfill/auto';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim();
// Strip any accidental trailing slashes or /rest/v1 paths
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl.startsWith('https://') && supabaseAnonKey.length > 0
);

if (!isSupabaseConfigured && __DEV__) {
  console.warn(
    '[Chorpy Supabase] Missing or invalid EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Run Expo from inside mobile/ with `npx expo start --web -c`.'
  );
}

const webSafeStorage = {
  getItem: (key: string): string | null => {
    try {
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
    } catch {
      // Ignore storage quota or private-mode restrictions
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') window.localStorage.removeItem(key);
    } catch {
      // Ignore storage restrictions
    }
  },
};

const FETCH_TIMEOUT_MS = 12000;

const resilientFetch: typeof fetch = async (input, init) => {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new TypeError('Browser is offline; Supabase request skipped.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const callerSignal = init?.signal;

  const onCallerAbort = () => controller.abort();
  callerSignal?.addEventListener('abort', onCallerAbort, { once: true });

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (__DEV__) {
      const target = typeof input === 'string' ? input.split('?')[0] : 'request';
      console.warn(
        `[Chorpy Supabase] Network fetch failed for ${target}:`,
        err instanceof Error ? err.message : err
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
    callerSignal?.removeEventListener('abort', onCallerAbort);
  }
};

type GlobalWithSupabase = typeof globalThis & {
  __chorpySupabase?: SupabaseClient;
  __chorpyLifecycleBound?: boolean;
};

const globalScope = globalThis as GlobalWithSupabase;

function createChorpySupabaseClient(): SupabaseClient {
  const safeUrl = isSupabaseConfigured ? supabaseUrl : 'https://invalid.supabase.local';
  const safeKey = isSupabaseConfigured ? supabaseAnonKey : 'unconfigured-anon-key';

  return createClient(safeUrl, safeKey, {
    auth: {
      storage: Platform.OS === 'web' ? webSafeStorage : AsyncStorage,
      autoRefreshToken: isSupabaseConfigured,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      fetch: resilientFetch,
    },
  });
}

export const supabase: SupabaseClient =
  Platform.OS === 'web' && globalScope.__chorpySupabase
    ? globalScope.__chorpySupabase
    : createChorpySupabaseClient();

if (Platform.OS === 'web') {
  globalScope.__chorpySupabase = supabase;
}

if (isSupabaseConfigured && !globalScope.__chorpyLifecycleBound) {
  globalScope.__chorpyLifecycleBound = true;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      supabase.auth.stopAutoRefresh().catch(() => {});
    }
    window.addEventListener('offline', () => {
      supabase.auth.stopAutoRefresh().catch(() => {});
    });
    window.addEventListener('online', () => {
      supabase.auth.startAutoRefresh().catch(() => {});
    });
  } else if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh().catch(() => {});
      } else {
        supabase.auth.stopAutoRefresh().catch(() => {});
      }
    });
  }
}
