# Environment Setup Guide

## Overview

This guide explains how to set up environment variables for the NetPay app. The app uses a centralized configuration system that validates and manages all environment variables.

## Required Environment Variables

### 1. Supabase Configuration
```bash
# Required for database and authentication
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For admin functions (keep secret)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. App Configuration
```bash
# App metadata
EXPO_PUBLIC_APP_NAME=NetPay
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_APP_SCHEME=netpay
EXPO_PUBLIC_APP_URL=https://www.netpayy.ng
```

### 3. API Configuration
```bash
# API endpoints
EXPO_PUBLIC_API_BASE_URL=https://www.netpayy.ng/api
```

### 4. Payment Gateway (Optional)
```bash
# Payment processing
EXPO_PUBLIC_PAYMENT_GATEWAY_URL=your_payment_gateway_url
EXPO_PUBLIC_PAYMENT_GATEWAY_KEY=your_payment_gateway_key
```

### 5. Development Configuration
```bash
# Debug and development settings
NODE_ENV=development
EXPO_PUBLIC_DEBUG_MODE=true
```

## Setup Instructions

### Step 1: Create .env File

Create a `.env` file in the root directory of your project:

```bash
# Copy the example file
cp env.example .env

# Or create manually
touch .env
```

### Step 2: Configure Supabase

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the following values:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon/Public Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. Update your `.env` file:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Configure App Settings

Update the app-specific variables in your `.env` file:

```bash
# App Configuration
EXPO_PUBLIC_APP_NAME=NetPay
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_APP_SCHEME=netpay
EXPO_PUBLIC_APP_URL=https://www.netpayy.ng

# API Configuration
EXPO_PUBLIC_API_BASE_URL=https://www.netpayy.ng/api

# Development
NODE_ENV=development
EXPO_PUBLIC_DEBUG_MODE=true
```

### Step 4: Verify Configuration

The app will automatically validate your environment variables on startup. You'll see console output like:

```
🔧 Environment Configuration:
📱 App: NetPay v1.0.0
🔗 Scheme: netpay
🌐 URL: https://www.netpayy.ng
🔐 Supabase URL: ✅ Set
🔑 Supabase Key: ✅ Set
🚀 Environment: Development
🐛 Debug Mode: Enabled
```

## Environment Variable Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EXPO_PUBLIC_APP_NAME` | App name | `NetPay` |
| `EXPO_PUBLIC_APP_VERSION` | App version | `1.0.0` |
| `EXPO_PUBLIC_APP_SCHEME` | Deep link scheme | `netpay` |
| `EXPO_PUBLIC_APP_URL` | App website URL | `https://www.netpayy.ng` |
| `EXPO_PUBLIC_API_BASE_URL` | API base URL | `https://www.netpayy.ng/api` |
| `EXPO_PUBLIC_PAYMENT_GATEWAY_URL` | Payment gateway URL | `""` |
| `EXPO_PUBLIC_PAYMENT_GATEWAY_KEY` | Payment gateway key | `""` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `""` |
| `NODE_ENV` | Environment mode | `development` |
| `EXPO_PUBLIC_DEBUG_MODE` | Debug mode | `false` |

## Platform-Specific Setup

### Development

1. **Local Development**:
   ```bash
   # Copy environment file
   cp env.example .env
   
   # Edit with your values
   nano .env
   
   # Start development server
   npm start
   ```

2. **Expo Development**:
   ```bash
   # Install Expo CLI
   npm install -g @expo/cli
   
   # Start with environment variables
   expo start
   ```

### Production

1. **Vercel Deployment**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add all required variables

2. **App Store Deployment**:
   - Ensure all `EXPO_PUBLIC_*` variables are set
   - Build with production configuration

### Testing

1. **Environment Validation**:
   ```javascript
   import { validateEnvironment } from '../lib/config';
   
   const { isValid, errors } = validateEnvironment();
   if (!isValid) {
     console.error('Environment errors:', errors);
   }
   ```

2. **Configuration Logging**:
   ```javascript
   import { logEnvironmentConfig } from '../lib/config';
   
   // Logs configuration in development
   logEnvironmentConfig();
   ```

## Security Best Practices

### 1. Never Commit .env Files
```bash
# Ensure .env is in .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

### 2. Use Different Keys for Different Environments
```bash
# Development
EXPO_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co

# Production
EXPO_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
```

### 3. Keep Service Keys Secret
- Never prefix service role keys with `EXPO_PUBLIC_`
- Use server-side functions for sensitive operations
- Store service keys securely in production

### 4. Validate Environment Variables
The app automatically validates required variables on startup and shows warnings for missing or invalid configurations.

## Troubleshooting

### Common Issues

1. **"Environment validation failed"**:
   - Check that all required variables are set
   - Ensure no default placeholder values remain
   - Verify Supabase credentials are correct

2. **"Supabase connection failed"**:
   - Verify `EXPO_PUBLIC_SUPABASE_URL` is correct
   - Check `EXPO_PUBLIC_SUPABASE_ANON_KEY` is valid
   - Ensure your Supabase project is active

3. **"Deep linking not working"**:
   - Verify `EXPO_PUBLIC_APP_SCHEME` is set
   - Check `EXPO_PUBLIC_APP_URL` is correct
   - Ensure app.json has proper deep linking configuration

### Debug Mode

Enable debug mode to see detailed environment information:

```bash
EXPO_PUBLIC_DEBUG_MODE=true
```

This will show:
- All environment variables (except secrets)
- Configuration validation results
- Deep linking setup status
- Feature flags status

## Support

For issues with environment setup:

1. Check the console for validation errors
2. Verify all required variables are set
3. Ensure no placeholder values remain
4. Test with the debug mode enabled

## Next Steps

After setting up environment variables:

1. **Test the app**: Run `npm start` and verify no environment errors
2. **Configure Supabase**: Set up your database schema and functions
3. **Deploy**: Configure production environment variables
4. **Monitor**: Use the built-in validation to catch configuration issues 