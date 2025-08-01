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

    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/airtime-purchase`, {
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

    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/airtime-purchase`, {
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

    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/transfer-to-user`, {
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
    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-push-notification`, {
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
    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-email-notification`, {
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

    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/update-notification-preferences`, {
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

    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/update-pin`, {
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
    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/verify-user-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.user;
  },
};

// Virtual Account Service
export const virtualAccountService = {
  async createVirtualAccount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/create-virtual-account`, {
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