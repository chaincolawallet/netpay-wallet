import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
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

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const router = useRouter();
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 1000 });
  }, []);

  const billServices = [
    {
      id: '1',
      title: 'Airtime',
      subtitle: 'Buy airtime for all networks',
      icon: 'phone-portrait',
      color: '#FF6B35',
      bgColor: '#FF6B35',
      route: 'airtime-purchase',
    },
    {
      id: '2',
      title: 'Data',
      subtitle: 'Buy data bundles',
      icon: 'wifi',
      color: '#2196F3',
      bgColor: '#2196F3',
      route: 'data-purchase',
    },
    {
      id: '3',
      title: 'Electricity',
      subtitle: 'Pay electricity bills',
      icon: 'flash',
      color: '#FF9800',
      bgColor: '#FF9800',
      route: 'electricity-purchase',
    },
    {
      id: '4',
      title: 'Cable TV',
      subtitle: 'Pay cable TV bills',
      icon: 'tv',
      color: '#9C27B0',
      bgColor: '#9C27B0',
      route: 'cable-tv-purchase',
    },
    {
      id: '5',
      title: 'Education',
      subtitle: 'Pay school fees',
      icon: 'school',
      color: '#4CAF50',
      bgColor: '#4CAF50',
      route: 'education-purchase',
    },
    {
      id: '6',
      title: 'Betting',
      subtitle: 'Fund betting accounts',
      icon: 'trophy',
      color: '#E91E63',
      bgColor: '#E91E63',
      route: 'betting-purchase',
    },
  ];



  const handleServicePress = (service: any) => {
    if (service.route) {
      router.push(service.route as any);
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
            <Text style={styles.title}>Pay Bills</Text>
            <Text style={styles.subtitle}>Choose a service to pay your bills</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Bill Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Payments</Text>
          <Animated.View style={[styles.billServicesGrid, cardAnimatedStyle]}>
            {billServices.map((service) => (
              <TouchableOpacity 
                key={service.id} 
                style={styles.billServiceItem}
                onPress={() => handleServicePress(service)}
              >
                <LinearGradient
                  colors={[service.bgColor, service.bgColor + 'CC']}
                  style={styles.billServiceGradient}
                >
                  <View style={styles.billServiceContent}>
                    <View style={styles.billServiceIcon}>
                      <Ionicons name={service.icon as any} size={32} color="white" />
                    </View>
                    <View style={styles.billServiceText}>
                      <Text style={styles.billServiceTitle}>{service.title}</Text>
                      <Text style={styles.billServiceSubtitle}>{service.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="white" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </Animated.View>
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
  searchButton: {
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  billServicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  billServiceItem: {
    width: '48%',
    height: 85,
    borderRadius: 8,
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
  billServiceGradient: {
    padding: 10,
    height: '100%',
  },
  billServiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billServiceIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  billServiceText: {
    flex: 1,
  },
  billServiceTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 1,
  },
  billServiceSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
