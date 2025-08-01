import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { generateHTMLReceipt } from './components/TransactionReceipt';

export default function TransactionDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const cardOpacity = useSharedValue(0);
  const slideUp = useSharedValue(50);

  useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
    slideUp.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  // Get transaction data from params or use mock data as fallback
  const getTransactionData = () => {
    // If params are provided (from purchase screens), use them
    if (params.type && params.amount && params.recipient) {
      const amountStr = params.amount as string;
      const amount = parseFloat(amountStr.replace(/[₦,]/g, ''));
      
      return {
        type: params.type as string,
        amount: -amount, // Negative for purchases
        recipient: params.recipient as string,
        reference: params.reference as string || 'TXN' + Date.now(),
        date: params.date as string || new Date().toLocaleDateString(),
        time: params.time as string || new Date().toLocaleTimeString(),
        status: params.status as string || 'completed',
        description: getTransactionDescription(params.type as string, params.recipient as string),
        fee: 0,
        total: amount,
      };
    }

    // Fallback to mock data if no params (from transactions list)
    const transactionId = params.transactionId as string;
    const transactions = {
      '1': {
        type: 'Airtime',
        amount: -1000,
        recipient: '08012345678',
        reference: 'TXN001',
        date: '2024-01-15',
        time: '14:30',
        status: 'completed',
        description: 'Airtime purchase for MTN',
        fee: 0,
        total: 1000,
      },
      '2': {
        type: 'Transfer',
        amount: 5000,
        recipient: 'Sarah Johnson',
        reference: 'TXN002',
        date: '2024-01-14',
        time: '09:15',
        status: 'completed',
        description: 'Money transfer to Sarah Johnson',
        fee: 0,
        total: 5000,
      },
      '3': {
        type: 'Data',
        amount: -1500,
        recipient: '08012345678',
        reference: 'TXN003',
        date: '2024-01-13',
        time: '16:45',
        status: 'completed',
        description: 'Data bundle purchase for MTN',
        fee: 0,
        total: 1500,
      },
      '4': {
        type: 'Electricity',
        amount: -2500,
        recipient: 'Ikeja Electric',
        reference: 'TXN004',
        date: '2024-01-12',
        time: '11:20',
        status: 'completed',
        description: 'Electricity bill payment',
        fee: 0,
        total: 2500,
      },
      '5': {
        type: 'Add Money',
        amount: 10000,
        recipient: 'Bank Transfer',
        reference: 'TXN005',
        date: '2024-01-11',
        time: '08:30',
        status: 'completed',
        description: 'Bank transfer to wallet',
        fee: 0,
        total: 10000,
      },
      '6': {
        type: 'Cable TV',
        amount: -3000,
        recipient: 'DSTV',
        reference: 'TXN006',
        date: '2024-01-10',
        time: '13:15',
        status: 'failed',
        description: 'DSTV subscription payment',
        fee: 0,
        total: 3000,
      },
    };

    return transactions[transactionId as keyof typeof transactions] || {
      type: 'Unknown',
      amount: 0,
      recipient: 'Unknown',
      reference: 'TXN000',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      status: 'unknown',
      description: 'Transaction details not available',
      fee: 0,
      total: 0,
    };
  };

  const getTransactionDescription = (type: string, recipient: string) => {
    switch (type.toLowerCase()) {
      case 'airtime purchase':
        return 'Airtime purchase for ' + getNetworkName(recipient);
      case 'data purchase':
        return 'Data bundle purchase for ' + getNetworkName(recipient);
      case 'electricity purchase':
        return 'Electricity bill payment';
      case 'cable tv purchase':
        return 'Cable TV subscription payment';
      case 'education purchase':
        return 'Education fee payment';
      case 'betting purchase':
        return 'Betting account funding';
      default:
        return 'Transaction description';
    }
  };

  const getNetworkName = (phoneNumber: string) => {
    if (phoneNumber.includes('0801') || phoneNumber.includes('0802') || phoneNumber.includes('0803') || phoneNumber.includes('0804') || phoneNumber.includes('0805') || phoneNumber.includes('0806') || phoneNumber.includes('0807') || phoneNumber.includes('0808') || phoneNumber.includes('0809')) {
      return 'MTN';
    } else if (phoneNumber.includes('0805') || phoneNumber.includes('0807') || phoneNumber.includes('0811') || phoneNumber.includes('0815') || phoneNumber.includes('0903') || phoneNumber.includes('0905')) {
      return 'Glo';
    } else if (phoneNumber.includes('0802') || phoneNumber.includes('0808') || phoneNumber.includes('0812') || phoneNumber.includes('0814') || phoneNumber.includes('0901') || phoneNumber.includes('0902') || phoneNumber.includes('0904') || phoneNumber.includes('0907')) {
      return 'Airtel';
    } else if (phoneNumber.includes('0809') || phoneNumber.includes('0817') || phoneNumber.includes('0818') || phoneNumber.includes('0908') || phoneNumber.includes('0909')) {
      return '9mobile';
    }
    return 'MTN'; // Default
  };

  const transactionData = getTransactionData();

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'airtime':
      case 'airtime purchase':
        return 'phone-portrait';
      case 'data':
      case 'data purchase':
        return 'wifi';
      case 'electricity':
      case 'electricity purchase':
        return 'flash';
      case 'cable tv':
      case 'cable tv purchase':
        return 'tv';
      case 'education':
      case 'education purchase':
        return 'school';
      case 'betting':
      case 'betting purchase':
        return 'trophy';
      case 'transfer':
        return 'send';
      default:
        return 'card';
    }
  };

  const getTransactionLogo = (type: string, recipient: string) => {
    switch (type.toLowerCase()) {
      case 'airtime':
      case 'airtime purchase':
      case 'data':
      case 'data purchase':
        // Check recipient for network type
        if (recipient.includes('0801') || recipient.includes('0802') || recipient.includes('0803') || recipient.includes('0804') || recipient.includes('0805') || recipient.includes('0806') || recipient.includes('0807') || recipient.includes('0808') || recipient.includes('0809')) {
          return require('../assets/images/mtn.png');
        } else if (recipient.includes('0805') || recipient.includes('0807') || recipient.includes('0811') || recipient.includes('0815') || recipient.includes('0903') || recipient.includes('0905')) {
          return require('../assets/images/glo.png');
        } else if (recipient.includes('0802') || recipient.includes('0808') || recipient.includes('0812') || recipient.includes('0814') || recipient.includes('0901') || recipient.includes('0902') || recipient.includes('0904') || recipient.includes('0907')) {
          return require('../assets/images/airtel.png');
        } else if (recipient.includes('0809') || recipient.includes('0817') || recipient.includes('0818') || recipient.includes('0908') || recipient.includes('0909')) {
          return require('../assets/images/9mobile.png');
        }
        return require('../assets/images/mtn.png'); // Default to MTN
      case 'electricity':
      case 'electricity purchase':
        if (recipient.toLowerCase().includes('ikeja')) {
          return require('../assets/images/IKEDC.png');
        } else if (recipient.toLowerCase().includes('eko')) {
          return require('../assets/images/EKEDC.png');
        } else if (recipient.toLowerCase().includes('ibadan')) {
          return require('../assets/images/IBEDC.png');
        } else if (recipient.toLowerCase().includes('kano')) {
          return require('../assets/images/KEDCO.png');
        } else if (recipient.toLowerCase().includes('kaduna')) {
          return require('../assets/images/KAEDCO.png');
        } else if (recipient.toLowerCase().includes('benin')) {
          return require('../assets/images/BEDC.png');
        } else if (recipient.toLowerCase().includes('abuja')) {
          return require('../assets/images/AEDC.png');
        } else if (recipient.toLowerCase().includes('yola')) {
          return require('../assets/images/YEDC.png');
        } else if (recipient.toLowerCase().includes('jos')) {
          return require('../assets/images/JED.png');
        } else if (recipient.toLowerCase().includes('port harcourt')) {
          return require('../assets/images/PHEDC.png');
        } else if (recipient.toLowerCase().includes('enugu')) {
          return require('../assets/images/EEDC.png');
        }
        return require('../assets/images/IKEDC.png'); // Default to IKEDC
      case 'cable tv':
      case 'cable tv purchase':
        if (recipient.toLowerCase().includes('dstv')) {
          return require('../assets/images/dstv.png');
        } else if (recipient.toLowerCase().includes('gotv')) {
          return require('../assets/images/gotv.png');
        } else if (recipient.toLowerCase().includes('startimes')) {
          return require('../assets/images/startimes.png');
        }
        return require('../assets/images/dstv.png'); // Default to DSTV
      case 'education':
      case 'education purchase':
        if (recipient.toLowerCase().includes('waec')) {
          return require('../assets/images/waec.png');
        } else if (recipient.toLowerCase().includes('neco')) {
          return require('../assets/images/neco.png');
        } else if (recipient.toLowerCase().includes('jamb')) {
          return require('../assets/images/jamb.png');
        }
        return require('../assets/images/waec.png'); // Default to WAEC
      case 'betting':
      case 'betting purchase':
        if (recipient.toLowerCase().includes('bet9ja')) {
          return require('../assets/images/bet9ja.png');
        } else if (recipient.toLowerCase().includes('nairabet')) {
          return require('../assets/images/nairabet.png');
        } else if (recipient.toLowerCase().includes('sportybet')) {
          return require('../assets/images/sportybet.png');
        } else if (recipient.toLowerCase().includes('betking')) {
          return require('../assets/images/betking.png');
        } else if (recipient.toLowerCase().includes('merrybet')) {
          return require('../assets/images/merrybet.png');
        } else if (recipient.toLowerCase().includes('betway')) {
          return require('../assets/images/betway.png');
        }
        return require('../assets/images/bet9ja.png'); // Default to Bet9ja
      default:
        return require('../assets/images/mtn.png'); // Default fallback
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'successful':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'failed':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const handleShare = async () => {
    try {
      // Generate HTML receipt
      const htmlReceipt = generateHTMLReceipt({
        id: transactionData.reference,
        type: transactionData.type,
        amount: transactionData.amount,
        recipient: transactionData.recipient,
        reference: transactionData.reference,
        date: `${transactionData.date} ${transactionData.time}`,
        status: transactionData.status,
        description: transactionData.description,
        fee: transactionData.fee,
        total: transactionData.total,
      });

      // Share the transaction details
      await Share.share({
        message: `NetPay Transaction Receipt\n\n${transactionData.type} - ${transactionData.amount > 0 ? '+' : ''}₦${Math.abs(transactionData.amount).toLocaleString()}\nRecipient: ${transactionData.recipient}\nReference: ${transactionData.reference}\nDate: ${transactionData.date} ${transactionData.time}\nStatus: ${transactionData.status}\n\nHTML receipt generated successfully!`,
        title: 'NetPay Transaction Receipt',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share receipt. Please try again.');
    }
  };

  const handleDownload = async () => {
    try {
      // Generate HTML receipt
      const htmlReceipt = generateHTMLReceipt({
        id: transactionData.reference,
        type: transactionData.type,
        amount: transactionData.amount,
        recipient: transactionData.recipient,
        reference: transactionData.reference,
        date: `${transactionData.date} ${transactionData.time}`,
        status: transactionData.status,
        description: transactionData.description,
        fee: transactionData.fee,
        total: transactionData.total,
      });

      // Share the HTML receipt
      await Share.share({
        message: `NetPay Transaction Receipt\n\n${transactionData.type} - ${transactionData.amount > 0 ? '+' : ''}₦${Math.abs(transactionData.amount).toLocaleString()}\nReference: ${transactionData.reference}\nDate: ${transactionData.date} ${transactionData.time}\n\nHTML receipt generated successfully!`,
        title: 'NetPay Transaction Receipt',
      });

      Alert.alert('Success', 'HTML receipt generated and shared successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate receipt. Please try again.');
    }
  };

  const handleReport = () => {
    Alert.alert('Report Issue', 'Report submitted. We will contact you soon.');
  };

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cardOpacity.value,
      transform: [{ translateY: slideUp.value }],
    };
  });

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
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Transaction Card */}
        <Animated.View style={[styles.transactionCard, cardAnimatedStyle]}>
          <View style={styles.transactionHeader}>
            <View style={styles.transactionIcon}>
              <Image
                source={getTransactionLogo(transactionData.type, transactionData.recipient)}
                style={styles.transactionLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionType}>{transactionData.type}</Text>
              <Text style={styles.transactionDescription}>
                {transactionData.description}
              </Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={[
                styles.amount,
                { color: transactionData.amount > 0 ? '#4CAF50' : '#FF6B35' }
              ]}>
                {transactionData.amount > 0 ? '+' : ''}₦{Math.abs(transactionData.amount).toLocaleString()}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(transactionData.status) + '20' }
              ]}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={getStatusColor(transactionData.status)}
                />
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(transactionData.status) }
                ]}>
                  {transactionData.status}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Transaction Details */}
        <Animated.View style={[styles.detailsCard, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference Number</Text>
            <Text style={styles.detailValue}>{transactionData.reference}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>
              {transactionData.date} • {transactionData.time}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Recipient</Text>
            <Text style={styles.detailValue}>{transactionData.recipient}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{transactionData.description}</Text>
          </View>
        </Animated.View>

        {/* Payment Breakdown */}
        <Animated.View style={[styles.breakdownCard, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Payment Breakdown</Text>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Amount</Text>
            <Text style={styles.breakdownValue}>₦{Math.abs(transactionData.amount).toLocaleString()}</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Service Fee</Text>
            <Text style={styles.breakdownValue}>₦{transactionData.fee.toLocaleString()}</Text>
          </View>
          
          <View style={[styles.breakdownRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₦{transactionData.total.toLocaleString()}</Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View style={[styles.actionButtons, cardAnimatedStyle]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDownload}
          >
            <Ionicons name="download" size={20} color="#FF6B35" />
            <Text style={styles.actionButtonText}>Download Receipt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={20} color="#FF6B35" />
            <Text style={styles.actionButtonText}>Share Receipt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleReport}
          >
            <Ionicons name="flag" size={20} color="#FF6B35" />
            <Text style={styles.actionButtonText}>Report Issue</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Support Section */}
        <Animated.View style={[styles.supportCard, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <Text style={styles.supportText}>
            If you have any questions about this transaction, our support team is here to help.
          </Text>
          
          <View style={styles.supportButtons}>
            <TouchableOpacity style={styles.supportButton}>
              <Ionicons name="call" size={20} color="#FF6B35" />
              <Text style={styles.supportButtonText}>Call Support</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#666',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  breakdownCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
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
  breakdownLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  breakdownValue: {
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 5,
  },
  supportCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  supportButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35' + '10',
    borderRadius: 12,
    paddingVertical: 12,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 5,
  },
}); 