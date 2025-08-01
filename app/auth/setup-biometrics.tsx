import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../../lib/supabase';

export default function SetupBiometricsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [biometricsType, setBiometricsType] = useState<string>('');
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
    checkBiometrics();
  }, []);

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
      } else {
        Alert.alert(
          'Biometrics Not Available',
          'Biometric authentication is not available on this device. You can still use your PIN for security.',
          [
            {
              text: 'Continue to PIN Setup',
              onPress: () => router.replace('/auth/setup-pin')
            }
          ]
        );
      }
    } catch (error) {
      console.log('Biometrics not available:', error);
      Alert.alert(
        'Biometrics Error',
        'Unable to access biometric authentication. You can still use your PIN for security.',
        [
          {
            text: 'Continue to PIN Setup',
            onPress: () => router.replace('/auth/setup-pin')
          }
        ]
      );
    }
  };

  const handleSetupBiometrics = async () => {
    if (!biometricsAvailable) {
      Alert.alert('Biometrics Not Available', 'Biometric authentication is not available on this device.');
      return;
    }

    setLoading(true);

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Set up ${biometricsType} for NetPay`,
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        // In a real app, you would store the user's preference and credentials securely
        Alert.alert(
          'Biometrics Set Up Successfully!',
          `Your ${biometricsType} has been configured for NetPay. You can now use biometric authentication for faster login.`,
          [
            {
              text: 'Continue to PIN Setup',
              onPress: () => router.replace('/auth/setup-pin')
            }
          ]
        );
      } else if (result.error === 'UserCancel') {
        // User cancelled the setup
        Alert.alert(
          'Setup Cancelled',
          'You can still set up biometric authentication later in your profile settings.',
          [
            {
              text: 'Continue to PIN Setup',
              onPress: () => router.replace('/auth/setup-pin')
            }
          ]
        );
      } else {
        Alert.alert(
          'Setup Failed',
          'Biometric setup failed. You can try again or continue with PIN setup.',
          [
            {
              text: 'Try Again',
              onPress: () => handleSetupBiometrics()
            },
            {
              text: 'Skip for Now',
              onPress: () => router.replace('/auth/setup-pin')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Setup Error',
        'An error occurred during biometric setup. You can continue with PIN setup.',
        [
          {
            text: 'Continue to PIN Setup',
            onPress: () => router.replace('/auth/setup-pin')
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkipBiometrics = () => {
    Alert.alert(
      'Skip Biometrics Setup',
      'You can always set up biometric authentication later in your profile settings.',
      [
        {
          text: 'Continue to PIN Setup',
          onPress: () => router.replace('/auth/setup-pin')
        }
      ]
    );
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

  if (!biometricsAvailable) {
    return (
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.content, cardAnimatedStyle]}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={60} color="white" />
              </View>
              <Text style={styles.title}>Security Setup</Text>
              <Text style={styles.subtitle}>
                Setting up your account security
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    );
  }

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
              <Ionicons 
                name={biometricsType === 'Face ID' ? 'scan' : 'finger-print'} 
                size={60} 
                color="white" 
              />
            </View>
            <Text style={styles.title}>Set Up {biometricsType}</Text>
            <Text style={styles.subtitle}>
              Enable {biometricsType} for faster and more secure login
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.instructionText}>
              {biometricsType} allows you to sign in to NetPay quickly and securely using your biometric authentication.
            </Text>

            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <Ionicons name="flash" size={20} color="#FF6B35" />
                <Text style={styles.benefitText}>Faster login experience</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="shield-checkmark" size={20} color="#FF6B35" />
                <Text style={styles.benefitText}>Enhanced security</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="key" size={20} color="#FF6B35" />
                <Text style={styles.benefitText}>No need to remember passwords</Text>
              </View>
            </View>

            {/* Setup Biometrics Button */}
            <TouchableOpacity
              style={[styles.setupButton, loading && styles.setupButtonDisabled]}
              onPress={handleSetupBiometrics}
              disabled={loading}
            >
              <Text style={styles.setupButtonText}>
                {loading ? "Setting Up..." : `Set Up ${biometricsType}`}
              </Text>
            </TouchableOpacity>

            {/* Skip Button */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipBiometrics}
            >
              <Text style={styles.skipButtonText}>Skip for Now</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  benefitsContainer: {
    marginBottom: 30,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  setupButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  setupButtonDisabled: {
    backgroundColor: '#ccc',
  },
  setupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
}); 