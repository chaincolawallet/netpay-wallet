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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the SME Plug API key from environment
      const smePlugApiKey = config.smePlug.apiKey;
      if (!smePlugApiKey) {
        throw new Error('SME Plug API key not configured');
      }

      const response = await fetch('https://smeplug.ng/api/v1/networks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${smePlugApiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`SME Plug API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.status) {
        throw new Error('Failed to retrieve networks from SME Plug');
      }

      // Transform the networks object to a more usable format
      const networks = Object.entries(result.networks).map(([id, name]) => ({
        id,
        name,
        code: name.toLowerCase().replace(/\s+/g, ''),
      }));

      return networks;
    } catch (error) {
      console.error('Error fetching networks:', error);
      throw error;
    }
  },

  async purchaseAirtime(networkId: string, phoneNumber: string, amount: number) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the SME Plug API key from environment
      const smePlugApiKey = config.smePlug.apiKey;
      if (!smePlugApiKey) {
        throw new Error('SME Plug API key not configured');
      }

      // Validate inputs
      if (!networkId || !phoneNumber || !amount) {
        throw new Error('Missing required parameters');
      }

      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Format phone number (remove spaces, dashes, etc.)
      const formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

      // Validate phone number format
      if (!/^(\+234|234|0)?[789][01]\d{8}$/.test(formattedPhone)) {
        throw new Error('Invalid phone number format');
      }

      // Ensure phone number starts with 0 (Nigerian format)
      const normalizedPhone = formattedPhone.startsWith('234') 
        ? '0' + formattedPhone.slice(3)
        : formattedPhone.startsWith('+234')
          ? '0' + formattedPhone.slice(4)
          : formattedPhone.startsWith('0')
            ? formattedPhone
            : '0' + formattedPhone;

      // Generate unique customer reference
      const customerReference = `NP_${Date.now()}_${user.id}`;

      const response = await fetch('https://smeplug.ng/api/v1/airtime/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${smePlugApiKey}`,
        },
        body: JSON.stringify({
          network_id: parseInt(networkId),
          phone: normalizedPhone,
          amount: amount,
          customer_reference: customerReference,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`SME Plug API error: ${response.status} ${response.statusText} - ${errorData.message || ''}`);
      }

      const result = await response.json();
      
      if (!result.status) {
        throw new Error(result.message || 'Airtime purchase failed');
      }

      // Log the transaction in our database
      await this.logAirtimeTransaction(user.id, {
        networkId,
        phoneNumber: normalizedPhone,
        amount,
        reference: customerReference,
        status: result.status ? 'success' : 'failed',
        smePlugResponse: result,
      });

      return {
        success: true,
        reference: customerReference,
        message: result.message || 'Airtime purchase successful',
        data: result,
      };
    } catch (error) {
      console.error('Error purchasing airtime:', error);
      throw error;
    }
  },

  async logAirtimeTransaction(userId: string, transactionData: any) {
    try {
      const { error } = await supabase
        .from('airtime_transactions')
        .insert({
          user_id: userId,
          network_id: transactionData.networkId,
          phone_number: transactionData.phoneNumber,
          amount: transactionData.amount,
          reference: transactionData.reference,
          status: transactionData.status,
          sme_plug_response: transactionData.smePlugResponse,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error logging airtime transaction:', error);
      }
    } catch (error) {
      console.error('Error logging airtime transaction:', error);
    }
  },

  async getAirtimeHistory(limit = 10) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('airtime_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching airtime history:', error);
      throw error;
    }
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

// Data Purchase Service
export const dataPurchaseService = {
  async getDataPlans() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the SME Plug API key from environment
      const smePlugApiKey = config.smePlug.apiKey;
      if (!smePlugApiKey) {
        throw new Error('SME Plug API key not configured');
      }

      const response = await fetch('https://smeplug.ng/api/v1/data/plans', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${smePlugApiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`SME Plug API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.status) {
        throw new Error('Failed to retrieve data plans from SME Plug');
      }

      return result.plans || [];
    } catch (error) {
      console.error('Error fetching data plans:', error);
      throw error;
    }
  },

  async purchaseData(networkId: string, phoneNumber: string, planId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the SME Plug API key from environment
      const smePlugApiKey = config.smePlug.apiKey;
      if (!smePlugApiKey) {
        throw new Error('SME Plug API key not configured');
      }

      // Validate inputs
      if (!networkId || !phoneNumber || !planId) {
        throw new Error('Missing required parameters');
      }

      // Format phone number (remove spaces, dashes, etc.)
      const formattedPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');

      // Validate phone number format
      if (!/^(\+234|234|0)?[789][01]\d{8}$/.test(formattedPhone)) {
        throw new Error('Invalid phone number format');
      }

      // Ensure phone number starts with 0 (Nigerian format)
      const normalizedPhone = formattedPhone.startsWith('234') 
        ? '0' + formattedPhone.slice(3)
        : formattedPhone.startsWith('+234')
          ? '0' + formattedPhone.slice(4)
          : formattedPhone.startsWith('0')
            ? formattedPhone
            : '0' + formattedPhone;

      // Generate unique customer reference
      const customerReference = `NP_DATA_${Date.now()}_${user.id}`;

      const response = await fetch('https://smeplug.ng/api/v1/data/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${smePlugApiKey}`,
        },
        body: JSON.stringify({
          network_id: parseInt(networkId),
          plan_id: parseInt(planId),
          phone: normalizedPhone,
          customer_reference: customerReference,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`SME Plug API error: ${response.status} ${response.statusText} - ${errorData.message || ''}`);
      }

      const result = await response.json();
      
      if (!result.status) {
        throw new Error(result.message || 'Data purchase failed');
      }

      // Log the transaction in our database
      await this.logDataTransaction(user.id, {
        networkId,
        phoneNumber: normalizedPhone,
        planId,
        reference: customerReference,
        status: result.status ? 'success' : 'failed',
        dataStatus: result.data?.current_status || 'unknown',
        smePlugResponse: result,
      });

      return {
        success: true,
        reference: customerReference,
        message: result.message || 'Data purchase successful',
        dataStatus: result.data?.current_status || 'unknown',
        data: result,
      };
    } catch (error) {
      console.error('Error purchasing data:', error);
      throw error;
    }
  },

  async logDataTransaction(userId: string, transactionData: any) {
    try {
      const { error } = await supabase
        .from('data_transactions')
        .insert({
          user_id: userId,
          network_id: transactionData.networkId,
          phone_number: transactionData.phoneNumber,
          plan_id: transactionData.planId,
          reference: transactionData.reference,
          status: transactionData.status,
          sme_plug_response: transactionData.smePlugResponse,
          created_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error logging data transaction:', error);
      }
    } catch (error) {
      console.error('Error logging data transaction:', error);
    }
  },

  async getDataHistory(limit = 10) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('data_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching data history:', error);
      throw error;
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