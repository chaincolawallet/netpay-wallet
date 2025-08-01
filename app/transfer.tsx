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
import { useAuth } from '../contexts/AuthContext';
import { useTransferService, useUserService } from '../hooks/useServices';

export default function TransferScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { transferToUser, loading: transferLoading } = useTransferService();
  const { verifyUserEmail, loading: verifyLoading } = useUserService();
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [recipientDetails, setRecipientDetails] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);

  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const verifyRecipient = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      const user = await verifyUserEmail(email.trim().toLowerCase());
      setRecipientDetails(user);
      setIsVerified(true);
      Alert.alert(
        'User Verified',
        `Found ${user.full_name || 'user'} with this email`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Verification error:', error);
      setRecipientDetails(null);
      setIsVerified(false);
      Alert.alert(
        'User Not Found',
        'No NetPay account found with this email address'
      );
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    // Reset verification when email changes
    if (isVerified) {
      setIsVerified(false);
      setRecipientDetails(null);
    }
  };

  const handleTransfer = async () => {
    if (!email || !amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isVerified) {
      Alert.alert('Error', 'Please verify the recipient\'s email first');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please log in to make transfers');
      return;
    }

    try {
      await transferToUser(email, transferAmount, note.trim() || undefined);
      
      // Reset form
      setEmail('');
      setAmount('');
      setNote('');
      setRecipientDetails(null);
      setIsVerified(false);
      router.back();
    } catch (error: any) {
      console.error('Transfer error:', error);
      // Error is already handled by the service
    }
  };

  const handleQuickAmount = (quickAmount: string) => {
    setAmount(quickAmount);
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

  const renderRecipientDetails = () => {
    if (!isVerified || !recipientDetails) return null;

    return (
      <View style={styles.recipientCard}>
        <View style={styles.recipientHeader}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.recipientVerifiedText}>Recipient Verified</Text>
        </View>
        <View style={styles.recipientInfo}>
          <View style={styles.recipientAvatar}>
            <Text style={styles.recipientAvatarText}>
              {recipientDetails.full_name ? recipientDetails.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.recipientDetails}>
            <Text style={styles.recipientName}>
              {recipientDetails.full_name || 'NetPay User'}
            </Text>
            {recipientDetails.phone_number && (
              <Text style={styles.recipientPhone}>
                Phone: {recipientDetails.phone_number}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#FF6B35', '#F7931E']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Money</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                      {/* Recipient Section */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <Text style={styles.sectionTitle}>Recipient Email *</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail" size={20} color="#FF6B35" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter recipient's email address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  disabled={transferLoading || verifyLoading}
                />
                <TouchableOpacity
                  style={[styles.verifyButton, (!email || verifyLoading || transferLoading) && styles.verifyButtonDisabled]}
                  onPress={verifyRecipient}
                  disabled={!email || verifyLoading || transferLoading}
                >
                  <Text style={[styles.verifyButtonText, (!email || verifyLoading || transferLoading) && styles.verifyButtonTextDisabled]}>
                    {verifyLoading ? "..." : "Verify"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Recipient Details */}
            {isVerified && recipientDetails && (
              <Animated.View style={[styles.recipientCard, cardAnimatedStyle]}>
                {renderRecipientDetails()}
              </Animated.View>
            )}
            
            <Text style={styles.helpText}>
              Click "Verify" to confirm the recipient has a NetPay account
            </Text>
          </Animated.View>

          {/* Amount Section */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <Text style={styles.sectionTitle}>Amount (₦) *</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="cash" size={20} color="#FF6B35" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  disabled={transferLoading || verifyLoading}
                />
              </View>
            </View>
          </Animated.View>

          {/* Note Section */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <Text style={styles.sectionTitle}>Note (Optional)</Text>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="document-text" size={20} color="#FF6B35" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="What's this for?"
                  placeholderTextColor="#999"
                  value={note}
                  onChangeText={setNote}
                  disabled={transferLoading || verifyLoading}
                  maxLength={100}
                />
              </View>
            </View>
            <Text style={styles.helpText}>
              Add a note to help the recipient understand the transfer
            </Text>
          </Animated.View>

          {/* Transfer Button */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <TouchableOpacity
              style={[styles.transferButton, (transferLoading || !email || !amount || !isVerified) && styles.transferButtonDisabled]}
              onPress={handleTransfer}
              disabled={transferLoading || !email || !amount || !isVerified}
            >
              <Text style={styles.transferButtonText}>
                {transferLoading ? 'Sending...' : `Send ₦${amount || '0.00'}`}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Important Notes */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <View style={styles.notesCard}>
              <Text style={styles.notesTitle}>Important Notes:</Text>
              <View style={styles.notesList}>
                <Text style={styles.noteItem}>• Verify the recipient's email before sending</Text>
                <Text style={styles.noteItem}>• Transfer is instant and cannot be reversed</Text>
                <Text style={styles.noteItem}>• Make sure you have sufficient balance</Text>
                <Text style={styles.noteItem}>• Both parties will receive notifications</Text>
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
  keyboardView: {
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
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  inputIcon: {
    marginRight: 15,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  verifyButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  verifyButtonTextDisabled: {
    color: '#999',
  },
  verifiedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50' + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 10,
  },
  verifiedIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  recipientCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981' + '10',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 10,
  },
  recipientVerifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 5,
  },
  recipientInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  recipientAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  recipientPhone: {
    fontSize: 14,
    color: '#666',
  },
  verificationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  verificationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  verifyEmailButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  verifyEmailButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  transferButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transferButtonDisabled: {
    opacity: 0.6,
  },
  transferButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  helpText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    lineHeight: 20,
  },
  notesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  notesList: {
    gap: 8,
  },
  noteItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
}); 