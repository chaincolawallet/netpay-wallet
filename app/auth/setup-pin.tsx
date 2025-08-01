import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { supabase } from '../../lib/supabase';

export default function SetupPinScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const validatePin = () => {
    if (!pin) {
      Alert.alert('Error', 'Please enter a PIN');
      return false;
    }

    if (pin.length !== 4) {
      Alert.alert('Error', 'PIN must be exactly 4 digits');
      return false;
    }

    if (!/^\d{4}$/.test(pin)) {
      Alert.alert('Error', 'PIN must contain only numbers');
      return false;
    }

    if (pin !== confirmPin) {
      Alert.alert('Error', 'PINs do not match');
      return false;
    }

    return true;
  };

  const handleSetupPin = async () => {
    if (!validatePin()) return;

    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'No user found. Please try logging in again.');
        return;
      }

      // Update profile with PIN
      const { error } = await supabase
        .from('profiles')
        .update({ 
          transaction_pin: pin,
          pin_setup_completed: true 
        })
        .eq('user_id', user.id);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'PIN Setup Complete!',
          'Your transaction PIN has been successfully set up.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
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
                <Ionicons name="lock-closed" size={60} color="white" />
              </View>
              <Text style={styles.title}>Setup Transaction PIN</Text>
              <Text style={styles.subtitle}>
                Create a 4-digit PIN for secure transactions
              </Text>
            </View>

            <View style={styles.formCard}>
              {/* PIN Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter 4-digit PIN"
                    placeholderTextColor="#999"
                    value={pin}
                    onChangeText={(text) => setPin(text.replace(/\D/g, '').slice(0, 4))}
                    keyboardType="numeric"
                    secureTextEntry={!showPin}
                    maxLength={4}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPin(!showPin)}
                    disabled={loading}
                  >
                    <Ionicons 
                      name={showPin ? "eye-off" : "eye"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm PIN Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirm 4-digit PIN"
                    placeholderTextColor="#999"
                    value={confirmPin}
                    onChangeText={(text) => setConfirmPin(text.replace(/\D/g, '').slice(0, 4))}
                    keyboardType="numeric"
                    secureTextEntry={!showConfirmPin}
                    maxLength={4}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPin(!showConfirmPin)}
                    disabled={loading}
                  >
                    <Ionicons 
                      name={showConfirmPin ? "eye-off" : "eye"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* PIN Requirements */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>PIN Requirements:</Text>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={pin.length === 4 ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={pin.length === 4 ? "#4CAF50" : "#ccc"} 
                  />
                  <Text style={styles.requirementText}>Exactly 4 digits</Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={/^\d{4}$/.test(pin) ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={/^\d{4}$/.test(pin) ? "#4CAF50" : "#ccc"} 
                  />
                  <Text style={styles.requirementText}>Numbers only</Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={pin === confirmPin && confirmPin.length === 4 ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={pin === confirmPin && confirmPin.length === 4 ? "#4CAF50" : "#ccc"} 
                  />
                  <Text style={styles.requirementText}>PINs match</Text>
                </View>
              </View>

              {/* Security Notice */}
              <View style={styles.securityNotice}>
                <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                <Text style={styles.securityNoticeText}>
                  Your PIN is encrypted and secure. Never share it with anyone.
                </Text>
              </View>

              {/* Setup PIN Button */}
              <TouchableOpacity
                style={[styles.setupButton, loading && styles.setupButtonDisabled]}
                onPress={handleSetupPin}
                disabled={loading}
              >
                <Text style={styles.setupButtonText}>
                  {loading ? "Setting Up..." : "Setup PIN"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
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
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    letterSpacing: 8,
  },
  eyeButton: {
    padding: 5,
  },
  requirementsContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  requirementText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  securityNoticeText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 8,
    flex: 1,
  },
  setupButton: {
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
  },
  setupButtonDisabled: {
    opacity: 0.7,
  },
  setupButtonText: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 