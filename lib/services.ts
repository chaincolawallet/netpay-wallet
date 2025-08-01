import * as LocalAuthentication from 'expo-local-authentication';
import { config } from './config';
import { supabase } from './supabase';

// Types for API requests and responses
export interface AirtimePurchaseRequest {
  action: 'get_networks' | 'purchase_airtime';
  network_id?: string;
  phone_number?: string;
  amount?: number;
}

export interface TransferRequest {
  recipientEmail: string;
  amount: number;
  note?: string;
}

export interface NotificationPreferences {
  push_notifications?: boolean;
  email_notifications?: boolean;
  sms_notifications?: boolean;
}

export interface UpdatePinRequest {
  currentPin?: string;
  newPin: string;
  hasExistingPin: boolean;
}

export interface VerifyEmailRequest {
  email: string;
}

// Airtime Purchase Service
export const airtimeService = {
  async getNetworks() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const response = await fetch(`${config.supabase.url}/functions/v1/airtime-purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({ action: 'get_networks' }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.networks;
  },

  async purchaseAirtime(networkId: string, phoneNumber: string, amount: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const response = await fetch(`${config.supabase.url}/functions/v1/airtime-purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({
        action: 'purchase_airtime',
        network_id: networkId,
        phone_number: phoneNumber,
        amount: amount,
      }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },
};

// Transfer Service
export const transferService = {
  async transferToUser(recipientEmail: string, amount: number, note?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const response = await fetch(`${config.supabase.url}/functions/v1/transfer-to-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({
        recipientEmail,
        amount,
        note,
      }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.transfer;
  },
};

// Notification Services
export const notificationService = {
  async sendPushNotification(userId: string, title: string, message: string, type = 'info', data = {}) {
    const response = await fetch(`${config.supabase.url}/functions/v1/send-push-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({
        userId,
        title,
        message,
        type,
        data,
      }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result;
  },

  async sendEmailNotification(userId: string, title: string, message: string, type = 'info') {
    const response = await fetch(`${config.supabase.url}/functions/v1/send-email-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({
        userId,
        title,
        message,
        type,
      }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result;
  },

  async updateNotificationPreferences(preferences: NotificationPreferences) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const response = await fetch(`${config.supabase.url}/functions/v1/update-notification-preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify(preferences),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.preferences;
  },

  async getNotificationPreferences() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};

// PIN Management Service
export const pinService = {
  async updatePin(currentPin: string | undefined, newPin: string, hasExistingPin: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const response = await fetch(`${config.supabase.url}/functions/v1/update-pin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({
        currentPin,
        newPin,
        hasExistingPin,
      }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result;
  },

  async verifyPin(pin: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('pin_hash')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !profile?.pin_hash) {
      throw new Error('PIN not set');
    }

    // For mobile, we'll use a simple comparison since bcrypt is not available
    // In production, you should implement proper PIN verification
    return profile.pin_hash === pin;
  },
};

// User Verification Service
export const userService = {
  async verifyUserEmail(email: string) {
    try {
      // Use the new RPC function for user verification
      const { data: userData, error: rpcError } = await supabase.rpc('verify_user_for_transfer', {
        user_email: email.toLowerCase()
      });

      if (rpcError) {
        console.error('RPC error:', rpcError);
        throw new Error('Failed to verify user');
      }

      if (!userData) {
        throw new Error('User not found or not verified');
      }

      return {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name || 'User',
        phone_number: userData.phone_number,
        created_at: userData.created_at,
        email_confirmed_at: userData.email_confirmed_at,
        verified: userData.verified,
      };
    } catch (error) {
      console.error('User verification error:', error);
      throw error;
    }
  },
};

// Virtual Account Service
export const virtualAccountService = {
  async createVirtualAccount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const response = await fetch(`${config.supabase.url}/functions/v1/create-virtual-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },

  async getVirtualAccount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('virtual_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};

// Transaction Service
export const transactionService = {
  async getTransactions(limit = 10) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getWalletTransactions(limit = 10) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getUserTransfers(limit = 10) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('user_transfers')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },
};

// Notification Management
export const notificationManagement = {
  async getNotifications(limit = 20) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async markNotificationAsRead(notificationId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  },

  async markAllNotificationsAsRead() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw error;
    return true;
  },

  async deleteAllNotifications() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  },
};

// Face ID Authentication Service
export const biometricService = {
  async isBiometricAvailable() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  },

  async authenticateWithBiometrics() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with Face ID',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });
      
      return {
        success: result.success,
        error: result.error,
      };
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Biometric authentication failed',
      };
    }
  },

  async saveBiometricCredentials(userId: string, credentials: any) {
    try {
      // Try to save biometric preference
      const { error } = await supabase
        .from('biometric_credentials')
        .upsert({
          user_id: userId,
          enabled: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving biometric credentials:', error);
        
        // If table doesn't exist, provide helpful error message
        if (error.code === '42P01') {
          return {
            success: false,
            error: 'Biometric table not found. Please run the database migration first.',
          };
        }
        
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to save biometric credentials:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save biometric credentials',
      };
    }
  },

  async getBiometricCredentials(userId: string) {
    try {
      const { data, error } = await supabase
        .from('biometric_credentials')
        .select('enabled, created_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error getting biometric credentials:', error);
        throw error;
      }
      
      return { 
        success: true, 
        enabled: data?.enabled || false,
        created_at: data?.created_at 
      };
    } catch (error) {
      console.error('Failed to get biometric credentials:', error);
      return {
        success: false,
        enabled: false,
        error: error instanceof Error ? error.message : 'Failed to get biometric credentials',
      };
    }
  },

  async removeBiometricCredentials(userId: string) {
    try {
      const { error } = await supabase
        .from('biometric_credentials')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error removing biometric credentials:', error);
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to remove biometric credentials:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove biometric credentials',
      };
    }
  },
}; 

// Account Deletion Service
export const accountDeletionService = {
  async deleteAccount(userId: string, password: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, verify the user's password
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password,
      });

      if (reauthError) {
        return {
          success: false,
          error: 'Invalid password. Please try again.',
        };
      }

      // Delete all user data in the correct order
      const deletionSteps = [
        // 1. Delete biometric credentials
        async () => {
          const { error } = await supabase
            .from('biometric_credentials')
            .delete()
            .eq('user_id', userId);
          return { step: 'biometric_credentials', error };
        },
        
        // 2. Delete notifications
        async () => {
          const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', userId);
          return { step: 'notifications', error };
        },
        
        // 3. Delete notification preferences
        async () => {
          const { error } = await supabase
            .from('notification_preferences')
            .delete()
            .eq('user_id', userId);
          return { step: 'notification_preferences', error };
        },
        
        // 4. Delete transactions
        async () => {
          const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('user_id', userId);
          return { step: 'transactions', error };
        },
        
        // 5. Delete transfers
        async () => {
          const { error } = await supabase
            .from('transfers')
            .delete()
            .eq('user_id', userId);
          return { step: 'transfers', error };
        },
        
        // 6. Delete wallet
        async () => {
          const { error } = await supabase
            .from('wallets')
            .delete()
            .eq('user_id', userId);
          return { step: 'wallets', error };
        },
        
        // 7. Delete virtual accounts
        async () => {
          const { error } = await supabase
            .from('virtual_accounts')
            .delete()
            .eq('user_id', userId);
          return { step: 'virtual_accounts', error };
        },
        
        // 8. Delete user profile
        async () => {
          const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);
          return { step: 'profiles', error };
        },
      ];

      // Execute deletion steps
      const results = [];
      for (const step of deletionSteps) {
        const result = await step();
        results.push(result);
        
        // Log any errors but continue with deletion
        if (result.error) {
          console.warn(`Warning: Error deleting ${result.step}:`, result.error);
        }
      }

      // Finally, delete the user account from Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.error('Error deleting user from auth:', authError);
        return {
          success: false,
          error: 'Failed to delete account. Please contact support.',
        };
      }

      return {
        success: true,
        message: 'Account successfully deleted',
        deletionResults: results,
      };
    } catch (error) {
      console.error('Account deletion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete account',
      };
    }
  },

  async requestAccountDeletion(userId: string, reason?: string) {
    try {
      const { error } = await supabase
        .from('deletion_requests')
        .insert({
          user_id: userId,
          reason: reason || 'User requested account deletion',
          status: 'pending',
          requested_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error requesting account deletion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to request account deletion',
      };
    }
  },

  async cancelAccountDeletion(userId: string) {
    try {
      const { error } = await supabase
        .from('deletion_requests')
        .delete()
        .eq('user_id', userId)
        .eq('status', 'pending');

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error canceling account deletion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel account deletion',
      };
    }
  },
}; 