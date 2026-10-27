import { supabase } from '../lib/supabase';
import { Chore, ChoreStatus } from '../types';

export interface CreateChoreParams {
  householdId: string;
  assignedChildId: string;
  title: string;
  description?: string;
}

export const choreService = {
  // Fetch all chores for a household
  async getHouseholdChores(householdId: string): Promise<Chore[]> {
    const { data, error } = await supabase
      .from('chores')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Chore[];
  },

  // Create and assign a new chore (initial status: 'pending')
  async createChore(params: CreateChoreParams): Promise<Chore> {
    const { data, error } = await supabase
      .from('chores')
      .insert({
        household_id: params.householdId,
        assigned_child_id: params.assignedChildId,
        title: params.title,
        description: params.description || null,
        status: 'pending' as ChoreStatus,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Chore;
  },

  // Upload proof photo and update status to 'awaiting_approval'
  async submitChoreProof(choreId: string, proofImageUrl: string): Promise<Chore> {
    const { data, error } = await supabase
      .from('chores')
      .update({
        proof_image_url: proofImageUrl,
        status: 'awaiting_approval' as ChoreStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', choreId)
      .select()
      .single();

    if (error) throw error;
    return data as Chore;
  },

  // Parent approves chore & sets status to 'approved'
  async approveChore(choreId: string, childDeviceId?: string): Promise<void> {
    const { error: choreError } = await supabase
      .from('chores')
      .update({
        status: 'approved' as ChoreStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', choreId);

    if (choreError) throw choreError;

    // If device ID provided, unlock device concurrently
    if (childDeviceId) {
      const { error: deviceError } = await supabase
        .from('devices')
        .update({ lock_status: 'unlocked' })
        .eq('id', childDeviceId);

      if (deviceError) throw deviceError;
    }
  },

  // Parent rejects chore & reverts status to 'pending'
  async rejectChore(choreId: string): Promise<void> {
    const { error } = await supabase
      .from('chores')
      .update({
        status: 'pending' as ChoreStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', choreId);

    if (error) throw error;
  },
};
