import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { deviceService } from '../services/deviceService';
import { LockStatus } from '../types';

export function useDeviceLock(childId?: string | null) {
  const [lockStatus, setLockStatus] = useState<LockStatus>('unlocked');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childId) {
      setLoading(false);
      return;
    }

    // Fetch initial device record
    deviceService
      .getDeviceByChildId(childId)
      .then((device) => {
        if (device) {
          setDeviceId(device.id);
          setLockStatus(device.lock_status);
        }
      })
      .finally(() => setLoading(false));

    // Subscribe to real-time changes on the devices table for this child
    const channel = supabase
      .channel(`public:devices:child:${childId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'devices', filter: `child_id=eq.${childId}` },
        (payload) => {
          if (payload.new && 'lock_status' in payload.new) {
            setLockStatus(payload.new.lock_status as LockStatus);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [childId]);

  return {
    isLocked: lockStatus === 'locked',
    lockStatus,
    deviceId,
    loading,
  };
}
