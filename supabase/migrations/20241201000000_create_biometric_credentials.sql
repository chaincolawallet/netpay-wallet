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