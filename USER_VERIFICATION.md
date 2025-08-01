# User Verification System

## Overview
The user verification system allows NetPay users to verify other users by email for money transfers. This system ensures that only verified users can receive transfers and provides a secure way to look up users.

## Problem Solved
Previously, the transfer system was showing "User not found" even for registered NetPay users because:
1. The system was trying to call a non-existent Edge Function
2. The profiles table didn't have proper email columns
3. No proper user lookup mechanism was in place

## Solution Implemented

### 🔧 **Database Functions**
Created secure RPC functions for user verification:

#### **1. `verify_user_for_transfer(user_email TEXT)`**
- Returns user information for verified users only
- Includes security checks and authentication requirements
- Returns JSON with user details

#### **2. `get_user_by_email(user_email TEXT)`**
- Alternative function for user lookup
- Returns table format with user details
- Only returns verified users

#### **3. `can_user_receive_transfers(user_email TEXT)`**
- Simple boolean check for transfer eligibility
- Quick verification for UI validation

### 🗄️ **Database Schema Updates**

#### **Profiles Table Enhancements**
- ✅ **Email Column**: Added `email` column to profiles table
- ✅ **Email Confirmation**: Added `email_confirmed_at` column
- ✅ **Indexes**: Created indexes for faster lookups
- ✅ **Triggers**: Automatic sync between auth.users and profiles

#### **Automatic Data Sync**
- ✅ **Auth Sync**: Triggers sync email data from auth.users
- ✅ **Profile Sync**: Ensures profiles always have email data
- ✅ **One-time Migration**: Populates existing profiles with email data

### 🔒 **Security Features**

#### **Authentication Required**
- ✅ **User Authentication**: All functions require authenticated users
- ✅ **RLS Policies**: Row-level security protects user data
- ✅ **Verified Users Only**: Only email-verified users can receive transfers

#### **Data Protection**
- ✅ **No Sensitive Data**: Functions don't return passwords or sensitive info
- ✅ **Email Verification**: Only verified email addresses are returned
- ✅ **Audit Trail**: All verification attempts are logged

## Implementation Details

### **Frontend Integration**
```typescript
// In transfer screen
const verifyRecipient = async () => {
  try {
    const user = await verifyUserEmail(email.trim().toLowerCase());
    setRecipientDetails(user);
    setIsVerified(true);
    Alert.alert('User Verified', `Found ${user.full_name} with this email`);
  } catch (error) {
    Alert.alert('User Not Found', 'No verified NetPay account found with this email');
  }
};
```

### **Backend Service**
```typescript
export const userService = {
  async verifyUserEmail(email: string) {
    const { data: userData, error } = await supabase.rpc('verify_user_for_transfer', {
      user_email: email.toLowerCase()
    });
    
    if (!userData) {
      throw new Error('User not found or not verified');
    }
    
    return userData;
  },
};
```

### **Database Functions**
```sql
-- Main verification function
CREATE OR REPLACE FUNCTION verify_user_for_transfer(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- Implementation details...
$$;
```

## Setup Instructions

### **1. Run Database Migrations**
Execute these SQL migrations in your Supabase SQL editor:

```sql
-- Migration 1: User verification functions
-- See: supabase/migrations/20241201000002_create_user_verification_functions.sql

-- Migration 2: Profiles table updates
-- See: supabase/migrations/20241201000003_update_profiles_table.sql
```

### **2. Verify Setup**
Test the functions in Supabase SQL editor:

```sql
-- Test user verification
SELECT * FROM verify_user_for_transfer('user@example.com');

-- Test transfer eligibility
SELECT can_user_receive_transfers('user@example.com');
```

### **3. Check Data Sync**
Verify that profiles have email data:

```sql
-- Check profiles with email data
SELECT id, email, email_confirmed_at 
FROM profiles 
WHERE email IS NOT NULL 
LIMIT 5;
```

## Usage Flow

### **1. User Enters Email**
- User types recipient email in transfer screen
- Email is trimmed and converted to lowercase

### **2. Verification Request**
- Frontend calls `verifyUserEmail(email)`
- Backend calls `verify_user_for_transfer` RPC function
- Database checks for verified user with that email

### **3. Response Handling**
- **Success**: User details returned, verification confirmed
- **Failure**: "User not found" error shown
- **Not Verified**: User exists but email not confirmed

### **4. Transfer Proceeds**
- Only verified users can receive transfers
- Transfer amount and note are processed
- Recipient receives notification

## Error Handling

### **Common Errors**

#### **"User not found"**
- User doesn't exist in NetPay
- User exists but email not verified
- Database connection issues

#### **"Failed to verify user"**
- RPC function errors
- Authentication issues
- Database permission problems

#### **"User not verified"**
- User exists but email not confirmed
- User needs to verify email first

### **Debugging Steps**

#### **1. Check User Exists**
```sql
SELECT * FROM profiles WHERE email = 'user@example.com';
```

#### **2. Check Email Verification**
```sql
SELECT email_confirmed_at FROM profiles WHERE email = 'user@example.com';
```

#### **3. Test RPC Function**
```sql
SELECT * FROM verify_user_for_transfer('user@example.com');
```

#### **4. Check Authentication**
```sql
-- Verify user is authenticated
SELECT auth.uid();
```

## Testing

### **Test Scenarios**

#### **1. Valid User**
- ✅ User exists and email verified
- ✅ Should return user details
- ✅ Should allow transfer

#### **2. Non-existent User**
- ✅ User doesn't exist
- ✅ Should return "User not found"
- ✅ Should not allow transfer

#### **3. Unverified User**
- ✅ User exists but email not verified
- ✅ Should return "User not verified"
- ✅ Should not allow transfer

#### **4. Invalid Email**
- ✅ Malformed email address
- ✅ Should return validation error
- ✅ Should not proceed

### **Test Commands**
```bash
# Test the verification system
npm test -- --testNamePattern="User Verification"

# Test transfer functionality
npm test -- --testNamePattern="Money Transfer"
```

## Monitoring

### **Metrics to Track**
- Verification success rate
- Common verification failures
- Transfer completion rate
- User feedback on verification

### **Logs to Monitor**
- RPC function calls
- Authentication failures
- Database query performance
- Error rates by type

## Future Enhancements

### **Planned Features**
- **Phone Number Verification**: Allow transfers by phone number
- **Username System**: Allow transfers by username
- **QR Code Transfers**: Scan QR codes for transfers
- **Contact List**: Save frequent recipients

### **Performance Optimizations**
- **Caching**: Cache verified users
- **Batch Verification**: Verify multiple users at once
- **Real-time Updates**: Live verification status

## Troubleshooting

### **Common Issues**

#### **"Function not found" Error**
- Run the migration files
- Check function permissions
- Verify Supabase connection

#### **"Authentication required" Error**
- Ensure user is logged in
- Check session validity
- Verify RLS policies

#### **"User not found" for existing users**
- Check email column in profiles
- Verify email_confirmed_at is set
- Run data sync migration

### **Debug Commands**
```sql
-- Check function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'verify_user_for_transfer';

-- Check profiles table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Test function directly
SELECT * FROM verify_user_for_transfer('test@example.com');
```

---

**Note**: This system ensures secure and reliable user verification for money transfers. Always test thoroughly in development before deploying to production. 