import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
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

export default function SecuritySettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSecuritySettings();
    }
  }, [user]);

  const fetchSecuritySettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // In a real app, you would fetch security settings from the database
      // For now, we'll use default settings
      setBiometricEnabled(false);
    } catch (error) {
      console.error('Error fetching security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricToggle = (enabled: boolean) => {
    setBiometricEnabled(enabled);
    Alert.alert(
      'Biometric Login',
      `Biometric login ${enabled ? 'enabled' : 'disabled'}`,
      [{ text: 'OK' }]
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'This will redirect you to the password change screen',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => router.push('/change-password') },
      ]
    );
  };

  const handleChangePin = () => {
    Alert.alert(
      'Change PIN',
      'This will redirect you to the PIN change screen',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => router.push('/change-pin') },
      ]
    );
  };



  const securityOptions = [
    {
      icon: 'key',
      title: 'Change Password',
      description: 'Update your login password',
      action: handleChangePassword,
      color: '#FF6B35',
      showArrow: true,
    },
    {
      icon: 'lock-closed',
      title: 'Change PIN',
      description: 'Update your transaction PIN',
      action: handleChangePin,
      color: '#FF6B35',
      showArrow: true,
    },
  ];

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

  const renderSecurityOption = (option: any) => (
    <TouchableOpacity
      key={option.title}
      style={styles.securityOption}
      onPress={option.action}
    >
      <View style={styles.securityOptionInfo}>
        <View style={styles.securityIcon}>
          <Ionicons name={option.icon as any} size={24} color={option.color} />
        </View>
        <View style={styles.securityText}>
          <Text style={styles.securityTitle}>{option.title}</Text>
          <Text style={styles.securityDescription}>{option.description}</Text>
        </View>
      </View>
      {option.showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      )}
    </TouchableOpacity>
  );

  const renderBiometricOption = () => (
    <View style={styles.biometricOption}>
      <View style={styles.biometricOptionInfo}>
        <View style={styles.biometricIcon}>
          <Ionicons name="finger-print" size={24} color="#FF6B35" />
        </View>
        <View style={styles.biometricText}>
          <Text style={styles.biometricTitle}>Biometric Login</Text>
          <Text style={styles.biometricDescription}>Use fingerprint or face ID to login</Text>
        </View>
      </View>
      <Switch
        value={biometricEnabled}
        onValueChange={handleBiometricToggle}
        trackColor={{ false: '#e0e0e0', true: '#FF6B35' }}
        thumbColor={biometricEnabled ? '#fff' : '#f4f3f4'}
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
        <Text style={styles.headerTitle}>Security Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* PIN Settings */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Transaction PIN</Text>
          <View style={styles.sectionCard}>
            <View style={styles.pinItem}>
              <View style={styles.pinItemInfo}>
                <View style={styles.pinIcon}>
                  <Ionicons name="keypad" size={24} color="#FF6B35" />
                </View>
                <View style={styles.pinText}>
                  <Text style={styles.pinTitle}>Change Transaction PIN</Text>
                  <Text style={styles.pinDescription}>Update your 4-digit transaction PIN</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.pinButton}
                onPress={handleChangePin}
              >
                <Ionicons name="chevron-forward" size={20} color="#FF6B35" />
              </TouchableOpacity>
            </View>
            <View style={styles.pinItem}>
              <View style={styles.pinItemInfo}>
                <View style={styles.pinIcon}>
                  <Ionicons name="lock-closed" size={24} color="#FF6B35" />
                </View>
                <View style={styles.pinText}>
                  <Text style={styles.pinTitle}>Change Password</Text>
                  <Text style={styles.pinDescription}>Update your account password</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.pinButton}
                onPress={handleChangePassword}
              >
                <Ionicons name="chevron-forward" size={20} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Authentication Section */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Authentication</Text>
          <View style={styles.sectionCard}>
            {renderBiometricOption()}
            {securityOptions.map(renderSecurityOption)}
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
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  securityItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  securityIconDestructive: {
    backgroundColor: '#fff5f5',
  },
  securityText: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  securityDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  pinItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pinItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pinText: {
    flex: 1,
  },
  pinTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pinDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  pinButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },

  securityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  securityOptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  securityText: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  securityDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  biometricOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  biometricOptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  biometricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  biometricText: {
    flex: 1,
  },
  biometricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  biometricDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
}); 