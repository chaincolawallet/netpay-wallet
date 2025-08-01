# Biometric Authentication Setup

## Overview
This document explains how to set up biometric authentication for the NetPay app.

## Database Setup

### 1. Create the biometric_credentials table
Run the following SQL in your Supabase SQL editor:

```sql
-- Create biometric_credentials table
CREATE TABLE IF NOT EXISTS biometric_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_biometric_credentials_user_id ON biometric_credentials(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE biometric_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own biometric credentials
CREATE POLICY "Users can manage their own biometric credentials" ON biometric_credentials
  FOR ALL USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_biometric_credentials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_biometric_credentials_updated_at
  BEFORE UPDATE ON biometric_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_biometric_credentials_updated_at();
```

### 2. Verify the table was created
You can verify the table was created by running:
```sql
SELECT * FROM biometric_credentials LIMIT 1;
```

## How It Works

### Security Approach
- **No password storage**: The app doesn't store actual passwords
- **Biometric preference only**: Only stores whether biometric login is enabled
- **User must be logged in**: Biometric authentication only works for already authenticated users

### Flow
1. User signs in with email/password
2. User enables biometric login from profile settings
3. Face ID/Touch ID is used to verify identity
4. If successful, biometric preference is saved
5. Future logins can use biometric authentication

### Error Handling
- If the `biometric_credentials` table doesn't exist, the app will show a helpful error message
- All biometric operations are wrapped in try-catch blocks
- Detailed error logging for debugging

## Testing

### Enable Biometrics
1. Sign in to the app
2. Go to Profile → Quick Settings
3. Toggle "Face ID Login" to ON
4. Complete Face ID authentication
5. Verify the toggle stays ON

### Use Biometrics
1. Sign out of the app
2. On the login screen, tap "Sign in with Face ID"
3. Complete Face ID authentication
4. Should navigate to home screen

## Troubleshooting

### "Biometric table not found" Error
- Run the SQL migration above in your Supabase SQL editor
- Verify the table exists by checking the Supabase dashboard

### "Authentication failed" Error
- Check if Face ID/Touch ID is set up on the device
- Ensure the user has biometric authentication enabled in device settings
- Try re-enabling biometric login in the app

### "Failed to save biometric credentials" Error
- Check Supabase connection
- Verify RLS policies are set up correctly
- Check browser console for detailed error messages

## Security Notes
- Biometric data is stored locally on the device
- Only biometric preference is stored in Supabase
- No actual passwords are stored in the database
- RLS ensures users can only access their own biometric preferences 