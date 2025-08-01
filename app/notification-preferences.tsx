import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
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
import { useAuth } from '../contexts/AuthContext';
import { useNotificationService } from '../hooks/useServices';

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { updateNotificationPreferences, getNotificationPreferences, loading } = useNotificationService();
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: true,
  });

  useEffect(() => {
    if (user) {
      fetchNotificationPreferences();
    }
  }, [user]);

  const fetchNotificationPreferences = async () => {
    if (!user) return;

    try {
      const data = await getNotificationPreferences();
      if (data) {
        setNotificationSettings({
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
          sms_notifications: data.sms_notifications,
        });
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  };

  const handleToggleSetting = async (setting: 'email_notifications' | 'push_notifications' | 'sms_notifications') => {
    if (!user) return;

    const newSettings = {
      ...notificationSettings,
      [setting]: !notificationSettings[setting],
    };

    setNotificationSettings(newSettings);

    try {
      await updateNotificationPreferences(newSettings);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      // Revert the change if update failed
      setNotificationSettings(notificationSettings);
    }
  };



  const handleSaveAllSettings = async () => {
    if (!user) return;

    try {
      await updateNotificationPreferences(notificationSettings);
    } catch (error) {
      console.error('Error saving notification preferences:', error);
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

  const renderNotificationItem = (
    icon: string,
    title: string,
    description: string,
    value: boolean,
    onToggle: () => void
  ) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationItemInfo}>
        <View style={styles.notificationIcon}>
          <Ionicons name={icon as any} size={24} color="#FF6B35" />
        </View>
        <View style={styles.notificationText}>
          <Text style={styles.notificationTitle}>{title}</Text>
          <Text style={styles.notificationDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#e0e0e0', true: '#FF6B35' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

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
        <Text style={styles.headerTitle}>Notification Preferences</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* General Notifications */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>General Notifications</Text>
          <View style={styles.sectionCard}>
            {renderNotificationItem(
              'notifications',
              'Push Notifications',
              'Receive notifications on your device',
              notificationSettings.push_notifications,
              () => handleToggleSetting('push_notifications')
            )}
            {renderNotificationItem(
              'email',
              'Email Notifications',
              'Receive notifications via email',
              notificationSettings.email_notifications,
              () => handleToggleSetting('email_notifications')
            )}
            {renderNotificationItem(
              'sms',
              'SMS Notifications',
              'Receive notifications via SMS',
              notificationSettings.sms_notifications,
              () => handleToggleSetting('sms_notifications')
            )}
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
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
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },

}); 