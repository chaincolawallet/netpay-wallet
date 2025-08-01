import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Clipboard,
  Share,
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

export default function AddMoneyScreen() {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const cardOpacity = useSharedValue(0);
  const accountNumberOpacity = useSharedValue(0);
  const bankNameOpacity = useSharedValue(0);
  const accountNameOpacity = useSharedValue(0);

  useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
    accountNumberOpacity.value = withTiming(1, { duration: 1000, delay: 200 });
    bankNameOpacity.value = withTiming(1, { duration: 1000, delay: 400 });
    accountNameOpacity.value = withTiming(1, { duration: 1000, delay: 600 });
  }, []);

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

  const accountNumberAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: accountNumberOpacity.value,
      transform: [
        {
          scale: withSpring(accountNumberOpacity.value, {
            damping: 15,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  const bankNameAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: bankNameOpacity.value,
      transform: [
        {
          scale: withSpring(bankNameOpacity.value, {
            damping: 15,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  const accountNameAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: accountNameOpacity.value,
      transform: [
        {
          scale: withSpring(accountNameOpacity.value, {
            damping: 15,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  const handleCopyToClipboard = async (text: string, field: string) => {
    try {
      await Clipboard.setString(text);
      setCopiedField(field);
      Alert.alert('Copied!', `${field} has been copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const handleShareAccount = async () => {
    try {
      const accountInfo = `NetPay Virtual Account Details:
      
Bank: Access Bank
Account Number: 1234567890
Account Name: John Doe - NetPay

Use these details to fund your NetPay wallet.`;

      await Share.share({
        message: accountInfo,
        title: 'NetPay Virtual Account',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share account details');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Money</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Virtual Account Card */}
          <Animated.View style={[styles.virtualAccountCard, cardAnimatedStyle]}>
            <LinearGradient
              colors={['#2C3E50', '#34495E']}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="card" size={24} color="white" />
                <Text style={styles.cardTitle}>Virtual Account</Text>
              </View>
              
              <View style={styles.accountDetails}>
                <View style={styles.accountRow}>
                  <Text style={styles.accountLabel}>Bank Name</Text>
                  <Animated.View style={[styles.accountValueContainer, bankNameAnimatedStyle]}>
                    <Text style={styles.accountValue}>Access Bank</Text>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => handleCopyToClipboard('Access Bank', 'Bank Name')}
                    >
                      <Ionicons 
                        name={copiedField === 'Bank Name' ? 'checkmark' : 'copy'} 
                        size={16} 
                        color={copiedField === 'Bank Name' ? '#4CAF50' : 'white'} 
                      />
                    </TouchableOpacity>
                  </Animated.View>
                </View>

                <View style={styles.accountRow}>
                  <Text style={styles.accountLabel}>Account Number</Text>
                  <Animated.View style={[styles.accountValueContainer, accountNumberAnimatedStyle]}>
                    <Text style={styles.accountValue}>1234567890</Text>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => handleCopyToClipboard('1234567890', 'Account Number')}
                    >
                      <Ionicons 
                        name={copiedField === 'Account Number' ? 'checkmark' : 'copy'} 
                        size={16} 
                        color={copiedField === 'Account Number' ? '#4CAF50' : 'white'} 
                      />
                    </TouchableOpacity>
                  </Animated.View>
                </View>

                <View style={styles.accountRow}>
                  <Text style={styles.accountLabel}>Account Name</Text>
                  <Animated.View style={[styles.accountValueContainer, accountNameAnimatedStyle]}>
                    <Text style={styles.accountValue}>John Doe - NetPay</Text>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={() => handleCopyToClipboard('John Doe - NetPay', 'Account Name')}
                    >
                      <Ionicons 
                        name={copiedField === 'Account Name' ? 'checkmark' : 'copy'} 
                        size={16} 
                        color={copiedField === 'Account Name' ? '#4CAF50' : 'white'} 
                      />
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Instructions */}
          <Animated.View style={[styles.instructionsCard, cardAnimatedStyle]}>
            <Text style={styles.instructionsTitle}>How to Fund Your Wallet</Text>
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <View style={styles.instructionIcon}>
                  <Ionicons name="1" size={16} color="#FF6B35" />
                </View>
                <Text style={styles.instructionText}>
                  Copy the account details above
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.instructionIcon}>
                  <Ionicons name="2" size={16} color="#FF6B35" />
                </View>
                <Text style={styles.instructionText}>
                  Transfer money from your bank to this virtual account
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.instructionIcon}>
                  <Ionicons name="3" size={16} color="#FF6B35" />
                </View>
                <Text style={styles.instructionText}>
                  Your wallet will be credited within 5-10 minutes
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View style={[styles.actionButtons, cardAnimatedStyle]}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareAccount}
            >
              <Ionicons name="share-social" size={20} color="white" />
              <Text style={styles.shareButtonText}>Share Account Details</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Important Notes */}
          <Animated.View style={[styles.notesCard, cardAnimatedStyle]}>
            <Text style={styles.notesTitle}>Important Notes</Text>
            <View style={styles.notesList}>
              <View style={styles.noteItem}>
                <Ionicons name="information-circle" size={16} color="#FF6B35" />
                <Text style={styles.noteText}>
                  Minimum transfer amount: ₦100
                </Text>
              </View>
              <View style={styles.noteItem}>
                <Ionicons name="information-circle" size={16} color="#FF6B35" />
                <Text style={styles.noteText}>
                  Maximum transfer amount: ₦1,000,000
                </Text>
              </View>
              <View style={styles.noteItem}>
                <Ionicons name="information-circle" size={16} color="#FF6B35" />
                <Text style={styles.noteText}>
                  Processing time: 5-10 minutes
                </Text>
              </View>
              <View style={styles.noteItem}>
                <Ionicons name="information-circle" size={16} color="#FF6B35" />
                <Text style={styles.noteText}>
                  No transfer fees charged
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </View>
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
  scrollView: {
    flex: 1,
  },
  virtualAccountCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  accountDetails: {
    gap: 15,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  accountValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  copyButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  instructionsList: {
    gap: 15,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  actionButtons: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  shareButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  notesCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  notesList: {
    gap: 12,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
}); 