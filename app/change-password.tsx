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

export default function ChangePasswordScreen() {
  const router = useRouter();
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    };
  };

  const passwordValidation = validatePassword(newPassword);

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (!passwordValidation.isValid) {
      Alert.alert('Error', 'Please ensure your new password meets all requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert(
        'Success',
        'Your password has been changed successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please try again.');
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

  const renderPasswordInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    showPassword: boolean,
    setShowPassword: (show: boolean) => void,
    placeholder: string,
    isCurrentPassword = false
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
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
        <Text style={styles.headerTitle}>Change Password</Text>
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
                  <Ionicons name="lock-closed" size={32} color="#FF6B35" />
                </View>
                <Text style={styles.formTitle}>Update Your Password</Text>
                <Text style={styles.formDescription}>
                  Enter your current password and create a new secure password
                </Text>
              </View>

              {/* Current Password */}
              {renderPasswordInput(
                'Current Password',
                currentPassword,
                setCurrentPassword,
                showCurrentPassword,
                setShowCurrentPassword,
                'Enter your current password',
                true
              )}

              {/* New Password */}
              {renderPasswordInput(
                'New Password',
                newPassword,
                setNewPassword,
                showNewPassword,
                setShowNewPassword,
                'Enter your new password'
              )}

              {/* Password Requirements */}
              {newPassword.length > 0 && (
                <View style={styles.requirementsContainer}>
                  <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={passwordValidation.minLength ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={passwordValidation.minLength ? '#4CAF50' : '#FF4444'}
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: passwordValidation.minLength ? '#4CAF50' : '#FF4444' }
                    ]}>
                      At least 8 characters
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={passwordValidation.hasUpperCase ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={passwordValidation.hasUpperCase ? '#4CAF50' : '#FF4444'}
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: passwordValidation.hasUpperCase ? '#4CAF50' : '#FF4444' }
                    ]}>
                      At least one uppercase letter
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={passwordValidation.hasLowerCase ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={passwordValidation.hasLowerCase ? '#4CAF50' : '#FF4444'}
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: passwordValidation.hasLowerCase ? '#4CAF50' : '#FF4444' }
                    ]}>
                      At least one lowercase letter
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={passwordValidation.hasNumbers ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={passwordValidation.hasNumbers ? '#4CAF50' : '#FF4444'}
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: passwordValidation.hasNumbers ? '#4CAF50' : '#FF4444' }
                    ]}>
                      At least one number
                    </Text>
                  </View>
                  <View style={styles.requirementItem}>
                    <Ionicons
                      name={passwordValidation.hasSpecialChar ? 'checkmark-circle' : 'close-circle'}
                      size={16}
                      color={passwordValidation.hasSpecialChar ? '#4CAF50' : '#FF4444'}
                    />
                    <Text style={[
                      styles.requirementText,
                      { color: passwordValidation.hasSpecialChar ? '#4CAF50' : '#FF4444' }
                    ]}>
                      At least one special character
                    </Text>
                  </View>
                </View>
              )}

              {/* Confirm Password */}
              {renderPasswordInput(
                'Confirm New Password',
                confirmPassword,
                setConfirmPassword,
                showConfirmPassword,
                setShowConfirmPassword,
                'Confirm your new password'
              )}

              {/* Password Match Indicator */}
              {confirmPassword.length > 0 && (
                <View style={styles.matchIndicator}>
                  <Ionicons
                    name={newPassword === confirmPassword ? 'checkmark-circle' : 'close-circle'}
                    size={16}
                    color={newPassword === confirmPassword ? '#4CAF50' : '#FF4444'}
                  />
                  <Text style={[
                    styles.matchText,
                    { color: newPassword === confirmPassword ? '#4CAF50' : '#FF4444' }
                  ]}>
                    {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                  </Text>
                </View>
              )}

              {/* Change Password Button */}
              <TouchableOpacity
                style={[
                  styles.changePasswordButton,
                  (!currentPassword || !newPassword || !confirmPassword || !passwordValidation.isValid || newPassword !== confirmPassword) && styles.changePasswordButtonDisabled
                ]}
                onPress={handleChangePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword || !passwordValidation.isValid || newPassword !== confirmPassword || isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Ionicons name="refresh" size={20} color="white" style={styles.loadingIcon} />
                    <Text style={styles.changePasswordButtonText}>Changing Password...</Text>
                  </View>
                ) : (
                  <Text style={styles.changePasswordButtonText}>Change Password</Text>
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
                <Text style={styles.tipText}>Use a unique password that you don't use elsewhere</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Consider using a password manager for better security</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Never share your password with anyone</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                <Text style={styles.tipText}>Change your password regularly for better security</Text>
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
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  passwordInput: {
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
  changePasswordButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  changePasswordButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIcon: {
    marginRight: 8,
  },
  changePasswordButtonText: {
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