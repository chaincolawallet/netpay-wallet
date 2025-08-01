import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
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

export default function ContactUsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'normal',
  });

  const contactMethods = [
    {
      icon: 'call',
      title: 'Phone Support',
      description: 'Call us for immediate assistance',
      action: 'Call',
      value: '+234 800 NETPAY',
      onPress: () => handleCallSupport(),
    },
    {
      icon: 'mail',
      title: 'Email Support',
      description: 'Send us an email',
      action: 'Email',
      value: 'support@netpay.com',
      onPress: () => handleEmailSupport(),
    },
    {
      icon: 'chatbubbles',
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: 'Chat',
      value: 'Available 24/7',
      onPress: () => handleLiveChat(),
    },
    {
      icon: 'location',
      title: 'Office Address',
      description: 'Visit our office',
      action: 'Directions',
      value: 'Lagos, Nigeria',
      onPress: () => handleGetDirections(),
    },
  ];

  const handleCallSupport = () => {
    Alert.alert(
      'Call Support',
      'Would you like to call our support team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            Linking.openURL('tel:+234800NETPAY');
          }
        },
      ]
    );
  };

  const handleEmailSupport = () => {
    Alert.alert(
      'Email Support',
      'Would you like to send an email to our support team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Email', 
          onPress: () => {
            Linking.openURL('mailto:support@netpay.com?subject=NetPay Support Request');
          }
        },
      ]
    );
  };

  const handleLiveChat = () => {
    Alert.alert(
      'Live Chat',
      'Live chat feature will be available soon. For now, please use phone or email support.',
      [
        { text: 'OK' },
      ]
    );
  };

  const handleGetDirections = () => {
    Alert.alert(
      'Get Directions',
      'Would you like to get directions to our office?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Directions', 
          onPress: () => {
            // In a real app, this would open maps with the office location
            Alert.alert('Directions', 'Office location: Lagos, Nigeria');
          }
        },
      ]
    );
  };

  const handleSubmitForm = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please log in to submit a support request');
      return;
    }

    setLoading(true);
    try {
      // Create support ticket in database
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: `Support Request: ${contactForm.subject}`,
          message: contactForm.message,
          type: 'support',
          read: false,
        });

      if (error) {
        throw error;
      }

      Alert.alert(
        'Success',
        'Your support request has been submitted. We will get back to you within 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => {
              setContactForm({ subject: '', message: '', priority: 'normal' });
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting support request:', error);
      Alert.alert('Error', 'Failed to submit support request. Please try again.');
    } finally {
      setLoading(false);
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

  const renderContactMethod = (method: any) => (
    <TouchableOpacity
      key={method.title}
      style={styles.contactMethod}
      onPress={method.onPress}
    >
      <View style={styles.contactMethodInfo}>
        <View style={styles.contactIcon}>
          <Ionicons name={method.icon as any} size={24} color="#FF6B35" />
        </View>
        <View style={styles.contactText}>
          <Text style={styles.contactTitle}>{method.title}</Text>
          <Text style={styles.contactDescription}>{method.description}</Text>
          <Text style={styles.contactValue}>{method.value}</Text>
        </View>
      </View>
      <View style={styles.contactAction}>
        <Text style={styles.contactActionText}>{method.action}</Text>
        <Ionicons name="chevron-forward" size={16} color="#FF6B35" />
      </View>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Contact Methods */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          <View style={styles.contactMethods}>
            {contactMethods.map(renderContactMethod)}
          </View>
        </Animated.View>

        {/* Support Form */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          <View style={styles.formCard}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Subject *</Text>
              <TextInput
                style={styles.formInput}
                value={contactForm.subject}
                onChangeText={(text) => setContactForm({ ...contactForm, subject: text })}
                placeholder="What can we help you with?"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Message *</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={contactForm.message}
                onChangeText={(text) => setContactForm({ ...contactForm, message: text })}
                placeholder="Please describe your issue or question..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmitForm}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Sending...' : 'Send Message'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* FAQ Section */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqCard}>
            <TouchableOpacity style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How do I reset my PIN?</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How do I change my password?</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How do I add money to my wallet?</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.faqItem}>
              <Text style={styles.faqQuestion}>How do I transfer money?</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
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
  placeholderButton: {
    width: 40,
    height: 40,
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
  contactMethods: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  contactMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
  },
  contactAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactActionText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
    marginRight: 5,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  formField: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  faqCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqQuestion: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
}); 