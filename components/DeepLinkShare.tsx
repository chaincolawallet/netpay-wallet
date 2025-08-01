import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Share, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { deepLinkingService } from '../lib/deepLinking';

interface DeepLinkShareProps {
  type: string;
  params?: Record<string, string>;
  title?: string;
  message?: string;
  showAppScheme?: boolean;
}

export default function DeepLinkShare({ 
  type, 
  params = {}, 
  title = 'Share NetPay',
  message = 'Check out this feature on NetPay!',
  showAppScheme = false 
}: DeepLinkShareProps) {
  const handleShare = async () => {
    try {
      const webUrl = deepLinkingService.generateDeepLink(type, params);
      const appUrl = deepLinkingService.generateAppSchemeLink(type, params);
      
      const shareContent = showAppScheme 
        ? `${message}\n\nWeb: ${webUrl}\nApp: ${appUrl}`
        : `${message}\n\n${webUrl}`;

      const result = await Share.share({
        title,
        message: shareContent,
        url: webUrl,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share link');
      console.error('Share error:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
      <Ionicons name="share-outline" size={20} color="#FF6B35" />
      <Text style={styles.shareText}>Share</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  shareText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
}); 