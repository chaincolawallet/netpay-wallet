import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
  Alert,
  Image,
  Share,
  Linking,
  Platform,
  RefreshControl,
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
import { useAuth } from '../../contexts/AuthContext';
import { supabase, db } from '../../lib/supabase';

const { width } = Dimensions.get('window');

interface Transaction {
  id: string;
  provider: string;
  transaction_type: string;
  amount: number;
  created_at: string;
  status: string;
  user_id: string;
  reference_number?: string;
  note?: string;
}

export default function TransactionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  useEffect(() => {
    if (user) {
      fetchTransactions();
      setupRealtimeSubscription();
    }
  }, [user]);

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTransactions(prev => [payload.new as Transaction, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setTransactions(prev => 
              prev.map(t => t.id === payload.new.id ? payload.new as Transaction : t)
            );
          } else if (payload.eventType === 'DELETE') {
            setTransactions(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      Alert.alert('Error', 'Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatAmount = (amount: number) => {
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'airtime':
        return 'phone-portrait';
      case 'data':
        return 'wifi';
      case 'electricity':
        return 'flash';
      case 'cable tv':
        return 'tv';
      case 'transfer':
        return 'swap-horizontal';
      case 'add money':
        return 'add-circle';
      case 'betting':
        return 'game-controller';
      case 'education':
        return 'school';
      default:
        return 'card';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#10B981';
      case 'failed':
        return '#EF4444';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getProviderLogo = (provider: string) => {
    // Return first 3 characters of provider name for logo
    return provider.substring(0, 3).toUpperCase();
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTransaction(null);
  };

  const handleShare = async () => {
    if (!selectedTransaction) return;

    try {
      const message = `Transaction Details:\n\nType: ${selectedTransaction.provider} ${selectedTransaction.transaction_type}\nAmount: ${formatAmount(selectedTransaction.amount)}\nStatus: ${getStatusText(selectedTransaction.status)}\nDate: ${formatDate(selectedTransaction.created_at)}\nReference: ${selectedTransaction.reference_number || 'N/A'}`;
      
      await Share.share({
        message,
        title: 'Transaction Details',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share transaction details');
    }
  };

  const handleDownload = async () => {
    if (!selectedTransaction) return;

    try {
      // In a real app, this would generate and download a PDF receipt
      Alert.alert(
        'Download Receipt',
        'Receipt download feature will be available soon.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to download receipt');
    }
  };

  const handleReport = () => {
    if (!selectedTransaction) return;

    Alert.alert(
      'Report Transaction',
      'Report this transaction for investigation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Report', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Report Submitted', 'Your report has been submitted. We will investigate and get back to you within 24 hours.');
          }
        },
      ]
    );
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' },
    { id: 'failed', label: 'Failed' },
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.transaction_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.reference_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         transaction.status.toLowerCase() === selectedFilter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

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
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Transactions</Text>
            <Text style={styles.subtitle}>View your transaction history</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35', '#F7931E']} />
        }>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterTab,
                  selectedFilter === filter.id && styles.filterTabActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    selectedFilter === filter.id && styles.filterTabTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Transactions List */}
        <Animated.View style={[styles.transactionsContainer, cardAnimatedStyle]}>
          {loading ? (
            <View style={styles.emptyState}>
              <Ionicons name="refresh" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>Loading Transactions...</Text>
              <Text style={styles.emptyStateSubtitle}>Please wait while we fetch your transactions.</Text>
            </View>
          ) : filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionIcon}>
                    <Ionicons
                      name={getTransactionIcon(transaction.transaction_type) as any}
                      size={24}
                      color={transaction.amount > 0 ? '#10B981' : '#EF4444'}
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionType}>{transaction.provider} {transaction.transaction_type}</Text>
                    <Text style={styles.transactionRecipient}>{transaction.note || 'N/A'}</Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.created_at)}
                    </Text>
                  </View>
                  <View style={styles.transactionAmount}>
                    <Text style={[
                      styles.transactionAmountText,
                      { color: transaction.amount > 0 ? '#10B981' : '#EF4444' }
                    ]}>
                      {transaction.amount > 0 ? '+' : ''}₦{Math.abs(transaction.amount).toLocaleString()}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
                        {getStatusText(transaction.status)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.transactionFooter}>
                  <Text style={styles.referenceText}>Ref: {transaction.reference_number || 'N/A'}</Text>
                  <TouchableOpacity 
                    style={styles.detailsButton}
                    onPress={() => handleViewDetails(transaction)}
                  >
                    <Text style={styles.detailsButtonText}>View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color="#FF6B35" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No transactions found</Text>
              <Text style={styles.emptyStateSubtitle}>
                {searchQuery ? 'Try adjusting your search terms' : 'Your transaction history will appear here'}
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Transaction Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeDetailsModal}
      >
        <View style={styles.modalContainer}>
          {selectedTransaction && (
            <>
              {/* Modal Header */}
              <LinearGradient
                colors={['#FF6B35', '#F7931E']}
                style={styles.modalHeader}
              >
                <View style={styles.modalHeaderContent}>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeDetailsModal}
                  >
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Transaction Details</Text>
                  <View style={styles.placeholder} />
                </View>
              </LinearGradient>

              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                {/* Transaction Card */}
                <View style={styles.modalTransactionCard}>
                  <View style={styles.modalTransactionHeader}>
                    <View style={styles.modalTransactionIcon}>
                      <Image
                        source={require('../../assets/images/logo.png')} // Placeholder for provider logo
                        style={styles.modalTransactionLogo}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.modalTransactionInfo}>
                      <Text style={styles.modalTransactionType}>{selectedTransaction.provider} {selectedTransaction.transaction_type}</Text>
                      <Text style={styles.modalTransactionDescription}>
                        {selectedTransaction.note || 'No description available'}
                      </Text>
                    </View>
                    <View style={styles.modalAmountContainer}>
                      <Text style={[
                        styles.modalAmount,
                        { color: selectedTransaction.amount > 0 ? '#10B981' : '#EF4444' }
                      ]}>
                        {selectedTransaction.amount > 0 ? '+' : ''}₦{Math.abs(selectedTransaction.amount).toLocaleString()}
                      </Text>
                      <View style={[
                        styles.modalStatusBadge,
                        { backgroundColor: getStatusColor(selectedTransaction.status) + '20' }
                      ]}>
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={getStatusColor(selectedTransaction.status)}
                        />
                        <Text style={[
                          styles.modalStatusText,
                          { color: getStatusColor(selectedTransaction.status) }
                        ]}>
                          {getStatusText(selectedTransaction.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Transaction Details */}
                <View style={styles.modalDetailsCard}>
                  <Text style={styles.modalSectionTitle}>Transaction Details</Text>
                  
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Reference Number</Text>
                    <Text style={styles.modalDetailValue}>{selectedTransaction.reference_number || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Date & Time</Text>
                    <Text style={styles.modalDetailValue}>
                      {formatDate(selectedTransaction.created_at)}
                    </Text>
                  </View>
                  
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Recipient</Text>
                    <Text style={styles.modalDetailValue}>{selectedTransaction.note || 'N/A'}</Text>
                  </View>
                  
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Description</Text>
                    <Text style={styles.modalDetailValue}>
                      {selectedTransaction.note || 'No description available'}
                    </Text>
                  </View>
                </View>



                {/* Action Buttons */}
                <View style={styles.modalActionButtons}>
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={handleDownload}
                  >
                    <Ionicons name="download" size={20} color="#FF6B35" />
                    <Text style={styles.modalActionButtonText}>Download Receipt</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={handleShare}
                  >
                    <Ionicons name="share-social" size={20} color="#FF6B35" />
                    <Text style={styles.modalActionButtonText}>Share Receipt</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={handleReport}
                  >
                    <Ionicons name="warning" size={20} color="#FF6B35" />
                    <Text style={styles.modalActionButtonText}>Report Issue</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  filterButton: {
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterTabActive: {
    backgroundColor: '#FF6B35',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: 'white',
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  transactionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  transactionRecipient: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  referenceText: {
    fontSize: 12,
    color: '#999',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginRight: 5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  modalScrollView: {
    flex: 1,
    padding: 20,
  },
  modalTransactionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTransactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTransactionIcon: {
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
  modalTransactionLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modalTransactionInfo: {
    flex: 1,
  },
  modalTransactionType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalTransactionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  modalAmountContainer: {
    alignItems: 'flex-end',
  },
  modalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  modalDetailsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalDetailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  modalDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  modalActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalActionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 8,
  },
});