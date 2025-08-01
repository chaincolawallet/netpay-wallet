import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { useAuth } from '../../contexts/AuthContext';

export default function FaceIDAuthScreen() {
  const router = useRouter();
  const { signInWithBiometrics, biometricAvailable, biometricEnabled, user } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Start rotation animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000 }),
      -1,
      false
    );
  }, []);

  const handleFaceIDAuth = async () => {
    if (!biometricAvailable) {
      Alert.alert('Face ID Not Available', 'Face ID is not available on this device.');
      return;
    }

    if (!biometricEnabled) {
      Alert.alert('Face ID Not Enabled', 'Please enable Face ID in your profile settings first.');
      return;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      const { success, error } = await signInWithBiometrics();
      
      if (success) {
        // Navigate to home on successful authentication
        router.replace('/(tabs)');
      } else {
        setError(error || 'Face ID authentication failed');
        Alert.alert('Authentication Failed', error || 'Face ID authentication failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const faceIconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` }
      ],
    };
  });

  return (
    <LinearGradient
      colors={['#FF6B35', '#F7931E']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Face ID Authentication</Text>
        </View>

        <View style={styles.mainContent}>
          <Animated.View style={[styles.iconContainer, faceIconAnimatedStyle]}>
            <View style={styles.iconBackground}>
              <Ionicons name="scan" size={80} color="#FF6B35" />
            </View>
          </Animated.View>

          <Text style={styles.title}>Authenticate with Face ID</Text>
          <Text style={styles.subtitle}>
            {biometricAvailable 
              ? 'Use Face ID to quickly access your account'
              : 'Face ID is not available on this device'
            }
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            {biometricAvailable && biometricEnabled ? (
              <TouchableOpacity
                style={[styles.authButton, isAuthenticating && styles.authButtonDisabled]}
                onPress={handleFaceIDAuth}
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="scan" size={24} color="white" style={styles.buttonIcon} />
                    <Text style={styles.authButtonText}>Authenticate with Face ID</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.disabledContainer}>
                <Text style={styles.disabledText}>
                  {!biometricAvailable 
                    ? 'Face ID is not available on this device'
                    : 'Face ID is not enabled. Please enable it in your profile settings.'
                  }
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.backToLoginButton}
              onPress={handleBackToLogin}
            >
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  authButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    minWidth: 250,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 10,
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  disabledText: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  backToLoginButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  backToLoginText: {
    color: 'white',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
}); 