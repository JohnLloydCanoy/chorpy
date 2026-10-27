import { supabase } from '../lib/supabase';
import { Profile, UserRole } from '../types';

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  age?: number;
  role: UserRole;
}

export const authService = {
  // Sign up new user with metadata matching profiles table
  async signUp({ email, password, fullName, phoneNumber, dateOfBirth, age, role }: SignUpParams) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          date_of_birth: dateOfBirth,
          age,
          role,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign in existing user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Sign out current user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Fetch current user's profile from public.profiles
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data as Profile;
  },
};
