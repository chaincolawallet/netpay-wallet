import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { testSupabaseConnection, testAuth } from '../lib/supabase-test';

export default function SupabaseTest() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    connection?: any;
    auth?: any;
  }>({});

  const testConnection = async () => {
    setLoading(true);
    try {
      const result = await testSupabaseConnection();
      setResults(prev => ({ ...prev, connection: result }));
      
      if (result.success) {
        Alert.alert('Success', 'Supabase connection is working!');
      } else {
        Alert.alert('Error', `Connection failed: ${result.error?.message}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Connection test failed');
    } finally {
      setLoading(false);
    }
  };

  const testAuthentication = async () => {
    setLoading(true);
    try {
      const result = await testAuth();
      setResults(prev => ({ ...prev, auth: result }));
      
      if (result.success) {
        Alert.alert('Success', 'Supabase authentication is working!');
      } else {
        Alert.alert('Error', `Auth test failed: ${result.error?.message}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Authentication test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Supabase Integration Test</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={testConnection}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Testing...' : 'Test Connection'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={testAuthentication}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Testing...' : 'Test Authentication'}
        </Text>
      </TouchableOpacity>
      
      {results.connection && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>Connection Test:</Text>
          <Text style={[
            styles.resultText, 
            { color: results.connection.success ? '#4CAF50' : '#F44336' }
          ]}>
            {results.connection.success ? '✅ Success' : '❌ Failed'}
          </Text>
        </View>
      )}
      
      {results.auth && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>Auth Test:</Text>
          <Text style={[
            styles.resultText, 
            { color: results.auth.success ? '#4CAF50' : '#F44336' }
          ]}>
            {results.auth.success ? '✅ Success' : '❌ Failed'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  result: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 16,
  },
}); 