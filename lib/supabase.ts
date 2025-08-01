import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import type { Database } from './database';

// Supabase configuration - using centralized config
const SUPABASE_URL = config.supabase.url;
const SUPABASE_PUBLISHABLE_KEY = config.supabase.anonKey;

// Create Supabase client with correct database types
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Re-export the Database type
export type { Database } from './database';

// Auth helper functions
export const auth = {
  // Sign up with email
  signUp: async (email: string, password: string, fullName: string, phoneNumber: string, referralCode?: string) => {
    // First, check if phone number already exists
    const { data: existingProfiles, error: checkError } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .eq('phone_number', phoneNumber);

    if (checkError) {
      return { data: null, error: checkError };
    }

    if (existingProfiles && existingProfiles.length > 0) {
      return { 
        data: null, 
        error: { message: 'An account with this phone number already exists' }
      };
    }

    // Create the user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'netpay://email-verification',
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
        },
      },
    });

    if (authError) {
      return { data: null, error: authError };
    }

    if (authData.user) {
      // Create profile record
      const profileData = {
        user_id: authData.user.id,
        full_name: fullName,
        phone_number: phoneNumber,
        email_verified: false,
        referral_code: referralCode || null,
        referred_by: null, // Will be set if referral code is valid
      };

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Note: We don't return error here as the user account was created successfully
      }

      // Create default notification preferences
      const { error: prefError } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: authData.user.id,
          email_notifications: true,
          push_notifications: true,
          sms_notifications: true,
        });

      if (prefError) {
        console.error('Error creating notification preferences:', prefError);
      }

      // Create pin attempts record
      const { error: pinError } = await supabase
        .from('pin_attempts')
        .insert({
          user_id: authData.user.id,
          attempt_count: 0,
        });

      if (pinError) {
        console.error('Error creating pin attempts record:', pinError);
      }
    }

    return { data: authData, error: null };
  },

  // Sign in with email
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'netpay://reset-password',
    });
    return { data, error };
  },

  // Update password
  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    return { data, error };
  },
};

// Database helper functions using the actual schema
export const db = {
  // Get user profile
  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // Update user profile
  updateUserProfile: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);
    return { data, error };
  },

  // Create or update user profile
  upsertUserProfile: async (profileData: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select()
      .single();
    return { data, error };
  },

  // Get user role
  getUserRole: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // Set user role
  setUserRole: async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    const { data, error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: role,
      })
      .select()
      .single();
    return { data, error };
  },

  // Check if user has specific role
  hasUserRole: async (userId: string, role: 'admin' | 'moderator' | 'user') => {
    const { data, error } = await supabase
      .rpc('has_role', {
        _user_id: userId,
        _role: role,
      });
    return { data, error };
  },

  // Get user transactions
  getUserTransactions: async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  // Create transaction
  createTransaction: async (transaction: any) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
    return { data, error };
  },

  // Get user wallet transactions
  getUserWalletTransactions: async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  // Create wallet transaction
  createWalletTransaction: async (transaction: any) => {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert(transaction)
      .select()
      .single();
    return { data, error };
  },

  // Get user notifications
  getUserNotifications: async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  // Create notification
  createNotification: async (notification: any) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    return { data, error };
  },

  // Mark notification as read
  markNotificationAsRead: async (notificationId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
    return { data, error };
  },

  // Search users by email or phone
  searchUsers: async (searchTerm: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, full_name, phone_number, email_verified')
      .or(`full_name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`)
      .eq('email_verified', true);
    return { data, error };
  },

  // Get user by phone number
  getUserByPhone: async (phoneNumber: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, full_name, phone_number')
      .eq('phone_number', phoneNumber)
      .eq('email_verified', true)
      .single();
    return { data, error };
  },

  // Get user virtual account
  getUserVirtualAccount: async (userId: string) => {
    const { data, error } = await supabase
      .from('virtual_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    return { data, error };
  },

  // Create user transfer
  createUserTransfer: async (transfer: any) => {
    const { data, error } = await supabase
      .from('user_transfers')
      .insert(transfer)
      .select()
      .single();
    return { data, error };
  },

  // Get user transfer history
  getUserTransfers: async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('user_transfers')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  // Get notification preferences
  getNotificationPreferences: async (userId: string) => {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // Update notification preferences
  updateNotificationPreferences: async (userId: string, preferences: any) => {
    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
      })
      .select()
      .single();
    return { data, error };
  },

  // Get pin attempts
  getPinAttempts: async (userId: string) => {
    const { data, error } = await supabase
      .from('pin_attempts')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data, error };
  },

  // Update pin attempts
  updatePinAttempts: async (userId: string, attempts: any) => {
    const { data, error } = await supabase
      .from('pin_attempts')
      .upsert({
        user_id: userId,
        ...attempts,
      })
      .select()
      .single();
    return { data, error };
  },
};

// Real-time subscriptions
export const realtime = {
  // Subscribe to user transactions
  subscribeToTransactions: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to user wallet transactions
  subscribeToWalletTransactions: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('wallet_transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to user notifications
  subscribeToNotifications: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to user profile changes
  subscribeToUserProfile: (userId: string, callback: (payload: any) => void) => {
    return supabase
      .channel('user_profile')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  },
};

export default supabase; 