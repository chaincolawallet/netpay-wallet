-- Create function to get user by email (for transfer verification)
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  email_confirmed_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the requesting user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Return user information from profiles table
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    COALESCE(p.full_name, 'User') as full_name,
    p.phone_number,
    p.created_at,
    p.email_confirmed_at
  FROM profiles p
  WHERE p.email = user_email
  AND p.email_confirmed_at IS NOT NULL; -- Only return verified users
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_by_email(TEXT) TO authenticated;

-- Create a more comprehensive user verification function
CREATE OR REPLACE FUNCTION verify_user_for_transfer(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_data JSON;
BEGIN
  -- Check if the requesting user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Get user data
  SELECT json_build_object(
    'id', p.id,
    'email', p.email,
    'full_name', COALESCE(p.full_name, 'User'),
    'phone_number', p.phone_number,
    'created_at', p.created_at,
    'email_confirmed_at', p.email_confirmed_at,
    'verified', p.email_confirmed_at IS NOT NULL
  ) INTO user_data
  FROM profiles p
  WHERE p.email = user_email;

  -- Return null if user not found
  IF user_data IS NULL THEN
    RETURN NULL;
  END IF;

  -- Only return verified users
  IF (user_data->>'verified')::boolean = false THEN
    RETURN NULL;
  END IF;

  RETURN user_data;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION verify_user_for_transfer(TEXT) TO authenticated;

-- Create function to check if user can receive transfers
CREATE OR REPLACE FUNCTION can_user_receive_transfers(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if the requesting user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if user exists and is verified
  SELECT EXISTS(
    SELECT 1 
    FROM profiles p 
    WHERE p.email = user_email 
    AND p.email_confirmed_at IS NOT NULL
  ) INTO user_exists;

  RETURN user_exists;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION can_user_receive_transfers(TEXT) TO authenticated; 