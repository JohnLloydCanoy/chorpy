import { supabase } from '../lib/supabase';
import { Household, Profile } from '../types';

export interface CreateHouseholdMetadata {
  numChildren?: number;
  numCoParents?: number;
}

const PIN_PATTERN = /^\d{6}$/;

export const householdService = {
  // Verify whether a 6-digit PIN is active (not expired) prior to account signup
  async verifyPin(pin: string): Promise<boolean> {
    const trimmed = pin.trim();
    if (!PIN_PATTERN.test(trimmed)) {
      throw new Error('Invalid or expired Family PIN.');
    }

    const { data, error } = await supabase.rpc('verify_household_pin', {
      p_pin: trimmed,
    });

    if (error || !data) {
      throw new Error('Invalid or expired Family PIN.');
    }

    return true;
  },

  // Parent creates a new household Circle with a 30-minute TTL PIN via server RPC
  async createHousehold(
    name: string,
    _parentUserId: string,
    _metadata?: CreateHouseholdMetadata
  ): Promise<Household> {
    const { data, error } = await supabase.rpc('create_household_with_pin', {
      p_name: name.trim(),
    });

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create family circle.');
    }

    return data as Household;
  },

  // Member joins an active household using a non-expired 6-digit pairing PIN
  async joinHouseholdWithPin(pin: string, _childUserId: string): Promise<Household> {
    const trimmed = pin.trim();
    if (!PIN_PATTERN.test(trimmed)) {
      throw new Error('Invalid or expired Family PIN.');
    }

    const { data, error } = await supabase.rpc('join_household_with_pin', {
      p_pin: trimmed,
    });

    if (error || !data) {
      throw new Error(error?.message || 'Invalid or expired Family PIN.');
    }

    return data as Household;
  },

  // Fetch the authenticated member's linked household + server clock timestamp
  async getMyHousehold(): Promise<Household | null> {
    const { data, error } = await supabase.rpc('get_my_household');
    if (error) throw error;
    return (data as Household | null) ?? null;
  },

  // Parent regenerates the household pairing PIN with a fresh 30-minute TTL
  async regeneratePin(): Promise<Household> {
    const { data, error } = await supabase.rpc('regenerate_household_pin');
    if (error || !data) {
      throw new Error(error?.message || 'Failed to regenerate Family PIN.');
    }
    return data as Household;
  },

  // List all members of a household
  async getHouseholdMembers(householdId: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('household_id', householdId);

    if (error) throw error;
    return data as Profile[];
  },
};
