import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { db } from '../../lib/supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, biometricAvailable, biometricEnabled, enableBiometrics, disableBiometrics } = useAuth();
  const { profile, loading } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: true,
  });
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  useEffect(() => {
    if (user && profile) {
      fetchNotificationPreferences();
    }
  }, [user, profile]);

  const fetchNotificationPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await db.getNotificationPreferences(user.id);
      if (!error && data) {
        setNotificationPreferences({
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
          sms_notifications: data.sms_notifications,
        });
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  };

  const handleNotificationToggle = async (type: 'email' | 'push' | 'sms') => {
    if (!user) return;

    const newPreferences = {
      ...notificationPreferences,
      [`${type}_notifications`]: !notificationPreferences[`${type}_notifications` as keyof typeof notificationPreferences],
    };

    setNotificationPreferences(newPreferences);

    try {
      await db.updateNotificationPreferences(user.id, newPreferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      // Revert the change if update failed
      setNotificationPreferences(notificationPreferences);
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (!user) return;

    if (enabled) {
      // Enable biometrics
      if (!biometricAvailable) {
        Alert.alert(
          'Face ID Not Available',
          'Face ID is not available on this device.',
          [{ text: 'OK' }]
        );
        return;
      }

      try {
        const { success, error } = await enableBiometrics();
        
        if (success) {
          Alert.alert(
            'Face ID Enabled',
            'Face ID has been enabled for NetPay login.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Authentication Failed',
            error || 'Face ID authentication failed. Please try again.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        Alert.alert(
          'Error',
          'An error occurred while enabling Face ID.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // Disable biometrics
      Alert.alert(
        'Disable Face ID',
        'Are you sure you want to disable Face ID login?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              try {
                const { success, error } = await disableBiometrics();
                if (success) {
                  Alert.alert(
                    'Face ID Disabled',
                    'Face ID login has been disabled.',
                    [{ text: 'OK' }]
                  );
                } else {
                  Alert.alert(
                    'Error',
                    error || 'Failed to disable Face ID.',
                    [{ text: 'OK' }]
                  );
                }
              } catch (error) {
                Alert.alert(
                  'Error',
                  'An error occurred while disabling Face ID.',
                  [{ text: 'OK' }]
                );
              }
            },
          },
        ]
      );
    }
  };

  const getUserName = () => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getUserEmail = () => {
    return user?.email || '';
  };

  const getUserPhone = () => {
    return profile?.phone_number || user?.user_metadata?.phone_number || '';
  };

  const getUserInitials = () => {
    const name = getUserName();
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getMemberSince = () => {
    if (profile?.created_at) {
      const date = new Date(profile.created_at);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    }
    return 'Recently';
  };

  const isAdminUser = () => {
    // Check if user has admin role in metadata or email contains admin
    return user?.user_metadata?.role === 'admin' || 
           user?.email?.includes('admin') ||
           user?.email?.includes('@netpay.com');
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person', label: 'Edit Profile', action: 'editProfile' },
        { icon: 'notifications', label: 'Notifications', action: 'notifications' },
        { icon: 'shield-checkmark', label: 'Security', action: 'security' },
        { icon: 'people', label: 'Referral', action: 'referral' },
        { icon: 'cash', label: 'Earnings', action: 'earnings' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle', label: 'Contact Us', action: 'contact' },
        { icon: 'document-text', label: 'Terms & Conditions', action: 'terms' },
        { icon: 'shield', label: 'Privacy Policy', action: 'privacy' },
      ],
    },
    {
      title: 'App',
      items: [
        { icon: 'information-circle', label: 'About NetPay', action: 'about' },
        { icon: 'trash', label: 'Delete Account', action: 'deleteAccount' },
        { icon: 'log-out', label: 'Sign Out', action: 'signOut' },
      ],
    },
  ];

  const handleAction = async (action: string) => {
    switch (action) {
      case 'signOut':
        Alert.alert(
          'Sign Out',
          'Are you sure you want to sign out?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Sign Out', 
              style: 'destructive',
              onPress: async () => {
                try {
                  await signOut();
                  router.replace('/auth/login');
                } catch (error) {
                  console.error('Error signing out:', error);
                }
              }
            },
          ]
        );
        break;
      case 'deleteAccount':
        router.push('/delete-account');
        break;
      case 'editProfile':
        router.push('/personal-information');
        break;
      case 'security':
        router.push('/security-settings');
        break;
      case 'referral':
        router.push('/referral');
        break;
              case 'earnings':
          router.push('/earnings');
          break;
        case 'notifications':
          router.push('/notification-preferences');
          break;
      case 'help':
        router.push('/help-support');
        break;
      case 'contact':
        router.push('/contact-us');
        break;
      case 'terms':
        router.push('/terms-conditions');
        break;
      case 'privacy':
        router.push('/privacy-policy');
        break;
      case 'about':
        router.push('/about-netpay');
        break;
      case 'admin':
        if (isAdminUser()) {
          router.push('/dashboard');
        } else {
          Alert.alert('Access Denied', 'You do not have admin privileges.');
        }
        break;
      default:
        Alert.alert('Action', `${action} functionality would be implemented here`);
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
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>Manage your account</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <Animated.View style={[styles.userCard, cardAnimatedStyle]}>
          <LinearGradient
            colors={['#FF6B35', '#F7931E']}
            style={styles.userCardGradient}
          >
            <View style={styles.userAvatar}>
              {loading ? (
                <Ionicons name="refresh" size={40} color="white" />
              ) : (
                <Text style={styles.userInitials}>{getUserInitials()}</Text>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {loading ? 'Loading...' : getUserName()}
              </Text>
              <Text style={styles.userEmail}>{getUserEmail()}</Text>
              <Text style={styles.userPhone}>{getUserPhone()}</Text>
              <Text style={styles.memberSince}>Member since {getMemberSince()}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Settings</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons 
                  name={biometricEnabled ? 'scan' : 'finger-print'} 
                  size={24} 
                  color="#FF6B35" 
                />
                <Text style={styles.settingLabel}>
                  {biometricEnabled ? 'Face ID' : 'Touch ID'} Login
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: '#e0e0e0', true: '#FF6B35' }}
                thumbColor={biometricEnabled ? '#fff' : '#f4f3f4'}
                disabled={!biometricAvailable}
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={24} color="#FF6B35" />
                <Text style={styles.settingLabel}>Push Notifications</Text>
              </View>
              <Switch
                value={notificationPreferences.push_notifications}
                onValueChange={() => handleNotificationToggle('push')}
                trackColor={{ false: '#e0e0e0', true: '#FF6B35' }}
                thumbColor={notificationPreferences.push_notifications ? '#fff' : '#f4f3f4'}
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon" size={24} color="#FF6B35" />
                <Text style={styles.settingLabel}>Dark Mode</Text>
              </View>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: '#e0e0e0', true: '#FF6B35' }}
                thumbColor={darkModeEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Admin Dashboard Section - Only show for admin users */}
        {user && isAdminUser() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Administration</Text>
            <View style={styles.sectionCard}>
              <TouchableOpacity
                style={styles.sectionItem}
                onPress={() => handleAction('admin')}
              >
                <View style={styles.sectionItemInfo}>
                  <Ionicons name="settings" size={24} color="#FF6B35" />
                  <Text style={styles.sectionItemLabel}>Admin Dashboard</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.sectionItem,
                    itemIndex === section.items.length - 1 && styles.lastItem,
                  ]}
                  onPress={() => handleAction(item.action)}
                >
                  <View style={styles.sectionItemInfo}>
                    <Ionicons name={item.icon as any} size={24} color="#FF6B35" />
                    <Text style={styles.sectionItemLabel}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>NetPay v1.0.0</Text>
        </View>
      </ScrollView>
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
  editButton: {
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
  userCard: {
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
  userCardGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingsCard: {
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  sectionItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionItemLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
}); 