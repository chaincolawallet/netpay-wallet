-- Update profiles table to ensure it has the necessary columns for user verification
-- Add email column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- Add email_confirmed_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email_confirmed_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email_confirmed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Create index on email_confirmed_at for verified user queries
CREATE INDEX IF NOT EXISTS idx_profiles_email_confirmed ON profiles(email_confirmed_at);

-- Update existing profiles to sync email from auth.users
-- This is a one-time migration to populate email data
UPDATE profiles 
SET email = (
    SELECT email 
    FROM auth.users 
    WHERE auth.users.id = profiles.id
)
WHERE email IS NULL;

-- Update email_confirmed_at from auth.users
UPDATE profiles 
SET email_confirmed_at = (
    SELECT email_confirmed_at 
    FROM auth.users 
    WHERE auth.users.id = profiles.id
)
WHERE email_confirmed_at IS NULL;

-- Create a trigger to automatically sync email data from auth.users
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
    -- Update email in profiles when auth.users is updated
    UPDATE profiles 
    SET 
        email = NEW.email,
        email_confirmed_at = NEW.email_confirmed_at
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auth.users updates
DROP TRIGGER IF EXISTS sync_user_email_trigger ON auth.users;
CREATE TRIGGER sync_user_email_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_email();

-- Create trigger for profiles table to ensure email is always populated
CREATE OR REPLACE FUNCTION ensure_profile_email()
RETURNS TRIGGER AS $$
BEGIN
    -- If email is not set, try to get it from auth.users
    IF NEW.email IS NULL THEN
        SELECT email INTO NEW.email
        FROM auth.users
        WHERE id = NEW.id;
    END IF;
    
    -- If email_confirmed_at is not set, try to get it from auth.users
    IF NEW.email_confirmed_at IS NULL THEN
        SELECT email_confirmed_at INTO NEW.email_confirmed_at
        FROM auth.users
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles table
DROP TRIGGER IF EXISTS ensure_profile_email_trigger ON profiles;
CREATE TRIGGER ensure_profile_email_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_profile_email(); 