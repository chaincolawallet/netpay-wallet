import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  FlatList,
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
import { useUser } from '../../contexts/UserContext';
import { supabase, db } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUser();
  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const balanceScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 1000 });
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchNotifications();
      fetchRecentTransactions();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch wallet balance from wallet transactions
      const { data: walletData, error: walletError } = await supabase
        .from('wallet_transactions')
        .select('amount, transaction_type')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      if (walletError) {
        console.error('Error fetching wallet data:', walletError);
      } else {
        // Calculate balance (credits - debits)
        const totalBalance = (walletData || []).reduce((sum, transaction) => {
          return transaction.transaction_type === 'credit' 
            ? sum + Number(transaction.amount)
            : sum - Number(transaction.amount);
        }, 0);
        setBalance(totalBalance);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await db.getUserNotifications(user.id, 10);
      if (!error && data) {
        setNotifications(data.map(notification => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          time: formatTimeAgo(notification.created_at),
          read: notification.read,
          icon: getNotificationIcon(notification.type),
          color: getNotificationColor(notification.type),
        })));
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await db.getUserTransactions(user.id, 5);
      if (!error && data) {
        setRecentTransactions(data.map(transaction => ({
          id: transaction.id,
          type: transaction.transaction_type,
          amount: transaction.amount,
          recipient: transaction.recipient_phone || transaction.recipient_account || 'Unknown',
          date: formatTimeAgo(transaction.created_at),
          status: transaction.status,
          provider: transaction.provider,
        })));
      }
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'transaction': return 'checkmark-circle';
      case 'security': return 'shield-checkmark';
      case 'promotion': return 'gift';
      case 'system': return 'refresh';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'transaction': return '#4CAF50';
      case 'security': return '#2196F3';
      case 'promotion': return '#FF9800';
      case 'system': return '#9C27B0';
      default: return '#FF6B35';
    }
  };

  const getUserName = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0]; // Return first name only
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const handleToggleBalance = () => {
    setShowBalance(!showBalance);
    balanceScale.value = withSpring(0.95, { damping: 15, stiffness: 100 });
    setTimeout(() => {
      balanceScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    }, 150);
  };

  const handleViewAllTransactions = () => {
    router.push('/(tabs)/transactions');
  };

  const handleViewTransactionDetails = (transaction: any) => {
    // Navigate to transaction details with the transaction data
    router.push({
      pathname: '/transaction-details',
      params: { 
        transactionId: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        recipient: transaction.recipient,
        date: transaction.date,
        status: transaction.status
      }
    });
  };

  const handleNotificationPress = () => {
    setShowNotifications(true);
  };

  const handleNotificationItemPress = async (notification: any) => {
    if (!user) return;

    try {
      // Mark notification as read in database
      await db.markNotificationAsRead(notification.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        )
      );

      // Handle different notification types
      switch (notification.type) {
        case 'transaction':
          Alert.alert('Transaction Details', notification.message);
          break;
        case 'security':
          Alert.alert('Security Alert', notification.message);
          break;
        case 'promotion':
          Alert.alert('Special Offer', notification.message);
          break;
        case 'system':
          Alert.alert('System Update', notification.message);
          break;
        default:
          Alert.alert('Notification', notification.message);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      // Mark all notifications as read in database
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
      } else {
        // Update local state
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleClearAllNotifications = async () => {
    if (!user) return;

    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all notifications from database
              const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('user_id', user.id);

              if (error) {
                console.error('Error clearing notifications:', error);
              } else {
                setNotifications([]);
              }
            } catch (error) {
              console.error('Error clearing notifications:', error);
            }
          }
        },
      ]
    );
  };

  const handleSendMoney = () => {
    router.push('/transfer');
  };

  const handleAddMoney = () => {
    router.push('/add-money');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const balanceAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: balanceScale.value }],
    };
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

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FF6B35', '#F7931E']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Loading...</Text>
              <Text style={styles.subtitle}>Please wait</Text>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Hello, {getUserName()}</Text>
            <Text style={styles.subtitle}>Welcome back!</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
            <Ionicons name="notifications" size={24} color="white" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <Animated.View style={[styles.balanceCard, cardAnimatedStyle]}>
          <LinearGradient
            colors={['#FF6B35', '#F7931E']}
            style={styles.balanceGradient}
          >
            <View style={styles.balanceHeader}>
              <View>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Animated.Text style={[styles.balanceAmount, balanceAnimatedStyle]}>
                  {showBalance ? `₦${balance.toLocaleString()}` : '₦****'}
                </Animated.Text>
              </View>
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={handleToggleBalance}
              >
                <Ionicons
                  name={showBalance ? 'eye-off' : 'eye'}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.balanceActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleAddMoney}>
                <Ionicons name="add" size={20} color="#FF6B35" />
                <Text style={styles.actionButtonText}>Add Money</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleSendMoney}>
                <Ionicons name="swap-horizontal" size={20} color="#FF6B35" />
                <Text style={styles.actionButtonText}>Transfer</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>



        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={handleViewAllTransactions}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsList}>
            {recentTransactions.map((transaction) => (
              <TouchableOpacity 
                key={transaction.id} 
                style={styles.transactionItem}
                onPress={() => handleViewTransactionDetails(transaction)}
              >
                <View style={styles.transactionIcon}>
                  <Ionicons
                    name={transaction.type === 'Airtime' ? 'phone-portrait' : 
                          transaction.type === 'Transfer' ? 'send' : 'card'}
                    size={20}
                    color={transaction.amount > 0 ? '#4CAF50' : '#FF6B35'}
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionType}>{transaction.type}</Text>
                  <Text style={styles.transactionRecipient}>{transaction.recipient}</Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[
                    styles.transactionAmountText,
                    { color: transaction.amount > 0 ? '#4CAF50' : '#FF6B35' }
                  ]}>
                    {transaction.amount > 0 ? '+' : ''}₦{Math.abs(transaction.amount).toLocaleString()}
                  </Text>
                  <Text style={styles.transactionStatus}>{transaction.status}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <LinearGradient
            colors={['#FF6B35', '#F7931E']}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowNotifications(false)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Notifications</Text>
              <View style={styles.modalHeaderActions}>
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={handleMarkAllAsRead}
                >
                  <Text style={styles.modalActionText}>Mark All Read</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={handleClearAllNotifications}
                >
                  <Text style={styles.modalActionText}>Clear All</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          {/* Notifications List */}
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.notificationItem,
                  !item.read && styles.unreadNotification
                ]}
                onPress={() => handleNotificationItemPress(item)}
              >
                <View style={styles.notificationIcon}>
                  <Ionicons name={item.icon as any} size={24} color={item.color} />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationMessage}>{item.message}</Text>
                  <Text style={styles.notificationTime}>{item.time}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyNotifications}>
                <Ionicons name="notifications-off" size={48} color="#ccc" />
                <Text style={styles.emptyNotificationsText}>No notifications</Text>
              </View>
            }
            style={styles.notificationsList}
          />
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
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  balanceCard: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  balanceGradient: {
    padding: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  eyeButton: {
    padding: 5,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FF6B35',
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#FF6B35',
    fontWeight: '600',
  },

  transactionsList: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionRecipient: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionStatus: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
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
  modalHeaderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  unreadNotification: {
    backgroundColor: '#f8f9fa',
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    marginLeft: 10,
  },
  emptyNotifications: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 18,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
});
