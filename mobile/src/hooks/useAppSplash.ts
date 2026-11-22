import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export type DbConnectionStatus = 'checking' | 'connected' | 'error';

export interface AppSplashState {
  dbStatus: DbConnectionStatus;
  statusMessage: string;
  isStartupLoading: boolean;
  retryConnection: () => Promise<void>;
  // TODO(remove-after-testing): Temporary Demo Splash preview controls
  demoSplashVisible: boolean;
  demoStatusText: string | undefined;
  triggerDemoSplash: () => Promise<void>;
  dismissDemoSplash: () => void;
}

interface ProbeResult {
  status: 'connected' | 'error';
  message: string;
  elapsedMs: number;
}

async function probeSupabaseConnection(): Promise<ProbeResult> {
  const startedAt = Date.now();
  try {
    const { error } = await supabase
      .from('households')
      .select('count', { count: 'exact', head: true });
    const elapsedMs = Date.now() - startedAt;

    if (error) {
      return { status: 'error', message: `Supabase: ${error.message}`, elapsedMs };
    }
    return { status: 'connected', message: 'Backend Connected Successfully', elapsedMs };
  } catch (err: unknown) {
    const elapsedMs = Date.now() - startedAt;
    const message = err instanceof Error ? err.message : 'Connection failed';
    return { status: 'error', message, elapsedMs };
  }
}

/**
 * Coordinates startup Supabase connectivity verification with auth loading state
 * so the animated splash screen remains visible until backend data resolves.
 */
export function useAppSplash(authLoading: boolean): AppSplashState {
  const [dbStatus, setDbStatus] = useState<DbConnectionStatus>('checking');
  const [statusMessage, setStatusMessage] = useState('Connecting to Supabase...');

  // TODO(remove-after-testing): Temporary Demo Splash state
  const [demoSplashVisible, setDemoSplashVisible] = useState(false);
  const [demoStatusText, setDemoStatusText] = useState<string | undefined>(undefined);

  const isMountedRef = useRef(true);
  const demoRequestIdRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    probeSupabaseConnection().then((result) => {
      if (!isMountedRef.current) return;
      setDbStatus(result.status);
      setStatusMessage(result.message);
    });
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const retryConnection = useCallback(async () => {
    if (!isMountedRef.current) return;
    setDbStatus('checking');
    setStatusMessage('Connecting to Supabase...');
    const result = await probeSupabaseConnection();
    if (!isMountedRef.current) return;
    setDbStatus(result.status);
    setStatusMessage(result.message);
  }, []);

  // TODO(remove-after-testing): Trigger live Supabase ping during Demo Splash preview
  const triggerDemoSplash = useCallback(async () => {
    const requestId = ++demoRequestIdRef.current;
    setDemoSplashVisible(true);
    setDemoStatusText('Testing live Supabase connection...');

    const result = await probeSupabaseConnection();
    if (!isMountedRef.current || demoRequestIdRef.current !== requestId) return;

    if (result.status === 'error') {
      setDemoStatusText(`Supabase check finished in ${result.elapsedMs}ms (${result.message})`);
    } else {
      setDemoStatusText(`Supabase responded in ${result.elapsedMs}ms`);
    }
  }, []);

  // TODO(remove-after-testing): Dismiss Demo Splash preview
  const dismissDemoSplash = useCallback(() => {
    demoRequestIdRef.current += 1;
    setDemoSplashVisible(false);
    setDemoStatusText(undefined);
  }, []);

  return {
    dbStatus,
    statusMessage,
    isStartupLoading: authLoading || dbStatus === 'checking',
    retryConnection,
    demoSplashVisible,
    demoStatusText,
    triggerDemoSplash,
    dismissDemoSplash,
  };
}
