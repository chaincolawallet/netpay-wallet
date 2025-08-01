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
  Image,
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

export default function BettingPurchaseScreen() {
  const router = useRouter();
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const platforms = [
    { 
      id: 'bet9ja', 
      name: 'Bet9ja', 
      color: '#4CAF50', 
      logo: require('../assets/images/bet9ja.png') 
    },
    { 
      id: 'nairabet', 
      name: 'Nairabet', 
      color: '#2196F3', 
      logo: require('../assets/images/nairabet.png') 
    },
    { 
      id: 'sportybet', 
      name: 'SportyBet', 
      color: '#FF9800', 
      logo: require('../assets/images/sportybet.png') 
    },
    { 
      id: 'betking', 
      name: 'BetKing', 
      color: '#9C27B0', 
      logo: require('../assets/images/betking.png') 
    },
    { 
      id: 'merrybet', 
      name: 'MerryBet', 
      color: '#E91E63', 
      logo: require('../assets/images/merrybet.png') 
    },
    { 
      id: 'betway', 
      name: 'Betway', 
      color: '#607D8B', 
      logo: require('../assets/images/betway.png') 
    },
  ];

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000, 10000, 20000];

  const handlePurchase = async () => {
    if (!selectedPlatform) {
      Alert.alert('Error', 'Please select a betting platform');
      return;
    }
    if (!accountNumber) {
      Alert.alert('Error', 'Please enter account number');
      return;
    }
    if (!amount || parseFloat(amount) < 100) {
      Alert.alert('Error', 'Please enter a valid amount (minimum ₦100)');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to success screen with transaction data
      router.push({
        pathname: '/transaction-success',
        params: {
          type: 'Betting Account Funding',
          amount: `₦${parseFloat(amount).toLocaleString()}`,
          recipient: accountNumber,
          reference: 'TXN' + Date.now(),
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Funding failed. Please try again.');
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Betting Funding</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Platform Selection */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <Text style={styles.sectionTitle}>Select Platform</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.platformsRow}
            >
              {platforms.map((platform) => (
                <TouchableOpacity
                  key={platform.id}
                  style={[
                    styles.platformCard,
                    selectedPlatform === platform.id && styles.platformCardSelected,
                  ]}
                  onPress={() => setSelectedPlatform(platform.id)}
                >
                  <View style={[
                    styles.platformLogoContainer,
                    selectedPlatform === platform.id && styles.platformLogoContainerSelected,
                  ]}>
                    <Image
                      source={platform.logo}
                      style={styles.platformLogo}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={[
                    styles.platformName,
                    selectedPlatform === platform.id && styles.platformNameSelected,
                  ]}>
                    {platform.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Account Number Input */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <Text style={styles.sectionTitle}>Account Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter account number"
                placeholderTextColor="#999"
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </Animated.View>

          {/* Amount Input */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="cash" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                placeholderTextColor="#999"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>
            
            {/* Quick Amount Buttons */}
            <Text style={styles.quickAmountTitle}>Quick Amounts</Text>
            <View style={styles.quickAmountsGrid}>
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={styles.quickAmountButton}
                  onPress={() => setAmount(quickAmount.toString())}
                >
                  <Text style={styles.quickAmountText}>₦{quickAmount.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>



          {/* Purchase Button */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <TouchableOpacity
              style={[styles.purchaseButton, loading && styles.purchaseButtonDisabled]}
              onPress={handlePurchase}
              disabled={loading}
            >
              <Text style={styles.purchaseButtonText}>
                {loading ? 'Processing...' : 'Fund Account'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Disclaimer */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <View style={styles.disclaimerCard}>
              <Ionicons name="information-circle" size={20} color="#FF9800" />
              <Text style={styles.disclaimerText}>
                Please gamble responsibly. Only bet what you can afford to lose.
              </Text>
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
  platformsRow: {
    gap: 15,
  },
  platformCard: {
    width: 120, // Fixed width for horizontal scroll
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
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
  platformCardSelected: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  platformLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Default background
    marginBottom: 10,
  },
  platformLogoContainerSelected: {
    backgroundColor: '#FF6B35',
  },
  platformLogo: {
    width: '100%',
    height: '100%',
  },
  platformName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  platformNameSelected: {
    color: '#FF6B35',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  quickAmountTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginTop: 20,
    marginBottom: 15,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAmountButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  quickAmountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: 'white',
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  totalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#FF6B35',
    marginTop: 10,
    paddingTop: 15,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  purchaseButton: {
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  purchaseButtonDisabled: {
    opacity: 0.7,
  },
  purchaseButtonText: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimerCard: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  disclaimerText: {
    fontSize: 14,
    color: 'white',
    marginLeft: 10,
    flex: 1,
  },
}); 