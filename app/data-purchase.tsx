import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { dataPurchaseService } from '../lib/services';

export default function DataPurchaseScreen() {
  const router = useRouter();
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [dataPlans, setDataPlans] = useState([]);
  const [fetchingPlans, setFetchingPlans] = useState(false);
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  // Fetch data plans when component mounts
  useEffect(() => {
    fetchDataPlans();
  }, []);

  const fetchDataPlans = async () => {
    setFetchingPlans(true);
    try {
      const plans = await dataPurchaseService.getDataPlans();
      setDataPlans(plans);
    } catch (error) {
      console.error('Error fetching data plans:', error);
      Alert.alert('Error', 'Failed to load data plans. Please try again.');
    } finally {
      setFetchingPlans(false);
    }
  };

  const networks = [
    { 
      id: '1', 
      name: 'MTN', 
      color: '#FFC107', 
      logo: require('../assets/images/mtn.png') 
    },
    { 
      id: '2', 
      name: 'Airtel', 
      color: '#E91E63', 
      logo: require('../assets/images/airtel.png') 
    },
    { 
      id: '3', 
      name: '9mobile', 
      color: '#2196F3', 
      logo: require('../assets/images/9mobile.png') 
    },
    { 
      id: '4', 
      name: 'Glo', 
      color: '#4CAF50', 
      logo: require('../assets/images/glo.png') 
    },
  ];

  const selectedPlanData = dataPlans.find(p => p.id === selectedPlan);

  const handlePurchase = async () => {
    if (!selectedNetwork) {
      Alert.alert('Error', 'Please select a network');
      return;
    }
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a data plan');
      return;
    }

    setLoading(true);
    try {
      const result = await dataPurchaseService.purchaseData(
        selectedNetwork,
        phoneNumber,
        selectedPlan
      );
      
      // Navigate to success screen with transaction data
      router.push({
        pathname: '/transaction-success',
        params: {
          type: 'Data Purchase',
          amount: `₦${selectedPlanData?.price || 0}`,
          recipient: phoneNumber,
          reference: result.reference,
          dataStatus: result.dataStatus,
        },
      });
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', error.message || 'Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowPlanDropdown(false);
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

  const renderPlanItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handlePlanSelect(item.id)}
    >
      <View style={styles.dropdownItemContent}>
        <View style={styles.dropdownItemLeft}>
          <Text style={styles.dropdownItemSize}>{item.size}</Text>
          <Text style={styles.dropdownItemDuration}>{item.duration}</Text>
        </View>
        <View style={styles.dropdownItemRight}>
          <Text style={styles.dropdownItemPrice}>₦{item.price.toLocaleString()}</Text>
          {item.popular && (
            <View style={styles.popularBadgeSmall}>
              <Text style={styles.popularTextSmall}>Popular</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Buy Data</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Network Selection */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <Text style={styles.sectionTitle}>Select Network</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.networksRow}
            >
              {networks.map((network) => (
                <TouchableOpacity
                  key={network.id}
                  style={[
                    styles.networkCard,
                    selectedNetwork === network.id && styles.networkCardSelected,
                  ]}
                  onPress={() => setSelectedNetwork(network.id)}
                >
                  <View style={[
                    styles.networkLogoContainer,
                    selectedNetwork === network.id && styles.networkLogoContainerSelected,
                  ]}>
                    <Image
                      source={network.logo}
                      style={styles.networkLogo}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={[
                    styles.networkName,
                    selectedNetwork === network.id && styles.networkNameSelected,
                  ]}>
                    {network.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>

          {/* Phone Number Input */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <Text style={styles.sectionTitle}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>
          </Animated.View>

          {/* Data Plan Selection Dropdown */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <Text style={styles.sectionTitle}>Select Data Plan</Text>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => setShowPlanDropdown(true)}
            >
              <View style={styles.dropdownContent}>
                <View style={styles.dropdownLeft}>
                  {selectedPlanData ? (
                    <>
                      <Text style={styles.dropdownSelectedSize}>{selectedPlanData.size}</Text>
                      <Text style={styles.dropdownSelectedDuration}>{selectedPlanData.duration}</Text>
                    </>
                  ) : (
                    <Text style={styles.dropdownPlaceholder}>Select a data plan</Text>
                  )}
                </View>
                <View style={styles.dropdownRight}>
                  {selectedPlanData && (
                    <Text style={styles.dropdownSelectedPrice}>₦{selectedPlanData.price.toLocaleString()}</Text>
                  )}
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>



          {/* Purchase Button */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <TouchableOpacity
              style={[styles.purchaseButton, loading && styles.purchaseButtonDisabled]}
              onPress={handlePurchase}
              disabled={loading}
            >
              <Text style={styles.purchaseButtonText}>
                {loading ? 'Processing...' : 'Buy Data'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* Data Plan Dropdown Modal */}
        <Modal
          visible={showPlanDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPlanDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPlanDropdown(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Data Plan</Text>
                <TouchableOpacity
                  onPress={() => setShowPlanDropdown(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={dataPlans}
                renderItem={renderPlanItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                style={styles.dropdownList}
              />
            </View>
          </TouchableOpacity>
        </Modal>
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
  networksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  networkCard: {
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
  networkCardSelected: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  networkLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    padding: 4,
  },
  networkLogoContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  networkLogo: {
    width: '100%',
    height: '100%',
  },
  networkName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: 12,
  },
  networkNameSelected: {
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
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownLeft: {
    flex: 1,
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  dropdownSelectedSize: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  dropdownSelectedDuration: {
    fontSize: 12,
    color: '#666',
  },
  dropdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownSelectedPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginRight: 10,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemLeft: {
    flex: 1,
  },
  dropdownItemSize: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  dropdownItemDuration: {
    fontSize: 12,
    color: '#666',
  },
  dropdownItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
    marginRight: 10,
  },
  popularBadgeSmall: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  popularTextSmall: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '80%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 5,
  },
  dropdownList: {
    maxHeight: 300,
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
  networksRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
}); 