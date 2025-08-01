import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

export default function AboutNetPayScreen() {
  const router = useRouter();
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const handleWebsite = () => {
    Linking.openURL('https://netpay.com');
  };

  const handleSocialMedia = (platform: string) => {
    const urls = {
      twitter: 'https://twitter.com/netpay',
      facebook: 'https://facebook.com/netpay',
      instagram: 'https://instagram.com/netpay',
      linkedin: 'https://linkedin.com/company/netpay',
    };
    Linking.openURL(urls[platform as keyof typeof urls]);
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
        <Text style={styles.headerTitle}>About NetPay</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Company Info */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="card" size={48} color="#FF6B35" />
            </View>
            <Text style={styles.appName}>NetPay</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </View>
        </Animated.View>

        {/* Mission Statement */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <View style={styles.sectionCard}>
            <Text style={styles.missionText}>
              To provide secure, fast, and convenient digital payment solutions that empower individuals and businesses to manage their finances with ease. We believe in making financial services accessible to everyone.
            </Text>
          </View>
        </Animated.View>

        {/* Features */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Ionicons name="swap-horizontal" size={24} color="#FF6B35" />
              <Text style={styles.featureTitle}>Money Transfer</Text>
              <Text style={styles.featureDescription}>Send and receive money instantly</Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="card" size={24} color="#FF6B35" />
              <Text style={styles.featureTitle}>Bill Payments</Text>
              <Text style={styles.featureDescription}>Pay all your bills in one place</Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="phone-portrait" size={24} color="#FF6B35" />
              <Text style={styles.featureTitle}>Airtime & Data</Text>
              <Text style={styles.featureDescription}>Buy airtime and data bundles</Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="shield-checkmark" size={24} color="#FF6B35" />
              <Text style={styles.featureTitle}>Secure</Text>
              <Text style={styles.featureDescription}>Bank-level security protection</Text>
            </View>
          </View>
        </Animated.View>

        {/* Company Stats */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Our Impact</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>1M+</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>₦50B+</Text>
              <Text style={styles.statLabel}>Transactions Processed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Customer Support</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>99.9%</Text>
              <Text style={styles.statLabel}>Uptime</Text>
            </View>
          </View>
        </Animated.View>

        {/* Team */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Our Team</Text>
          <View style={styles.sectionCard}>
            <Text style={styles.teamText}>
              NetPay is built by a team of passionate professionals dedicated to revolutionizing digital payments in Nigeria. Our diverse team brings together expertise in fintech, security, and user experience design.
            </Text>
          </View>
        </Animated.View>

        {/* Contact */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          <View style={styles.contactCard}>
            <TouchableOpacity style={styles.contactItem} onPress={handleWebsite}>
              <Ionicons name="globe" size={20} color="#FF6B35" />
              <Text style={styles.contactText}>www.netpay.com</Text>
              <Ionicons name="open" size={16} color="#FF6B35" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactItem}>
              <Ionicons name="mail" size={20} color="#FF6B35" />
              <Text style={styles.contactText}>hello@netpay.com</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactItem}>
              <Ionicons name="call" size={20} color="#FF6B35" />
              <Text style={styles.contactText}>+234 800 123 4567</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactItem}>
              <Ionicons name="location" size={20} color="#FF6B35" />
              <Text style={styles.contactText}>Lagos, Nigeria</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Social Media */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialGrid}>
            <TouchableOpacity
              style={styles.socialCard}
              onPress={() => handleSocialMedia('twitter')}
            >
              <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
              <Text style={styles.socialText}>Twitter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.socialCard}
              onPress={() => handleSocialMedia('facebook')}
            >
              <Ionicons name="logo-facebook" size={24} color="#4267B2" />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.socialCard}
              onPress={() => handleSocialMedia('instagram')}
            >
              <Ionicons name="logo-instagram" size={24} color="#E4405F" />
              <Text style={styles.socialText}>Instagram</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.socialCard}
              onPress={() => handleSocialMedia('linkedin')}
            >
              <Ionicons name="logo-linkedin" size={24} color="#0077B5" />
              <Text style={styles.socialText}>LinkedIn</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Legal */}
        <Animated.View style={[styles.section, cardAnimatedStyle]}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.legalCard}>
            <TouchableOpacity
              style={styles.legalItem}
              onPress={() => router.push('/terms-conditions')}
            >
              <Text style={styles.legalText}>Terms & Conditions</Text>
              <Ionicons name="chevron-forward" size={16} color="#FF6B35" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.legalItem}
              onPress={() => router.push('/privacy-policy')}
            >
              <Text style={styles.legalText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={16} color="#FF6B35" />
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
  logoContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
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
  missionText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    textAlign: 'justify',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
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
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
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
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  teamText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    textAlign: 'justify',
  },
  contactCard: {
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  socialCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
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
  socialText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  legalCard: {
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
  legalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  legalText: {
    fontSize: 16,
    color: '#333',
  },
}); 