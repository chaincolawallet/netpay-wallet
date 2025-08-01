# NetPay Deep Linking System

## Overview

NetPay supports comprehensive deep linking that allows users to navigate directly to specific features and screens within the app. The system supports both web URLs and custom app schemes.

## Supported URL Formats

### Web URLs (https://www.netpayy.ng)
- `https://www.netpayy.ng/verify-email/{token}` - Email verification with token
- `https://www.netpayy.ng/email-verification/{token}` - Email verification with token
- `https://www.netpayy.ng/reset-password/{token}` - Password reset with token
- `https://www.netpayy.ng/password-reset/{token}` - Password reset with token
- `https://www.netpayy.ng/payment/{id}` - View payment details
- `https://www.netpayy.ng/transfer/{id}` - View transfer details
- `https://www.netpayy.ng/referral/{code}` - Referral with code
- `https://www.netpayy.ng/airtime/{network}` - Airtime purchase for specific network
- `https://www.netpayy.ng/data/{network}` - Data purchase for specific network
- `https://www.netpayy.ng/cable/{provider}` - Cable TV for specific provider
- `https://www.netpayy.ng/electricity/{provider}` - Electricity for specific provider
- `https://www.netpayy.ng/betting/{provider}` - Betting for specific provider
- `https://www.netpayy.ng/education/{exam}` - Education payment for specific exam
- `https://www.netpayy.ng/profile` - User profile
- `https://www.netpayy.ng/transactions` - Transaction history
- `https://www.netpayy.ng/dashboard` - Main dashboard
- `https://www.netpayy.ng/add-money` - Add money screen
- `https://www.netpayy.ng/transfer` - Transfer money
- `https://www.netpayy.ng/earnings` - Earnings page
- `https://www.netpayy.ng/referral` - Referral page
- `https://www.netpayy.ng/support` - Help and support
- `https://www.netpayy.ng/contact` - Contact us
- `https://www.netpayy.ng/about` - About NetPay
- `https://www.netpayy.ng/terms` - Terms and conditions
- `https://www.netpayy.ng/privacy` - Privacy policy

### App Scheme URLs (netpay://)
- `netpay://verify-email/{token}` - Email verification with token
- `netpay://email-verification/{token}` - Email verification with token
- `netpay://reset-password/{token}` - Password reset with token
- `netpay://password-reset/{token}` - Password reset with token
- `netpay://payment/{id}` - View payment details
- `netpay://transfer/{id}` - View transfer details
- `netpay://referral/{code}` - Referral with code
- `netpay://airtime/{network}` - Airtime purchase
- `netpay://data/{network}` - Data purchase
- `netpay://cable/{provider}` - Cable TV
- `netpay://electricity/{provider}` - Electricity
- `netpay://betting/{provider}` - Betting
- `netpay://education/{exam}` - Education payment
- `netpay://profile` - User profile
- `netpay://transactions` - Transaction history
- `netpay://dashboard` - Main dashboard
- `netpay://add-money` - Add money
- `netpay://transfer` - Transfer money
- `netpay://earnings` - Earnings
- `netpay://referral` - Referral
- `netpay://support` - Support
- `netpay://contact` - Contact
- `netpay://about` - About
- `netpay://terms` - Terms
- `netpay://privacy` - Privacy

## Usage Examples

### 1. Email Verification Deep Link
```javascript
import { deepLinkingService } from '../lib/deepLinking';

// Generate email verification URL
const verificationUrl = deepLinkingService.generateDeepLink('verify-email', { token: 'verification_token_123' });
// Result: https://www.netpayy.ng/verify-email/verification_token_123

// Generate app scheme URL
const appVerificationUrl = deepLinkingService.generateAppSchemeLink('verify-email', { token: 'verification_token_123' });
// Result: netpay://verify-email/verification_token_123
```

### 2. Password Reset Deep Link
```javascript
const resetUrl = deepLinkingService.generateDeepLink('reset-password', { token: 'reset_token_456' });
// Result: https://www.netpayy.ng/reset-password/reset_token_456
```

### 3. Share Payment Details
```javascript
// Generate web URL
const webUrl = deepLinkingService.generateDeepLink('payment', { id: 'txn_123' });
// Result: https://www.netpayy.ng/payment/txn_123

// Generate app scheme URL
const appUrl = deepLinkingService.generateAppSchemeLink('payment', { id: 'txn_123' });
// Result: netpay://payment/txn_123
```

### 4. Share Referral Link
```javascript
const referralUrl = deepLinkingService.generateDeepLink('referral', { code: 'USER123' });
// Result: https://www.netpayy.ng/referral/USER123
```

### 5. Share Airtime Purchase
```javascript
const airtimeUrl = deepLinkingService.generateDeepLink('airtime', { network: 'mtn' });
// Result: https://www.netpayy.ng/airtime/mtn
```

### 6. Using the Share Component
```javascript
import DeepLinkShare from '../components/DeepLinkShare';

// In your component
<DeepLinkShare 
  type="referral" 
  params={{ code: 'USER123' }}
  title="Join NetPay"
  message="Use my referral code to get started!"
/>
```

## Implementation Details

### Deep Link Handler
The system automatically handles incoming deep links and routes them to the appropriate screens:

```javascript
// Email verification deep link
netpay://verify-email/TOKEN123 → /auth/email-verification?token=TOKEN123

// Password reset deep link
netpay://reset-password/TOKEN456 → /auth/reset-password?token=TOKEN456

// Payment deep link
netpay://payment/123 → /transaction-details?id=123

// Referral deep link  
netpay://referral/CODE123 → /referral?code=CODE123

// Airtime deep link
netpay://airtime/mtn → /airtime-purchase?network=mtn
```

### URL Pattern Matching
The system uses pattern matching to extract parameters from URLs:

- `verify-email/:token` matches `verify-email/TOKEN123` and extracts `{ token: 'TOKEN123' }`
- `reset-password/:token` matches `reset-password/TOKEN456` and extracts `{ token: 'TOKEN456' }`
- `payment/:id` matches `payment/123` and extracts `{ id: '123' }`
- `referral/:code` matches `referral/ABC123` and extracts `{ code: 'ABC123' }`
- `airtime/:network` matches `airtime/mtn` and extracts `{ network: 'mtn' }`

## Email Verification Flow

### 1. User Signs Up
When a user signs up, they receive an email with a verification link.

### 2. Email Link Format
The verification email contains a link like:
```
https://www.netpayy.ng/verify-email/TOKEN123
```

### 3. Deep Link Handling
When the user clicks the link:
- If the app is installed: Opens the app directly to the email verification screen
- If the app is not installed: Opens the web version or app store

### 4. Automatic Verification
The app automatically:
- Extracts the verification token from the URL
- Calls the Supabase verification API
- Shows success/error message
- Navigates to the next step (PIN setup or biometrics)

## Platform Configuration

### iOS
- Bundle Identifier: `com.netpay.wallet`
- Associated Domains: `applinks:netpayy.ng`, `applinks:www.netpayy.ng`
- Custom URL Scheme: `netpay`

### Android
- Package Name: `com.netpay.wallet`
- Intent Filters configured for both `netpay://` and `https://` schemes
- Auto-verification enabled for web links

### Web
- Favicon and metadata configured
- Static export with proper routing

## Testing Deep Links

### iOS Simulator
```bash
# Test email verification
xcrun simctl openurl booted "netpay://verify-email/TOKEN123"

# Test web URL
xcrun simctl openurl booted "https://www.netpayy.ng/verify-email/TOKEN123"
```

### Android Emulator
```bash
# Test email verification
adb shell am start -W -a android.intent.action.VIEW -d "netpay://verify-email/TOKEN123" com.netpay.wallet

# Test web URL
adb shell am start -W -a android.intent.action.VIEW -d "https://www.netpayy.ng/verify-email/TOKEN123" com.netpay.wallet
```

### Web Browser
Simply navigate to any of the web URLs in a browser to test web deep linking.

## Security Considerations

1. **URL Validation**: All incoming URLs are validated before processing
2. **Parameter Sanitization**: URL parameters are sanitized to prevent injection attacks
3. **Authentication**: Deep links respect the app's authentication state
4. **Error Handling**: Invalid or malformed URLs are gracefully handled
5. **Token Security**: Verification tokens are handled securely and expire appropriately

## Best Practices

1. **Always provide fallbacks**: If a deep link fails, provide alternative navigation
2. **Test thoroughly**: Test deep links on all supported platforms
3. **Document URLs**: Keep this documentation updated as new features are added
4. **Monitor usage**: Track which deep links are most commonly used
5. **Handle errors gracefully**: Provide user-friendly error messages for invalid links
6. **Secure tokens**: Ensure verification tokens are secure and have appropriate expiration

## Adding New Deep Links

To add a new deep link:

1. Add the handler in `lib/deepLinking.ts`:
```javascript
this.addHandler('new-feature/:param', (params) => {
  router.push(`/new-feature?param=${params.param}`);
});
```

2. Add the URL generation methods:
```javascript
case 'new-feature':
  return `${baseUrl}/new-feature/${params?.param || ''}`;
```

3. Update this documentation with the new URL patterns

## Support

For questions or issues with deep linking, please refer to:
- Expo Router documentation
- React Native Linking API
- Platform-specific deep linking guides 