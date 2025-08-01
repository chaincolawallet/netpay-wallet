import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { UserProvider } from '../contexts/UserContext';
import AuthGuard from '../components/AuthGuard';

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <AuthGuard>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
            <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="auth/reset-password" options={{ headerShown: false }} />
            <Stack.Screen name="auth/email-verification" options={{ headerShown: false }} />
            <Stack.Screen name="auth/setup-biometrics" options={{ headerShown: false }} />
            <Stack.Screen name="auth/setup-pin" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="splash" options={{ headerShown: false }} />
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen name="add-money" options={{ headerShown: false }} />
            <Stack.Screen name="transfer" options={{ headerShown: false }} />
            <Stack.Screen name="airtime-purchase" options={{ headerShown: false }} />
            <Stack.Screen name="data-purchase" options={{ headerShown: false }} />
            <Stack.Screen name="cable-tv-purchase" options={{ headerShown: false }} />
            <Stack.Screen name="electricity-purchase" options={{ headerShown: false }} />
            <Stack.Screen name="education-purchase" options={{ headerShown: false }} />
            <Stack.Screen name="betting-purchase" options={{ headerShown: false }} />
            <Stack.Screen name="transaction-details" options={{ headerShown: false }} />
            <Stack.Screen name="transaction-success" options={{ headerShown: false }} />
            <Stack.Screen name="personal-information" options={{ headerShown: false }} />
            <Stack.Screen name="change-password" options={{ headerShown: false }} />
            <Stack.Screen name="change-pin" options={{ headerShown: false }} />
            <Stack.Screen name="security-settings" options={{ headerShown: false }} />
            <Stack.Screen name="notification-preferences" options={{ headerShown: false }} />
            <Stack.Screen name="help-support" options={{ headerShown: false }} />
            <Stack.Screen name="contact-us" options={{ headerShown: false }} />
            <Stack.Screen name="referral" options={{ headerShown: false }} />
            <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
            <Stack.Screen name="terms-conditions" options={{ headerShown: false }} />
            <Stack.Screen name="about-netpay" options={{ headerShown: false }} />
            <Stack.Screen name="bank-accounts" options={{ headerShown: false }} />
            <Stack.Screen name="earnings" options={{ headerShown: false }} />
          </Stack>
        </AuthGuard>
      </UserProvider>
    </AuthProvider>
  );
}
