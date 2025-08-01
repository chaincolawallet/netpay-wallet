import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  Dimensions,
  Clipboard,
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
import { useUser } from '../contexts/UserContext';
import { supabase, db } from '../lib/supabase';

const { width } = Dimensions.get('window');

interface ReferralData {
  referral_code: string;
  referral_count: number;
  referrer_name: string | null;
  total_earnings: number;
  pending_earnings: number;
}

interface Referral {
  id: string;
  name: string;
  phone: string;
  status: 'completed' | 'pending';
  date: string;
  earnings: number;
}

export default function ReferralScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUser();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const [referralData, setReferralData] = useState<ReferralData>({
    referral_code: '',
    referral_count: 0,
    referrer_name: null,
    total_earnings: 0,
    pending_earnings: 0,
  });

  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    if (user && profile) {
      fetchReferralData();
    }
  }, [user, profile]);

  const fetchReferralData = async () => {
    if (!user) return;

    try {
      setLoadingData(true);
      console.log('ReferralScreen: Fetching referral data for userId:', user.id);
      
      // Get user's referral code and referred by info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('referral_code, referred_by')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('ReferralScreen: Profile data:', profile);
      console.log('ReferralScreen: Profile error:', profileError);

      if (profileError) {
        throw profileError;
      }

      // Get referrer's name if user was referred by someone
      let referrerName = null;
      if (profile?.referred_by) {
        const { data: referrer, error: referrerError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', profile.referred_by)
          .maybeSingle();
        
        if (!referrerError && referrer) {
          referrerName = referrer.full_name;
        }
      }

      // Count how many people this user has referred
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', user.id);

      if (countError) {
        throw countError;
      }

      const referralCount = count || 0;
      
      // Get detailed referral list
      const { data: referralUsers, error: referralError } = await supabase
        .from('profiles')
        .select('user_id, full_name, phone_number, email_verified, created_at')
        .eq('referred_by', user.id)
        .order('created_at', { ascending: false });

      if (referralError) {
        console.error('Error fetching referrals:', referralError);
      }

      // Calculate earnings
      const totalEarnings = referralCount * 200; // ₦200 per referral
      const pendingEarnings = 0; // For now, all earnings are available

      setReferralData({
        referral_code: profile?.referral_code || 'NETPAY' + user.id.slice(-6).toUpperCase(),
        referral_count: referralCount,
        referrer_name: referrerName,
        total_earnings: totalEarnings,
        pending_earnings: pendingEarnings,
      });

      // Format referrals for display
      const formattedReferrals = (referralUsers || []).map(user => ({
        id: user.user_id,
        name: user.full_name || 'Unknown User',
        phone: user.phone_number || 'No phone',
        status: user.email_verified ? 'completed' : 'pending',
        date: user.created_at,
        earnings: 200,
      }));

      setReferrals(formattedReferrals);

    } catch (error) {
      console.error('Error fetching referral data:', error);
      Alert.alert('Error', 'Failed to load referral data. Please try again.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleShareReferral = async () => {
    if (!referralData.referral_code) return;

    try {
      const message = `Join me on this amazing financial app! Use my referral code: ${referralData.referral_code}\n\nGet ₦200 bonus when you sign up and complete your first transaction!\n\nDownload NetPay: https://netpay.com/download`;
      
      await Share.share({
        message,
        title: 'Join NetPay',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share referral code');
    }
  };

  const handleCopyCode = async () => {
    if (!referralData.referral_code) return;

    try {
      await Clipboard.setString(referralData.referral_code);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy referral code');
    }
  };

  const handleViewEarnings = () => {
    router.push('/earnings');
  };

  const handleViewHistory = () => {
    Alert.alert(
      'Referral History',
      'Referral history feature will be available soon!',
      [{ text: 'OK' }]
    );
  };

  const handleWithdraw = () => {
    const minimumWithdrawal = 5000;
    const availableForWithdrawal = referralData.total_earnings;
    const canWithdraw = availableForWithdrawal >= minimumWithdrawal;

    if (canWithdraw) {
      Alert.alert(
        'Withdraw Earnings',
        'Withdrawal feature will be available soon!',
        [{ text: 'OK' }]
      );
    } else {
      const amountNeeded = minimumWithdrawal - availableForWithdrawal;
      Alert.alert(
        'Minimum Not Met',
        `You need ₦${amountNeeded.toLocaleString()} more to reach the minimum withdrawal amount of ₦${minimumWithdrawal.toLocaleString()}`,
        [{ text: 'OK' }]
      );
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const minimumWithdrawal = 5000;
  const availableForWithdrawal = referralData.total_earnings;
  const canWithdraw = availableForWithdrawal >= minimumWithdrawal;
  const amountNeeded = minimumWithdrawal - availableForWithdrawal;

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Referral Program</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, cardAnimatedStyle]}>
          {/* Referral Code Card */}
          <View style={styles.card}>
            <LinearGradient
              colors={['#4CAF50', '#45A049']}
              style={styles.referralCodeCard}
            >
              <View style={styles.referralCodeHeader}>
                <Ionicons name="gift" size={32} color="white" />
                <Text style={styles.referralCodeTitle}>Your Referral Code</Text>
              </View>
              <View style={styles.referralCodeContainer}>
                <Text style={styles.referralCode}>{referralData.referral_code}</Text>
                <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
                  <Ionicons name="copy" size={20} color="#4CAF50" />
                </TouchableOpacity>
              </View>
              <Text style={styles.referralCodeSubtitle}>
                Share this code with friends and earn ₦200 for each successful referral
              </Text>
            </LinearGradient>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{referralData.referral_count}</Text>
              <Text style={styles.statLabel}>Total Referrals</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>₦{referralData.total_earnings.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>₦{referralData.pending_earnings.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewHistory}
            >
              <Ionicons name="time" size={20} color="#FF6B35" />
              <Text style={styles.actionButtonText}>View History</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewEarnings}
            >
              <Ionicons name="wallet" size={20} color="#FF6B35" />
              <Text style={styles.actionButtonText}>View Earnings</Text>
            </TouchableOpacity>
          </View>

          {/* Withdraw Earnings Section */}
          <View style={styles.withdrawCard}>
            <Text style={styles.withdrawTitle}>Withdraw Earnings</Text>
            <Text style={styles.withdrawSubtitle}>
              Minimum withdrawal amount: ₦{minimumWithdrawal.toLocaleString()}
            </Text>
            
            <View style={styles.withdrawInfo}>
              <Text style={styles.withdrawLabel}>Available for withdrawal:</Text>
              <Text style={styles.withdrawAmount}>₦{availableForWithdrawal.toLocaleString()}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.withdrawButton,
                canWithdraw ? styles.withdrawButtonActive : styles.withdrawButtonDisabled
              ]}
              onPress={handleWithdraw}
              disabled={!canWithdraw}
            >
              <Ionicons name="wallet" size={20} color={canWithdraw ? "white" : "#999"} />
              <Text style={[
                styles.withdrawButtonText,
                { color: canWithdraw ? "white" : "#999" }
              ]}>
                {canWithdraw ? "Withdraw" : "Minimum Not Met"}
              </Text>
            </TouchableOpacity>

            {!canWithdraw && amountNeeded > 0 && (
              <Text style={styles.withdrawNote}>
                You need ₦{amountNeeded.toLocaleString()} more to reach the minimum withdrawal amount
              </Text>
            )}
          </View>

          {/* Referrer Info */}
          {referralData.referrer_name && (
            <View style={styles.referrerCard}>
              <View style={styles.referrerContent}>
                <Ionicons name="gift" size={20} color="#FF6B35" />
                <Text style={styles.referrerText}>
                  You were referred by{' '}
                  <Text style={styles.referrerName}>{referralData.referrer_name}</Text>
                </Text>
              </View>
            </View>
          )}

          {/* Share Button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareReferral}
          >
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.shareButtonGradient}
            >
              <Ionicons name="share-social" size={24} color="white" />
              <Text style={styles.shareButtonText}>Share Referral Code</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Referrals List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Referrals</Text>
            {referrals.map((referral) => (
              <View key={referral.id} style={styles.referralItem}>
                <View style={styles.referralInfo}>
                  <Text style={styles.referralName}>{referral.name}</Text>
                  <Text style={styles.referralPhone}>{referral.phone}</Text>
                  <Text style={styles.referralDate}>{formatDate(referral.date)}</Text>
                </View>
                <View style={styles.referralStatus}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(referral.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(referral.status) }]}>
                      {getStatusText(referral.status)}
                    </Text>
                  </View>
                  <Text style={styles.referralEarnings}>₦{referral.earnings}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* How It Works */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.howItWorksContainer}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Share Your Code</Text>
                  <Text style={styles.stepDescription}>
                    Share your referral code with friends and family
                  </Text>
                </View>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>They Sign Up</Text>
                  <Text style={styles.stepDescription}>
                    Your friends sign up using your referral code
                  </Text>
                </View>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Earn Rewards</Text>
                  <Text style={styles.stepDescription}>
                    Get ₦200 when they complete their first transaction
                  </Text>
                </View>
              </View>
            </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
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
  content: {
    padding: 20,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
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
  referralCodeCard: {
    padding: 20,
  },
  referralCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  referralCodeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  referralCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 2,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  referralCodeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
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
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  shareButton: {
    borderRadius: 12,
    overflow: 'hidden',
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
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  referralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  referralPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  referralDate: {
    fontSize: 12,
    color: '#999',
  },
  referralStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  referralEarnings: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  howItWorksContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
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
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
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
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginLeft: 8,
  },
  withdrawCard: {
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
  withdrawTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  withdrawSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  withdrawInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  withdrawLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  withdrawAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 10,
  },
  withdrawButtonActive: {
    backgroundColor: '#FF6B35',
  },
  withdrawButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
  withdrawButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  withdrawNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  referrerCard: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
  },
  referrerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referrerText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  referrerName: {
    fontWeight: 'bold',
    color: '#FF6B35',
  },
}); 