import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter, useSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { supabase } from '../../lib/supabase';

export default function EmailVerificationScreen() {
  const router = useRouter();
  const { token } = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsType, setBiometricsType] = useState<string>('');
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
    checkBiometrics();
  }, []);

  // Handle deep link token
  useEffect(() => {
    if (token && !verificationAttempted) {
      handleDeepLinkVerification(token as string);
    }
  }, [token]);

  const handleDeepLinkVerification = async (verificationToken: string) => {
    setLoading(true);
    setVerificationAttempted(true);

    try {
      // Verify the email with the token
      const { data, error } = await supabase.auth.verifyOtp({
        token: verificationToken,
        type: 'signup',
      });

      if (error) {
        Alert.alert('Verification Failed', error.message);
        return;
      }

      if (data.user?.email_confirmed_at) {
        // Email verified successfully
        if (biometricsAvailable) {
          Alert.alert(
            'Email Verified!',
            'Your email has been successfully verified. Would you like to set up biometric authentication for faster login?',
            [
              {
                text: 'Skip for Now',
                onPress: () => router.replace('/auth/setup-pin')
              },
              {
                text: 'Set Up Biometrics',
                onPress: () => router.replace('/auth/setup-biometrics')
              }
            ]
          );
        } else {
          Alert.alert(
            'Email Verified!',
            'Your email has been successfully verified. You can now proceed to set up your PIN.',
            [
              {
                text: 'Continue',
                onPress: () => router.replace('/auth/setup-pin')
              }
            ]
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred during verification.');
    } finally {
      setLoading(false);
    }
  };

  const checkBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (hasHardware && isEnrolled) {
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        setBiometricsAvailable(true);
        
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricsType('Face ID');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricsType('Touch ID');
        } else {
          setBiometricsType('Biometric');
        }
      }
    } catch (error) {
      console.log('Biometrics not available:', error);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendEmail = async () => {
    setResendLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'No user found. Please try signing up again.');
        return;
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!,
        options: {
          emailRedirectTo: 'netpay://email-verification',
        },
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setCountdown(60); // 60 seconds countdown
        Alert.alert(
          'Email Sent',
          'Verification email has been resent. Please check your inbox.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      if (session?.user?.email_confirmed_at) {
        if (biometricsAvailable) {
          Alert.alert(
            'Email Verified!',
            'Your email has been successfully verified. Would you like to set up biometric authentication for faster login?',
            [
              {
                text: 'Skip for Now',
                onPress: () => router.replace('/auth/setup-pin')
              },
              {
                text: 'Set Up Biometrics',
                onPress: () => router.replace('/auth/setup-biometrics')
              }
            ]
          );
        } else {
          Alert.alert(
            'Email Verified!',
            'Your email has been successfully verified. You can now proceed to set up your PIN.',
            [
              {
                text: 'Continue',
                onPress: () => router.replace('/auth/setup-pin')
              }
            ]
          );
        }
      } else {
        Alert.alert(
          'Not Verified Yet',
          'Your email has not been verified yet. Please check your inbox and click the verification link.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/auth/login');
  };

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cardOpacity.value,
      transform: [
        {
          translateY: withSpring(cardOpacity.value * 20, {
            damping: 15,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  return (
    <LinearGradient
      colors={['#FF6B35', '#F7931E']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, cardAnimatedStyle]}>
          <Text style={styles.logo}>NETPAY</Text>
        </Animated.View>

        {/* Main Content */}
        <Animated.View style={[styles.content, cardAnimatedStyle]}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail" size={60} color="white" />
            </View>
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              {token 
                ? 'Verifying your email...' 
                : 'We\'ve sent a verification link to your email address'
              }
            </Text>
          </View>

          <View style={styles.formCard}>
            {token ? (
              <View style={styles.verifyingContainer}>
                <Text style={styles.verifyingText}>
                  Please wait while we verify your email...
                </Text>
                {loading && (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="refresh" size={24} color="#FF6B35" />
                    <Text style={styles.loadingText}>Verifying...</Text>
                  </View>
                )}
              </View>
            ) : (
              <>
                <Text style={styles.instructionText}>
                  Please check your email and click the verification link to activate your account. 
                  If you don't see the email, check your spam folder.
                </Text>

                {/* Check Verification Button */}
                <TouchableOpacity
                  style={[styles.checkButton, loading && styles.checkButtonDisabled]}
                  onPress={handleCheckVerification}
                  disabled={loading}
                >
                  <Text style={styles.checkButtonText}>
                    {loading ? "Checking..." : "I've Verified My Email"}
                  </Text>
                </TouchableOpacity>

                {/* Resend Email Button */}
                <TouchableOpacity
                  style={[
                    styles.resendButton, 
                    (resendLoading || countdown > 0) && styles.resendButtonDisabled
                  ]}
                  onPress={handleResendEmail}
                  disabled={resendLoading || countdown > 0}
                >
                  <Ionicons name="refresh" size={20} color="#FF6B35" />
                  <Text style={styles.resendButtonText}>
                    {resendLoading 
                      ? "Sending..." 
                      : countdown > 0 
                        ? `Resend in ${countdown}s` 
                        : "Resend Email"
                    }
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* Back to Login */}
            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={handleBackToLogin}
            >
              <Ionicons name="arrow-back" size={20} color="#FF6B35" />
              <Text style={styles.backToLoginButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>

          {/* Help Section */}
          <View style={styles.helpCard}>
            <Text style={styles.helpTitle}>Need Help?</Text>
            <Text style={styles.helpText}>
              If you're having trouble verifying your email, please contact our support team.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 50,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  verifyingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  verifyingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#FF6B35',
    marginLeft: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  checkButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 15,
  },
  checkButtonDisabled: {
    opacity: 0.7,
  },
  checkButtonText: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 15,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    height: 55,
  },
  backToLoginButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  helpCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  helpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 