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

export default function EducationPurchaseScreen() {
  const router = useRouter();
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [studentId, setStudentId] = useState('');
  const [selectedFee, setSelectedFee] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const institutions = [
    { 
      id: 'unilag', 
      name: 'University of Lagos', 
      color: '#4CAF50', 
      logo: require('../assets/images/waec.png') 
    },
    { 
      id: 'ui', 
      name: 'University of Ibadan', 
      color: '#2196F3', 
      logo: require('../assets/images/neco.png') 
    },
    { 
      id: 'oau', 
      name: 'Obafemi Awolowo University', 
      color: '#FF9800', 
      logo: require('../assets/images/jamb.png') 
    },
    { 
      id: 'uniben', 
      name: 'University of Benin', 
      color: '#9C27B0', 
      logo: require('../assets/images/waec.png') 
    },
  ];

  const feeTypes = [
    { id: 'tuition', name: 'Tuition Fee', description: 'Academic session fees', popular: true },
    { id: 'exam', name: 'Examination Fee', description: 'Semester examination fees', popular: false },
    { id: 'library', name: 'Library Fee', description: 'Library access and materials', popular: false },
    { id: 'sports', name: 'Sports Fee', description: 'Sports facilities and activities', popular: false },
    { id: 'medical', name: 'Medical Fee', description: 'Health services and insurance', popular: false },
    { id: 'other', name: 'Other Fees', description: 'Miscellaneous academic fees', popular: false },
  ];

  const quickAmounts = [5000, 10000, 25000, 50000, 100000, 200000];

  const handlePurchase = async () => {
    if (!selectedInstitution) {
      Alert.alert('Error', 'Please select an institution');
      return;
    }
    if (!studentId) {
      Alert.alert('Error', 'Please enter student ID');
      return;
    }
    if (!selectedFee) {
      Alert.alert('Error', 'Please select fee type');
      return;
    }
    if (!amount || parseFloat(amount) < 1000) {
      Alert.alert('Error', 'Please enter a valid amount (minimum ₦1,000)');
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
          type: 'Education Fee Payment',
          amount: `₦${parseFloat(amount).toLocaleString()}`,
          recipient: studentId,
          reference: 'TXN' + Date.now(),
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Payment failed. Please try again.');
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
          <Text style={styles.headerTitle}>Education Fees</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Institution Selection */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <Text style={styles.sectionTitle}>Select Institution</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.institutionsRow}
            >
              {institutions.map((institution) => (
                <TouchableOpacity
                  key={institution.id}
                  style={[
                    styles.institutionCard,
                    selectedInstitution === institution.id && styles.institutionCardSelected,
                  ]}
                  onPress={() => setSelectedInstitution(institution.id)}
                >
                  <View style={[
                    styles.institutionLogoContainer,
                    selectedInstitution === institution.id && styles.institutionLogoContainerSelected,
                  ]}>
                    <Image
                      source={institution.logo}
                      style={styles.institutionLogo}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={[
                    styles.institutionName,
                    selectedInstitution === institution.id && styles.institutionNameSelected,
                  ]}>
                    {institution.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Student ID Input */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <Text style={styles.sectionTitle}>Student ID</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter student ID"
                placeholderTextColor="#999"
                value={studentId}
                onChangeText={setStudentId}
                autoCapitalize="characters"
              />
            </View>
          </Animated.View>

          {/* Fee Type Selection */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <Text style={styles.sectionTitle}>Select Fee Type</Text>
            <View style={styles.feeTypesGrid}>
              {feeTypes.map((feeType) => (
                <TouchableOpacity
                  key={feeType.id}
                  style={[
                    styles.feeTypeCard,
                    selectedFee === feeType.id && styles.feeTypeCardSelected,
                    feeType.popular && styles.feeTypeCardPopular,
                  ]}
                  onPress={() => setSelectedFee(feeType.id)}
                >
                  {feeType.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>Popular</Text>
                    </View>
                  )}
                  <Text style={styles.feeTypeName}>{feeType.name}</Text>
                  <Text style={styles.feeTypeDescription}>{feeType.description}</Text>
                </TouchableOpacity>
              ))}
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
                {loading ? 'Processing...' : 'Pay Fees'}
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
  institutionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  institutionCard: {
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
  institutionCardSelected: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  institutionLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    padding: 4,
  },
  institutionLogoContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  institutionLogo: {
    width: '100%',
    height: '100%',
  },
  institutionName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 12,
  },
  institutionNameSelected: {
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
  feeTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  feeTypeCard: {
    width: '47%',
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
    position: 'relative',
  },
  feeTypeCardSelected: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  feeTypeCardPopular: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  feeTypeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  feeTypeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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