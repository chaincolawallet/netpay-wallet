import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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

export default function AdminDashboardScreen() {
  const router = useRouter();
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const [stats] = useState({
    totalUsers: 15420,
    activeUsers: 12850,
    totalTransactions: 45678,
    revenue: 2345678,
    pendingApprovals: 23,
    systemAlerts: 5,
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from admin panel?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => router.replace('/auth/login')
        },
      ]
    );
  };

  const handleManageUsers = () => {
    Alert.alert('Manage Users', 'User management feature coming soon');
  };

  const handleViewTransactions = () => {
    Alert.alert('View Transactions', 'Transaction monitoring feature coming soon');
  };

  const handleSystemSettings = () => {
    Alert.alert('System Settings', 'System configuration feature coming soon');
  };

  const handleViewAlerts = () => {
    Alert.alert('System Alerts', 'Alert monitoring feature coming soon');
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

  const renderStatCard = (title: string, value: string, icon: string, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const renderActionCard = (title: string, description: string, icon: string, onPress: () => void) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon as any} size={24} color="#FF6B35" />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2d2d2d']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>System Overview</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <Animated.View style={[styles.welcomeCard, cardAnimatedStyle]}>
          <View style={styles.welcomeContent}>
            <Ionicons name="shield-checkmark" size={40} color="#FF6B35" />
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>Welcome, Administrator</Text>
              <Text style={styles.welcomeSubtitle}>NetPay System Control Panel</Text>
            </View>
          </View>
        </Animated.View>

        {/* Statistics */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>System Statistics</Text>
          <View style={styles.statsGrid}>
            {renderStatCard('Total Users', stats.totalUsers.toLocaleString(), 'people', '#4CAF50')}
            {renderStatCard('Active Users', stats.activeUsers.toLocaleString(), 'person', '#2196F3')}
            {renderStatCard('Transactions', stats.totalTransactions.toLocaleString(), 'card', '#FF9800')}
            {renderStatCard('Revenue', `₦${stats.revenue.toLocaleString()}`, 'cash', '#9C27B0')}
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            {renderActionCard(
              'Manage Users',
              'View and manage user accounts',
              'people',
              handleManageUsers
            )}
            {renderActionCard(
              'View Transactions',
              'Monitor all system transactions',
              'card',
              handleViewTransactions
            )}
            {renderActionCard(
              'System Settings',
              'Configure system parameters',
              'settings',
              handleSystemSettings
            )}
            {renderActionCard(
              'System Alerts',
              `View ${stats.systemAlerts} active alerts`,
              'warning',
              handleViewAlerts
            )}
          </View>
        </Animated.View>

        {/* Alerts Section */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>System Alerts</Text>
          <View style={styles.alertsContainer}>
            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Ionicons name="warning" size={20} color="#FF9800" />
                <Text style={styles.alertTitle}>Pending Approvals</Text>
              </View>
              <Text style={styles.alertValue}>{stats.pendingApprovals} items</Text>
              <Text style={styles.alertDescription}>
                User registrations and transactions awaiting approval
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* System Status */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>System Status</Text>
          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <View style={styles.statusIndicator}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>Database</Text>
                <Text style={styles.statusValue}>Online</Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <View style={styles.statusIndicator}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>API Services</Text>
                <Text style={styles.statusValue}>Online</Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <View style={styles.statusIndicator}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>Payment Gateway</Text>
                <Text style={styles.statusValue}>Online</Text>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  welcomeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    marginLeft: 15,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statTitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  actionsContainer: {
    paddingHorizontal: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  alertsContainer: {
    paddingHorizontal: 20,
  },
  alertCard: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 12,
    padding: 15,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
    marginLeft: 8,
  },
  alertValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 5,
  },
  alertDescription: {
    fontSize: 12,
    color: 'rgba(255, 152, 0, 0.8)',
  },
  statusContainer: {
    paddingHorizontal: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  statusIndicator: {
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
}); 