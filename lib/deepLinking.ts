import { router } from 'expo-router';
import { Linking } from 'react-native';
import { config } from './config';

export interface DeepLinkParams {
  [key: string]: string | undefined;
}

export interface DeepLinkHandler {
  pattern: string;
  handler: (params: DeepLinkParams) => void;
}

class DeepLinkingService {
  private handlers: DeepLinkHandler[] = [];

  constructor() {
    this.setupDefaultHandlers();
  }

  private setupDefaultHandlers() {
    // Email verification deep links
    this.addHandler('verify-email/:token', (params) => {
      router.push(`/auth/email-verification?token=${params.token}`);
    });

    this.addHandler('email-verification/:token', (params) => {
      router.push(`/auth/email-verification?token=${params.token}`);
    });

    // Password reset deep links
    this.addHandler('reset-password/:token', (params) => {
      router.push(`/auth/reset-password?token=${params.token}`);
    });

    this.addHandler('password-reset/:token', (params) => {
      router.push(`/auth/reset-password?token=${params.token}`);
    });

    // Payment deep links
    this.addHandler('payment/:id', (params) => {
      router.push(`/transaction-details?id=${params.id}`);
    });

    // Transfer deep links
    this.addHandler('transfer/:id', (params) => {
      router.push(`/transaction-details?id=${params.id}&type=transfer`);
    });

    // Referral deep links
    this.addHandler('referral/:code', (params) => {
      router.push(`/referral?code=${params.code}`);
    });

    // Airtime purchase deep links
    this.addHandler('airtime/:network', (params) => {
      router.push(`/airtime-purchase?network=${params.network}`);
    });

    // Data purchase deep links
    this.addHandler('data/:network', (params) => {
      router.push(`/data-purchase?network=${params.network}`);
    });

    // Cable TV deep links
    this.addHandler('cable/:provider', (params) => {
      router.push(`/cable-tv-purchase?provider=${params.provider}`);
    });

    // Electricity deep links
    this.addHandler('electricity/:provider', (params) => {
      router.push(`/electricity-purchase?provider=${params.provider}`);
    });

    // Betting deep links
    this.addHandler('betting/:provider', (params) => {
      router.push(`/betting-purchase?provider=${params.provider}`);
    });

    // Education deep links
    this.addHandler('education/:exam', (params) => {
      router.push(`/education-purchase?exam=${params.exam}`);
    });

    // Profile deep links
    this.addHandler('profile', () => {
      router.push('/(tabs)/profile');
    });

    // Transactions deep links
    this.addHandler('transactions', () => {
      router.push('/(tabs)/transactions');
    });

    // Dashboard deep links
    this.addHandler('dashboard', () => {
      router.push('/(tabs)');
    });

    // Add money deep links
    this.addHandler('add-money', () => {
      router.push('/add-money');
    });

    // Transfer deep links
    this.addHandler('transfer', () => {
      router.push('/transfer');
    });

    // Earnings deep links
    this.addHandler('earnings', () => {
      router.push('/earnings');
    });

    // Referral deep links
    this.addHandler('referral', () => {
      router.push('/referral');
    });

    // Support deep links
    this.addHandler('support', () => {
      router.push('/help-support');
    });

    // Contact deep links
    this.addHandler('contact', () => {
      router.push('/contact-us');
    });

    // About deep links
    this.addHandler('about', () => {
      router.push('/about-netpay');
    });

    // Terms deep links
    this.addHandler('terms', () => {
      router.push('/terms-conditions');
    });

    // Privacy deep links
    this.addHandler('privacy', () => {
      router.push('/privacy-policy');
    });
  }

  addHandler(pattern: string, handler: (params: DeepLinkParams) => void) {
    this.handlers.push({ pattern, handler });
  }

  private matchPattern(url: string, pattern: string): DeepLinkParams | null {
    const urlParts = url.split('/').filter(Boolean);
    const patternParts = pattern.split('/').filter(Boolean);

    if (urlParts.length !== patternParts.length) {
      return null;
    }

    const params: DeepLinkParams = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const urlPart = urlParts[i];

      if (patternPart.startsWith(':')) {
        // This is a parameter
        const paramName = patternPart.slice(1);
        params[paramName] = urlPart;
      } else if (patternPart !== urlPart) {
        // This is a literal part that doesn't match
        return null;
      }
    }

    return params;
  }

  handleDeepLink(url: string): boolean {
    console.log('Handling deep link:', url);

    // Remove scheme and domain from URL
    let path = url;
    
    // Handle netpay:// scheme
    if (url.startsWith('netpay://')) {
      path = url.replace('netpay://', '');
    }
    
    // Handle https:// scheme
    if (url.startsWith('https://')) {
      const urlObj = new URL(url);
      path = urlObj.pathname;
    }

    // Remove leading slash
    if (path.startsWith('/')) {
      path = path.slice(1);
    }

    // Try to match with handlers
    for (const { pattern, handler } of this.handlers) {
      const params = this.matchPattern(path, pattern);
      if (params) {
        console.log('Matched pattern:', pattern, 'with params:', params);
        handler(params);
        return true;
      }
    }

    console.log('No handler found for deep link:', path);
    return false;
  }

  // Generate deep links for different features
  generateDeepLink(type: string, params?: Record<string, string>): string {
    const baseUrl = config.deepLinking.baseUrl;
    
    switch (type) {
      case 'verify-email':
        return `${baseUrl}/verify-email/${params?.token || ''}`;
      case 'email-verification':
        return `${baseUrl}/email-verification/${params?.token || ''}`;
      case 'reset-password':
        return `${baseUrl}/reset-password/${params?.token || ''}`;
      case 'password-reset':
        return `${baseUrl}/password-reset/${params?.token || ''}`;
      case 'payment':
        return `${baseUrl}/payment/${params?.id || ''}`;
      case 'transfer':
        return `${baseUrl}/transfer/${params?.id || ''}`;
      case 'referral':
        return `${baseUrl}/referral/${params?.code || ''}`;
      case 'airtime':
        return `${baseUrl}/airtime/${params?.network || ''}`;
      case 'data':
        return `${baseUrl}/data/${params?.network || ''}`;
      case 'cable':
        return `${baseUrl}/cable/${params?.provider || ''}`;
      case 'electricity':
        return `${baseUrl}/electricity/${params?.provider || ''}`;
      case 'betting':
        return `${baseUrl}/betting/${params?.provider || ''}`;
      case 'education':
        return `${baseUrl}/education/${params?.exam || ''}`;
      case 'profile':
        return `${baseUrl}/profile`;
      case 'transactions':
        return `${baseUrl}/transactions`;
      case 'dashboard':
        return `${baseUrl}/dashboard`;
      case 'add-money':
        return `${baseUrl}/add-money`;
      case 'transfer':
        return `${baseUrl}/transfer`;
      case 'earnings':
        return `${baseUrl}/earnings`;
      case 'referral':
        return `${baseUrl}/referral`;
      case 'support':
        return `${baseUrl}/support`;
      case 'contact':
        return `${baseUrl}/contact`;
      case 'about':
        return `${baseUrl}/about`;
      case 'terms':
        return `${baseUrl}/terms`;
      case 'privacy':
        return `${baseUrl}/privacy`;
      default:
        return baseUrl;
    }
  }

  // Generate app scheme deep links
  generateAppSchemeLink(type: string, params?: Record<string, string>): string {
    const scheme = `${config.deepLinking.scheme}://`;
    
    switch (type) {
      case 'verify-email':
        return `${scheme}verify-email/${params?.token || ''}`;
      case 'email-verification':
        return `${scheme}email-verification/${params?.token || ''}`;
      case 'reset-password':
        return `${scheme}reset-password/${params?.token || ''}`;
      case 'password-reset':
        return `${scheme}password-reset/${params?.token || ''}`;
      case 'payment':
        return `${scheme}payment/${params?.id || ''}`;
      case 'transfer':
        return `${scheme}transfer/${params?.id || ''}`;
      case 'referral':
        return `${scheme}referral/${params?.code || ''}`;
      case 'airtime':
        return `${scheme}airtime/${params?.network || ''}`;
      case 'data':
        return `${scheme}data/${params?.network || ''}`;
      case 'cable':
        return `${scheme}cable/${params?.provider || ''}`;
      case 'electricity':
        return `${scheme}electricity/${params?.provider || ''}`;
      case 'betting':
        return `${scheme}betting/${params?.provider || ''}`;
      case 'education':
        return `${scheme}education/${params?.exam || ''}`;
      case 'profile':
        return `${scheme}profile`;
      case 'transactions':
        return `${scheme}transactions`;
      case 'dashboard':
        return `${scheme}dashboard`;
      case 'add-money':
        return `${scheme}add-money`;
      case 'transfer':
        return `${scheme}transfer`;
      case 'earnings':
        return `${scheme}earnings`;
      case 'referral':
        return `${scheme}referral`;
      case 'support':
        return `${scheme}support`;
      case 'contact':
        return `${scheme}contact`;
      case 'about':
        return `${scheme}about`;
      case 'terms':
        return `${scheme}terms`;
      case 'privacy':
        return `${scheme}privacy`;
      default:
        return scheme;
    }
  }
}

export const deepLinkingService = new DeepLinkingService();

// Initialize deep linking
export const initializeDeepLinking = () => {
  // Handle initial URL if app was opened via deep link
  Linking.getInitialURL().then((url) => {
    if (url) {
      deepLinkingService.handleDeepLink(url);
    }
  });

  // Handle deep links when app is already running
  const handleDeepLink = (event: { url: string }) => {
    deepLinkingService.handleDeepLink(event.url);
  };

  Linking.addEventListener('url', handleDeepLink);

  // Return cleanup function
  return () => {
    Linking.removeAllListeners('url');
  };
}; 