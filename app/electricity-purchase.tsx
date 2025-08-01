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

export default function ElectricityPurchaseScreen() {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const providers = [
    { 
      id: 'ikeja', 
      name: 'Ikeja Electric', 
      color: '#FF9800', 
      logo: require('../assets/images/IKEDC.png') 
    },
    { 
      id: 'ekedc', 
      name: 'Eko Electricity', 
      color: '#2196F3', 
      logo: require('../assets/images/EKEDC.png') 
    },
    { 
      id: 'ibedc', 
      name: 'IBEDC', 
      color: '#4CAF50', 
      logo: require('../assets/images/IBEDC.png') 
    },
    { 
      id: 'kedco', 
      name: 'KEDCO', 
      color: '#9C27B0', 
      logo: require('../assets/images/KEDCO.png') 
    },
    { 
      id: 'kaedco', 
      name: 'KAEDCO', 
      color: '#FF5722', 
      logo: require('../assets/images/KAEDCO.png') 
    },
    { 
      id: 'bedc', 
      name: 'BEDC', 
      color: '#795548', 
      logo: require('../assets/images/BEDC.png') 
    },
    { 
      id: 'aedc', 
      name: 'AEDC', 
      color: '#607D8B', 
      logo: require('../assets/images/AEDC.png') 
    },
    { 
      id: 'yedc', 
      name: 'YEDC', 
      color: '#E91E63', 
      logo: require('../assets/images/YEDC.png') 
    },
    { 
      id: 'jed', 
      name: 'JED', 
      color: '#3F51B5', 
      logo: require('../assets/images/JED.png') 
    },
    { 
      id: 'phedc', 
      name: 'PHEDC', 
      color: '#009688', 
      logo: require('../assets/images/PHEDC.png') 
    },
    { 
      id: 'eedc', 
      name: 'EEDC', 
      color: '#FFC107', 
      logo: require('../assets/images/EEDC.png') 
    },
  ];

  const meterTypes = [
    { id: 'prepaid', name: 'Prepaid', icon: 'card' },
    { id: 'postpaid', name: 'Postpaid', icon: 'card' },
  ];

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 20000];

  const handlePurchase = async () => {
    if (!selectedProvider) {
      Alert.alert('Error', 'Please select a provider');
      return;
    }
    if (!meterNumber) {
      Alert.alert('Error', 'Please enter meter number');
      return;
    }
    if (!meterType) {
      Alert.alert('Error', 'Please select meter type');
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
          type: 'Electricity Purchase',
          amount: `₦${parseFloat(amount).toLocaleString()}`,
          recipient: meterNumber,
          reference: 'TXN' + Date.now(),
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Purchase failed. Please try again.');
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
          <Text style={styles.headerTitle}>Buy Electricity</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Provider Selection */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <Text style={styles.sectionTitle}>Select Provider</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.providersRow}
            >
              {providers.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  style={[
                    styles.providerCard,
                    selectedProvider === provider.id && styles.providerCardSelected,
                  ]}
                  onPress={() => setSelectedProvider(provider.id)}
                >
                  <View style={[
                    styles.providerLogoContainer,
                    selectedProvider === provider.id && styles.providerLogoContainerSelected,
                  ]}>
                    <Image
                      source={provider.logo}
                      style={styles.providerLogo}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={[
                    styles.providerName,
                    selectedProvider === provider.id && styles.providerNameSelected,
                  ]}>
                    {provider.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Meter Type Selection */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <Text style={styles.sectionTitle}>Meter Type</Text>
            <View style={styles.meterTypesGrid}>
              {meterTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.meterTypeCard,
                    meterType === type.id && styles.meterTypeCardSelected,
                  ]}
                  onPress={() => setMeterType(type.id)}
                >
                  <View style={[
                    styles.meterTypeIcon,
                    { backgroundColor: '#FF6B35' + '20' },
                    meterType === type.id && { backgroundColor: '#FF6B35' }
                  ]}>
                    <Ionicons
                      name={type.icon as any}
                      size={24}
                      color={meterType === type.id ? 'white' : '#FF6B35'}
                    />
                  </View>
                  <Text style={[
                    styles.meterTypeName,
                    meterType === type.id && styles.meterTypeNameSelected,
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>

          {/* Meter Number Input */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <Text style={styles.sectionTitle}>Meter Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="flash" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter meter number"
                placeholderTextColor="#999"
                value={meterNumber}
                onChangeText={setMeterNumber}
                keyboardType="numeric"
                maxLength={11}
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
                  <Text style={styles.quickAmountText}>₦{quickAmount}</Text>
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
                {loading ? 'Processing...' : 'Buy Electricity'}
              </Text>
            </TouchableOpacity>
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
  providersRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  providerCard: {
    width: 80,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 10,
  },
  providerCardSelected: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  providerLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    padding: 4,
  },
  providerLogoContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  providerLogo: {
    width: '100%',
    height: '100%',
  },
  providerName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 12,
  },
  providerNameSelected: {
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
  meterTypesGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  meterTypeCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
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
  meterTypeCardSelected: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  meterTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  meterTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  meterTypeNameSelected: {
    color: '#FF6B35',
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
}); 