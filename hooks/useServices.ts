import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  airtimeService,
  transferService,
  notificationService,
  pinService,
  userService,
  virtualAccountService,
  transactionService,
  notificationManagement,
} from '../lib/services';

// Airtime Service Hooks
export const useAirtimeService = () => {
  const [loading, setLoading] = useState(false);

  const getNetworks = useCallback(async () => {
    setLoading(true);
    try {
      const networks = await airtimeService.getNetworks();
      return networks;
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to fetch networks');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const purchaseAirtime = useCallback(async (networkId: string, phoneNumber: string, amount: number) => {
    setLoading(true);
    try {
      const result = await airtimeService.purchaseAirtime(networkId, phoneNumber, amount);
      Alert.alert('Success', 'Airtime purchase completed successfully');
      return result;
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to purchase airtime');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getNetworks, purchaseAirtime, loading };
};

// Transfer Service Hooks
export const useTransferService = () => {
  const [loading, setLoading] = useState(false);

  const transferToUser = useCallback(async (recipientEmail: string, amount: number, note?: string) => {
    setLoading(true);
    try {
      const result = await transferService.transferToUser(recipientEmail, amount, note);
      Alert.alert('Success', 'Transfer completed successfully');
      return result;
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to complete transfer');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { transferToUser, loading };
};

// Notification Service Hooks
export const useNotificationService = () => {
  const [loading, setLoading] = useState(false);

  const sendPushNotification = useCallback(async (userId: string, title: string, message: string, type = 'info', data = {}) => {
    setLoading(true);
    try {
      const result = await notificationService.sendPushNotification(userId, title, message, type, data);
      return result;
    } catch (error) {
      console.error('Push notification error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendEmailNotification = useCallback(async (userId: string, title: string, message: string, type = 'info') => {
    setLoading(true);
    try {
      const result = await notificationService.sendEmailNotification(userId, title, message, type);
      return result;
    } catch (error) {
      console.error('Email notification error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNotificationPreferences = useCallback(async (preferences: any) => {
    setLoading(true);
    try {
      const result = await notificationService.updateNotificationPreferences(preferences);
      Alert.alert('Success', 'Notification preferences updated successfully');
      return result;
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update preferences');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getNotificationPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const result = await notificationService.getNotificationPreferences();
      return result;
    } catch (error) {
      console.error('Get preferences error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sendPushNotification,
    sendEmailNotification,
    updateNotificationPreferences,
    getNotificationPreferences,
    loading,
  };
};

// PIN Service Hooks
export const usePinService = () => {
  const [loading, setLoading] = useState(false);

  const updatePin = useCallback(async (currentPin: string | undefined, newPin: string, hasExistingPin: boolean) => {
    setLoading(true);
    try {
      const result = await pinService.updatePin(currentPin, newPin, hasExistingPin);
      Alert.alert('Success', 'PIN updated successfully');
      return result;
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update PIN');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyPin = useCallback(async (pin: string) => {
    setLoading(true);
    try {
      const result = await pinService.verifyPin(pin);
      return result;
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'PIN verification failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updatePin, verifyPin, loading };
};

// User Service Hooks
export const useUserService = () => {
  const [loading, setLoading] = useState(false);

  const verifyUserEmail = useCallback(async (email: string) => {
    setLoading(true);
    try {
      const result = await userService.verifyUserEmail(email);
      return result;
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to verify user');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { verifyUserEmail, loading };
};

// Virtual Account Service Hooks
export const useVirtualAccountService = () => {
  const [loading, setLoading] = useState(false);

  const createVirtualAccount = useCallback(async () => {
    setLoading(true);
    try {
      const result = await virtualAccountService.createVirtualAccount();
      Alert.alert('Success', 'Virtual account created successfully');
      return result;
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create virtual account');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getVirtualAccount = useCallback(async () => {
    setLoading(true);
    try {
      const result = await virtualAccountService.getVirtualAccount();
      return result;
    } catch (error) {
      console.error('Get virtual account error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createVirtualAccount, getVirtualAccount, loading };
};

// Transaction Service Hooks
export const useTransactionService = () => {
  const [loading, setLoading] = useState(false);

  const getTransactions = useCallback(async (limit = 10) => {
    setLoading(true);
    try {
      const result = await transactionService.getTransactions(limit);
      return result;
    } catch (error) {
      console.error('Get transactions error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWalletTransactions = useCallback(async (limit = 10) => {
    setLoading(true);
    try {
      const result = await transactionService.getWalletTransactions(limit);
      return result;
    } catch (error) {
      console.error('Get wallet transactions error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserTransfers = useCallback(async (limit = 10) => {
    setLoading(true);
    try {
      const result = await transactionService.getUserTransfers(limit);
      return result;
    } catch (error) {
      console.error('Get user transfers error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getTransactions, getWalletTransactions, getUserTransfers, loading };
};

// Notification Management Hooks
export const useNotificationManagement = () => {
  const [loading, setLoading] = useState(false);

  const getNotifications = useCallback(async (limit = 20) => {
    setLoading(true);
    try {
      const result = await notificationManagement.getNotifications(limit);
      return result;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    setLoading(true);
    try {
      const result = await notificationManagement.markNotificationAsRead(notificationId);
      return result;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    setLoading(true);
    try {
      const result = await notificationManagement.markAllNotificationsAsRead();
      Alert.alert('Success', 'All notifications marked as read');
      return result;
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to mark notifications as read');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAllNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await notificationManagement.deleteAllNotifications();
      Alert.alert('Success', 'All notifications deleted');
      return result;
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete notifications');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteAllNotifications,
    loading,
  };
}; 