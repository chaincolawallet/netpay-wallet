# NetPay Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Ensure your code is in a Git repository (GitHub, GitLab, or Bitbucket)
3. **Environment Variables**: Set up your environment variables

## Environment Variables Setup

Before deploying, you need to set up your environment variables in Vercel:

### Required Variables:
- `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Optional Variables:
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (keep secret)
- `EXPO_PUBLIC_APP_NAME` - App name (default: NetPay)
- `EXPO_PUBLIC_APP_VERSION` - App version (default: 1.0.0)
- `EXPO_PUBLIC_PAYMENT_GATEWAY_URL` - Payment gateway URL
- `EXPO_PUBLIC_PAYMENT_GATEWAY_KEY` - Payment gateway key

## Deployment Steps

### Method 1: Deploy via Vercel Dashboard

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. **Configure Project**:
   - Framework Preset: `Expo`
   - Build Command: `npx expo export --platform web`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all required environment variables

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add EXPO_PUBLIC_SUPABASE_URL
   vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY
   # Add other variables as needed
   ```

## Post-Deployment

1. **Verify Deployment**: Check your app at the provided Vercel URL
2. **Custom Domain** (Optional): Add a custom domain in Vercel dashboard
3. **Monitor**: Use Vercel analytics to monitor performance

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Ensure environment variables are set correctly
   - Verify Node.js version compatibility

2. **Runtime Errors**:
   - Check browser console for errors
   - Verify Supabase configuration
   - Ensure all environment variables are properly set

3. **Performance Issues**:
   - Enable Vercel Edge Functions if needed
   - Optimize images and assets
   - Use Vercel's CDN for static assets

## Security Notes

- Never commit `.env` files to your repository
- Keep service role keys secret and server-side only
- Use environment variables for all sensitive configuration
- Enable Vercel's security features like HTTPS enforcement

## Support

For issues with:
- **Vercel Deployment**: Check [Vercel Documentation](https://vercel.com/docs)
- **Expo Web**: Check [Expo Documentation](https://docs.expo.dev/)
- **NetPay App**: Check the main README.md file 