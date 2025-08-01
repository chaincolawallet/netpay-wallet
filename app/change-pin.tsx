import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
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

export default function ChangePinScreen() {
  const router = useRouter();
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePin = (pin: string) => {
    const isNumeric = /^\d+$/.test(pin);
    const isFourDigits = pin.length === 4;
    const hasNoRepeatingDigits = !/(\d)\1{2,}/.test(pin);
    const hasNoSequentialDigits = !/(012|123|234|345|456|567|678|789)/.test(pin);

    return {
      isValid: isNumeric && isFourDigits && hasNoRepeatingDigits && hasNoSequentialDigits,
      isNumeric,
      isFourDigits,
      hasNoRepeatingDigits,
      hasNoSequentialDigits,
    };
  };

  const pinValidation = validatePin(newPin);

  const handleChangePin = async () => {
    if (!currentPin.trim()) {
      Alert.alert('Error', 'Please enter your current PIN');
      return;
    }

    if (currentPin.length !== 4) {
      Alert.alert('Error', 'Current PIN must be 4 digits');
      return;
    }

    if (!newPin.trim()) {
      Alert.alert('Error', 'Please enter a new PIN');
      return;
    }

    if (!pinValidation.isValid) {
      Alert.alert('Error', 'Please ensure your new PIN meets all requirements');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('Error', 'New PINs do not match');
      return;
    }

    if (currentPin === newPin) {
      Alert.alert('Error', 'New PIN must be different from current PIN');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Success',
        'Your transaction PIN has been changed successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentPin('');
              setNewPin('');
              setConfirmPin('');
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to change PIN. Please try again.');
    } finally {
      setIsLoading(false);
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

  const renderPinInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    showPin: boolean,
    setShowPin: (show: boolean) => void,
    placeholder: string,
    maxLength: number = 4
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.pinInputContainer}>
        <TextInput
          style={styles.pinInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={!showPin}
          keyboardType="numeric"
          maxLength={maxLength}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPin(!showPin)}
        >
          <Ionicons
            name={showPin ? 'eye-off' : 'eye'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#FF6B35', '#F7931E']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change PIN</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Main Form */}
          <Animated.View style={[styles.formContainer, cardAnimatedStyle]}>
            <View style={styles.formCard}>
              <View style={styles.formHeader}>
                <View style={styles.formIcon}>
                  <Ionicons name="keypad" size={32} color="#FF6B35" />
                </View>
                <Text style={styles.formTitle}>Update Your Transaction PIN</Text>
                <Text style={styles.formDescription}>
                  Enter your current PIN and create a new 4-digit transaction PIN
                </Text>
              </View>

              {/* Current PIN */}
              {renderPinInput(
                'Current PIN',
                currentPin,
                setCurrentPin,
                showCurrentPin,
                setShowCurrentPin,
                'Enter your current PIN'
              )}

              {/* New PIN */}
              {renderPinInput(
                'New PIN',
                newPin,
                setNewPin,
                showNewPin,
                setShowNewPin,
                'Enter your new PIN'
              )}

              {/* PIN Requirements */}
              {newPin.length > 0 && (
                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsTitle}>PIN Requirements:</Text>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={pinValidation.isFourDigits ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={pinValidation.isFourDigits ? '#4CAF50' : '#FF4444'}
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: pinValidation.isFourDigits ? '#4CAF50' : '#FF4444' }
                    ]}>
                      Exactly 4 digits
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={pinValidation.isNumeric ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={pinValidation.isNumeric ? '#4CAF50' : '#FF4444'}
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: pinValidation.isNumeric ? '#4CAF50' : '#FF4444' }
                    ]}>
                      Numbers only
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={pinValidation.hasNoRepeatingDigits ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={pinValidation.hasNoRepeatingDigits ? '#4CAF50' : '#FF4444'}
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: pinValidation.hasNoRepeatingDigits ? '#4CAF50' : '#FF4444' }
                    ]}>
                      No repeating digits (e.g., 1111)
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={pinValidation.hasNoSequentialDigits ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={pinValidation.hasNoSequentialDigits ? '#4CAF50' : '#FF4444'}
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: pinValidation.hasNoSequentialDigits ? '#4CAF50' : '#FF4444' }
                    ]}>
                      No sequential digits (e.g., 1234)
                    </Text>
                  </View>
                </View>
              )}

              {/* Confirm PIN */}
              {renderPinInput(
                'Confirm New PIN',
                confirmPin,
                setConfirmPin,
                showConfirmPin,
                setShowConfirmPin,
                'Confirm your new PIN'
              )}

              {/* PIN Match Indicator */}
              {confirmPin.length > 0 && (
                <View style={styles.matchIndicator}>
                  <Ionicons
                    name={newPin === confirmPin ? 'checkmark-circle' : 'close-circle'}
                    size={16}
                    color={newPin === confirmPin ? '#4CAF50' : '#FF4444'}
                  />
                  <Text style={[
                    styles.matchText,
                    { color: newPin === confirmPin ? '#4CAF50' : '#FF4444' }
                  ]}>
                    {newPin === confirmPin ? 'PINs match' : 'PINs do not match'}
                  </Text>
                </View>
              )}

              {/* Change PIN Button */}
              <TouchableOpacity
                style={[
                  styles.changePinButton,
                  (!currentPin || !newPin || !confirmPin || !pinValidation.isValid || newPin !== confirmPin) && styles.changePinButtonDisabled
                ]}
                onPress={handleChangePin}
                disabled={!currentPin || !newPin || !confirmPin || !pinValidation.isValid || newPin !== confirmPin || isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="refresh" size={20} color="white" style={styles.loadingIcon} />
                    <Text style={styles.changePinButtonText}>Changing PIN...</Text>
                  </View>
                ) : (
                  <Text style={styles.changePinButtonText}>Change PIN</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Security Tips */}
          <Animated.View style={[styles.tipsContainer, cardAnimatedStyle]}>
            <Text style={styles.tipsTitle}>Security Tips</Text>
            <View style={styles.tipsCard}>
              <View style={styles.tipItem}>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Never share your PIN with anyone</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Avoid using easily guessable PINs like 1234 or 0000</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Don't use your birth date or phone number</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Change your PIN regularly for better security</Text>
              </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  formIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pinInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  pinInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    padding: 5,
  },
  requirementsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
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
    marginLeft: 8,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  matchText: {
    fontSize: 12,
    marginLeft: 8,
  },
  changePinButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  changePinButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIcon: {
    marginRight: 8,
  },
  changePinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  tipsContainer: {
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  tipsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
}); 