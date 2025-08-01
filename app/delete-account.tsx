import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { accountDeletionService } from '../lib/services';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password to confirm account deletion.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    setIsDeleting(true);

    try {
      const result = await accountDeletionService.deleteAccount(user.id, password);

      if (result.success) {
        Alert.alert(
          'Account Deleted',
          'Your account has been permanently deleted. Thank you for using NetPay.',
          [
            {
              text: 'OK',
              onPress: async () => {
                await signOut();
                router.replace('/auth/login');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to delete account. Please try again.');
      }
    } catch (error) {
      console.error('Account deletion error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const showFinalConfirmation = () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password to confirm account deletion.');
      return;
    }

    setShowConfirmation(true);
  };

  const cancelDeletion = () => {
    setPassword('');
    setReason('');
    setShowConfirmation(false);
    router.back();
  };

  if (showConfirmation) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FF6B35', '#F7931E']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => setShowConfirmation(false)}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Final Confirmation</Text>
            <View style={{ width: 24 }} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.confirmationContainer}>
            <View style={styles.warningIcon}>
              <Ionicons name="warning" size={80} color="#FF6B35" />
            </View>

            <Text style={styles.confirmationTitle}>⚠️ Final Warning</Text>
            
            <Text style={styles.confirmationText}>
              You are about to permanently delete your NetPay account. This action cannot be undone.
            </Text>

            <View style={styles.warningList}>
              <Text style={styles.warningItem}>• All your transaction history will be lost</Text>
              <Text style={styles.warningItem}>• Your wallet balance will be forfeited</Text>
              <Text style={styles.warningItem}>• All saved payment methods will be removed</Text>
              <Text style={styles.warningItem}>• Your profile and settings will be deleted</Text>
              <Text style={styles.warningItem}>• You will lose access to all NetPay services</Text>
            </View>

            <Text style={styles.confirmationText}>
              If you have any remaining balance, please transfer it to another account before proceeding.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowConfirmation(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.deleteButton, isDeleting && styles.disabledButton]}
                onPress={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Text style={styles.deleteButtonText}>Deleting...</Text>
                ) : (
                  <Text style={styles.deleteButtonText}>Yes, Delete My Account</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B35', '#F7931E']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Delete Account</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.warningIcon}>
              <Ionicons name="trash" size={80} color="#FF6B35" />
            </View>

            <Text style={styles.title}>Delete Your Account</Text>
            
            <Text style={styles.description}>
              This action will permanently delete your NetPay account and all associated data. 
              This process cannot be undone.
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What will be deleted:</Text>
              <View style={styles.list}>
                <Text style={styles.listItem}>• Your profile and personal information</Text>
                <Text style={styles.listItem}>• All transaction history</Text>
                <Text style={styles.listItem}>• Wallet balance and virtual accounts</Text>
                <Text style={styles.listItem}>• Saved payment methods</Text>
                <Text style={styles.listItem}>• Notification preferences</Text>
                <Text style={styles.listItem}>• Biometric login settings</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Password Confirmation</Text>
              <Text style={styles.sectionDescription}>
                Enter your password to confirm account deletion
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reason for Deletion (Optional)</Text>
              <Text style={styles.sectionDescription}>
                Help us improve by telling us why you're leaving
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us why you're deleting your account..."
                placeholderTextColor="#999"
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={cancelDeletion}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.deleteButton, isDeleting && styles.disabledButton]}
                onPress={showFinalConfirmation}
                disabled={isDeleting || !password.trim()}
              >
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  warningIcon: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 24,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  list: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  listItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  deleteButton: {
    backgroundColor: '#FF6B35',
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  confirmationContainer: {
    padding: 20,
    alignItems: 'center',
  },
  confirmationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FF6B35',
  },
  confirmationText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 24,
  },
  warningList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 20,
    width: '100%',
  },
  warningItem: {
    fontSize: 14,
    color: '#FF6B35',
    marginBottom: 8,
    lineHeight: 20,
    fontWeight: '500',
  },
}); 