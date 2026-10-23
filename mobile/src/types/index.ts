export type UserRole = 'parent' | 'child';

export type LockStatus = 'locked' | 'unlocked';

export type ChoreStatus = 'pending' | 'awaiting_approval' | 'approved' | 'rejected';

export interface Profile {
  id: string;
  household_id: string | null;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  date_of_birth: string | null;
  age: number | null;
  role: UserRole;
  created_at: string;
}

export interface Household {
  id: string;
  name: string;
  pairing_pin: string;
  created_at: string;
}

export interface Device {
  id: string;
  child_id: string;
  device_name: string;
  lock_status: LockStatus;
  last_seen: string;
}

export interface Chore {
  id: string;
  household_id: string;
  assigned_child_id: string;
  title: string;
  description: string | null;
  status: ChoreStatus;
  proof_image_url: string | null;
  created_at: string;
  updated_at: string;
}
