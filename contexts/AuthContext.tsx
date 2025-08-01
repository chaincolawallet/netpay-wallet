import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { biometricService } from '../lib/services';
import { auth, supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  signUp: (email: string, password: string, fullName: string, phoneNumber: string, referralCode?: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signInWithBiometrics: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  updatePassword: (password: string) => Promise<{ data: any; error: any }>;
  enableBiometrics: () => Promise<{ success: boolean; error?: string }>;
  disableBiometrics: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    // Check biometric availability
    const checkBiometrics = async () => {
      const available = await biometricService.isBiometricAvailable();
      setBiometricAvailable(available);
    };

    checkBiometrics();
  }, []);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { session, error } = await auth.getCurrentSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          
          // Check if user has biometric enabled
          if (session?.user) {
            const { success, enabled } = await biometricService.getBiometricCredentials(session.user.id);
            setBiometricEnabled(success && enabled);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check biometric credentials when user changes
        if (session?.user) {
          const { success, enabled } = await biometricService.getBiometricCredentials(session.user.id);
          setBiometricEnabled(success && enabled);
        } else {
          setBiometricEnabled(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phoneNumber: string, referralCode?: string) => {
    return await auth.signUp(email, password, fullName, phoneNumber, referralCode);
  };

  const signIn = async (email: string, password: string) => {
    return await auth.signIn(email, password);
  };

  const signInWithBiometrics = async () => {
    try {
      const { success, error } = await biometricService.authenticateWithBiometrics();
      
      if (success) {
        // Check if user has biometric enabled
        if (user) {
          const { success: credSuccess, enabled } = await biometricService.getBiometricCredentials(user.id);
          if (credSuccess && enabled) {
            // User has biometric enabled, authentication successful
            return { success: true };
          }
        }
        return { success: false, error: 'Biometric login not enabled for this user' };
      }
      
      return { success: false, error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Biometric authentication failed' };
    }
  };

  const signOut = async () => {
    return await auth.signOut();
  };

  const resetPassword = async (email: string) => {
    return await auth.resetPassword(email);
  };

  const updatePassword = async (password: string) => {
    return await auth.updatePassword(password);
  };

  const enableBiometrics = async () => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { success, error } = await biometricService.authenticateWithBiometrics();
      if (!success) {
        return { success: false, error };
      }

      // Store biometric preference (not actual credentials for security)
      const saveResult = await biometricService.saveBiometricCredentials(user.id, { enabled: true });
      if (saveResult.success) {
        setBiometricEnabled(true);
        return { success: true };
      }
      
      return saveResult;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to enable biometrics' };
    }
  };

  const disableBiometrics = async () => {
    try {
      if (!user) throw new Error('User not authenticated');
      
      const result = await biometricService.removeBiometricCredentials(user.id);
      if (result.success) {
        setBiometricEnabled(false);
      }
      return result;
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to disable biometrics' };
    }
  };

  const value = {
    user,
    session,
    loading,
    biometricAvailable,
    biometricEnabled,
    signUp,
    signIn,
    signInWithBiometrics,
    signOut,
    resetPassword,
    updatePassword,
    enableBiometrics,
    disableBiometrics,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 