import { supabase } from '../lib/supabase';
import { Household, Profile } from '../types';

export const householdService = {
  // Generate random 6-digit alphanumeric PIN
  generatePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  // Parent creates a new household Circle
  async createHousehold(name: string, parentUserId: string): Promise<Household> {
    const pin = this.generatePin();

    const { data: household, error: householdError } = await supabase
      .from('households')
      .insert({
        name,
        pairing_pin: pin,
      })
      .select()
      .single();

    if (householdError) throw householdError;

    // Link parent profile to newly created household
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ household_id: household.id })
      .eq('id', parentUserId);

    if (profileError) throw profileError;

    return household as Household;
  },

  // Child joins a household using the 6-digit pairing PIN
  async joinHouseholdWithPin(pin: string, childUserId: string): Promise<Household> {
    const { data: household, error: findError } = await supabase
      .from('households')
      .select('*')
      .eq('pairing_pin', pin.trim())
      .single();

    if (findError || !household) {
      throw new Error('Invalid or expired Family PIN.');
    }

    // Link child profile to the found household
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ household_id: household.id })
      .eq('id', childUserId);

    if (updateError) throw updateError;

    return household as Household;
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
