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
  Modal,
  FlatList,
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

export default function CableTVPurchaseScreen() {
  const router = useRouter();
  const [selectedProvider, setSelectedProvider] = useState('');
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const providers = [
    { 
      id: 'dstv', 
      name: 'DSTV', 
      color: '#E91E63', 
      logo: require('../assets/images/dstv.png') 
    },
    { 
      id: 'gotv', 
      name: 'GOtv', 
      color: '#2196F3', 
      logo: require('../assets/images/gotv.png') 
    },
    { 
      id: 'startimes', 
      name: 'StarTimes', 
      color: '#FF9800', 
      logo: require('../assets/images/startimes.png') 
    },
  ];

  const packages = [
    { id: '1', name: 'Premium', price: 24500, duration: '1 month', popular: false },
    { id: '2', name: 'Compact Plus', price: 16600, duration: '1 month', popular: true },
    { id: '3', name: 'Compact', price: 10900, duration: '1 month', popular: false },
    { id: '4', name: 'Confam', price: 6200, duration: '1 month', popular: false },
    { id: '5', name: 'Yanga', price: 3100, duration: '1 month', popular: false },
    { id: '6', name: 'Padi', price: 2100, duration: '1 month', popular: false },
  ];

  const selectedPackageData = packages.find(p => p.id === selectedPackage);

  const handlePurchase = async () => {
    if (!selectedProvider) {
      Alert.alert('Error', 'Please select a provider');
      return;
    }
    if (!smartCardNumber) {
      Alert.alert('Error', 'Please enter smart card number');
      return;
    }
    if (!selectedPackage) {
      Alert.alert('Error', 'Please select a package');
      return;
    }

    const packageData = packages.find(p => p.id === selectedPackage);
    if (!packageData) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to success screen with transaction data
      router.push({
        pathname: '/transaction-success',
        params: {
          type: 'Cable TV Subscription',
          amount: `₦${packageData.price.toLocaleString()}`,
          recipient: smartCardNumber,
          reference: 'TXN' + Date.now(),
        },
      });
    } catch (error) {
      Alert.alert('Error', 'Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    setShowPackageDropdown(false);
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

  const renderPackageItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handlePackageSelect(item.id)}
    >
      <View style={styles.dropdownItemContent}>
        <View style={styles.dropdownItemLeft}>
          <Text style={styles.dropdownItemName}>{item.name}</Text>
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
          <Text style={styles.headerTitle}>Cable TV</Text>
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

          {/* Smart Card Number Input */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <Text style={styles.sectionTitle}>Smart Card Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter smart card number"
                placeholderTextColor="#999"
                value={smartCardNumber}
                onChangeText={setSmartCardNumber}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </Animated.View>

          {/* Package Selection Dropdown */}
          <Animated.View style={[styles.section, cardAnimatedStyle]}>
            <Text style={styles.sectionTitle}>Select Package</Text>
            <TouchableOpacity
              style={styles.dropdownContainer}
              onPress={() => setShowPackageDropdown(true)}
            >
              <View style={styles.dropdownContent}>
                <View style={styles.dropdownLeft}>
                  {selectedPackageData ? (
                    <>
                      <Text style={styles.dropdownSelectedName}>{selectedPackageData.name}</Text>
                      <Text style={styles.dropdownSelectedDuration}>{selectedPackageData.duration}</Text>
                    </>
                  ) : (
                    <Text style={styles.dropdownPlaceholder}>Select a package</Text>
                  )}
                </View>
                <View style={styles.dropdownRight}>
                  {selectedPackageData && (
                    <Text style={styles.dropdownSelectedPrice}>₦{selectedPackageData.price.toLocaleString()}</Text>
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
                {loading ? 'Processing...' : 'Subscribe'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* Package Dropdown Modal */}
        <Modal
          visible={showPackageDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPackageDropdown(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPackageDropdown(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Package</Text>
                <TouchableOpacity
                  onPress={() => setShowPackageDropdown(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={packages}
                renderItem={renderPackageItem}
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
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  packageCard: {
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
  packageCardSelected: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  packageCardPopular: {
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
  packageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  packageDuration: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  packagePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
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
  dropdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  dropdownSelectedName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  dropdownSelectedDuration: {
    fontSize: 12,
    color: '#666',
  },
  dropdownSelectedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
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
  dropdownItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dropdownItemDuration: {
    fontSize: 12,
    color: '#666',
  },
  dropdownItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  popularBadgeSmall: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  popularTextSmall: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
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
}); 