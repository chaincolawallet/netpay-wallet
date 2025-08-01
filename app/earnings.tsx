import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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
import { supabase, db } from '../lib/supabase';

interface Transfer {
  id: string;
  amount: number;
  note: string;
  created_at: string;
  sender_id: string;
  sender_profile?: {
    full_name: string;
  };
}

export default function EarningsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<Transfer[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  useEffect(() => {
    if (user) {
      fetchEarnings();
    }
  }, [user]);

  const fetchEarnings = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch transfers where the current user is the recipient
      const { data, error } = await supabase
        .from('user_transfers')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching earnings:', error);
        Alert.alert('Error', 'Failed to load earnings data');
        return;
      }

      // For each transfer, fetch sender profile separately
      const transfersWithProfiles = await Promise.all(
        (data || []).map(async (transfer) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', transfer.sender_id)
            .maybeSingle();
          
          return {
            ...transfer,
            sender_profile: profile
          };
        })
      );

      setEarnings(transfersWithProfiles);
      
      // Calculate total earnings
      const total = transfersWithProfiles.reduce((sum, transfer) => sum + Number(transfer.amount), 0);
      setTotalEarnings(total);

    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getThisMonthEarnings = () => {
    const now = new Date();
    const thisMonth = earnings.filter(transfer => {
      const transferDate = new Date(transfer.created_at);
      return transferDate.getMonth() === now.getMonth() && 
             transferDate.getFullYear() === now.getFullYear();
    });
    return thisMonth.reduce((sum, transfer) => sum + Number(transfer.amount), 0);
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

  if (loading) {
    return (
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Loading earnings...</Text>
        </View>
      </LinearGradient>
    );
  }

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
        <Text style={styles.headerTitle}>Earnings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Earnings Summary */}
        <Animated.View style={[styles.summaryContainer, cardAnimatedStyle]}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons name="trending-up" size={24} color="#FF6B35" />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Total Earnings</Text>
              <Text style={styles.summaryValue}>₦{totalEarnings.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons name="calendar" size={24} color="#FF6B35" />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>This Month</Text>
              <Text style={styles.summaryValue}>₦{getThisMonthEarnings().toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons name="people" size={24} color="#FF6B35" />
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryLabel}>Total Transfers</Text>
              <Text style={styles.summaryValue}>{earnings.length}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Earnings History */}
        <Animated.View style={[styles.historyContainer, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Recent Earnings</Text>
          
          {earnings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="trending-up" size={60} color="#ccc" />
              <Text style={styles.emptyTitle}>No earnings yet</Text>
              <Text style={styles.emptyDescription}>
                You haven't received any money transfers yet.{'\n'}
                Share your email with friends to start receiving payments!
              </Text>
            </View>
          ) : (
            <View style={styles.earningsList}>
              {earnings.map((transfer) => (
                <View key={transfer.id} style={styles.earningItem}>
                  <View style={styles.earningInfo}>
                    <View style={styles.earningIcon}>
                      <Ionicons name="trending-up" size={20} color="#FF6B35" />
                    </View>
                    <View style={styles.earningDetails}>
                      <Text style={styles.earningFrom}>
                        From: {transfer.sender_profile?.full_name || 'Unknown User'}
                      </Text>
                      <Text style={styles.earningDate}>
                        {formatDate(transfer.created_at)}
                      </Text>
                      {transfer.note && (
                        <Text style={styles.earningNote}>
                          "{transfer.note}"
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.earningAmount}>
                    <Text style={styles.amountText}>
                      +₦{Number(transfer.amount).toFixed(2)}
                    </Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>Received</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
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
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  historyContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  emptyContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  earningsList: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  earningItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  earningInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  earningIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  earningDetails: {
    flex: 1,
  },
  earningFrom: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  earningDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  earningNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  earningAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  statusBadge: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
}); 