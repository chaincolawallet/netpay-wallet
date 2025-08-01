import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return; // Don't redirect while loading

    const inAuthGroup = segments[0] === 'auth' || segments[0] === 'login' || segments[0] === 'signup' || segments[0] === 'forgot-password' || segments[0] === 'reset-password' || segments[0] === 'email-verification' || segments[0] === 'setup-pin';
    const inAdminGroup = segments[0] === 'admin';
    const isSplash = segments[0] === 'splash';
    const isOnboarding = segments[0] === 'onboarding';

    // Allow access to splash and onboarding without authentication
    if (isSplash || isOnboarding) {
      return;
    }

    // If user is not authenticated and trying to access protected routes, redirect to login
    if (!user && !inAuthGroup && segments[0] !== 'splash' && segments[0] !== 'onboarding') {
      router.replace('/auth/login');
      return;
    }

    // If user is authenticated and in auth group, redirect to main app
    if (user && inAuthGroup) {
      router.replace('/');
      return;
    }

    // If user is authenticated and trying to access admin without proper role, redirect to main app
    if (user && inAdminGroup && segments[1] === 'dashboard') {
      // You can add role checking here if needed
      // For now, we'll allow access to admin dashboard
    }
  }, [user, loading, segments]);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF6B35' }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return <>{children}</>;
} 