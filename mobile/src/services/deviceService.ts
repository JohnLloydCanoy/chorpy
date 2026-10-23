import { supabase } from '../lib/supabase';
import { Device, LockStatus } from '../types';

export const deviceService = {
  // Register a child device to the devices table
  async registerDevice(childId: string, deviceName: string): Promise<Device> {
    const { data, error } = await supabase
      .from('devices')
      .insert({
        child_id: childId,
        device_name: deviceName,
        lock_status: 'unlocked',
        last_seen: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as Device;
  },

  // Update lock status (locked | unlocked)
  async updateLockStatus(deviceId: string, lockStatus: LockStatus): Promise<Device> {
    const { data, error } = await supabase
      .from('devices')
      .update({
        lock_status: lockStatus,
        last_seen: new Date().toISOString(),
      })
      .eq('id', deviceId)
      .select()
      .single();

    if (error) throw error;
    return data as Device;
  },

  // Fetch device details by child ID
  async getDeviceByChildId(childId: string): Promise<Device | null> {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('child_id', childId)
      .maybeSingle();

    if (error) throw error;
    return data as Device | null;
  },
};
