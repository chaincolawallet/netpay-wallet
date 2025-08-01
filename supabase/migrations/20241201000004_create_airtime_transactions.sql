-- Create airtime_transactions table
CREATE TABLE IF NOT EXISTS airtime_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  network_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  sme_plug_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_airtime_transactions_user_id ON airtime_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_airtime_transactions_reference ON airtime_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_airtime_transactions_status ON airtime_transactions(status);
CREATE INDEX IF NOT EXISTS idx_airtime_transactions_created_at ON airtime_transactions(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE airtime_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own airtime transactions
CREATE POLICY "Users can view their own airtime transactions" ON airtime_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own airtime transactions
CREATE POLICY "Users can insert their own airtime transactions" ON airtime_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own airtime transactions
CREATE POLICY "Users can update their own airtime transactions" ON airtime_transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_airtime_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_airtime_transactions_updated_at
  BEFORE UPDATE ON airtime_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_airtime_transactions_updated_at();

-- Create function to get airtime transaction statistics
CREATE OR REPLACE FUNCTION get_airtime_stats(user_uuid UUID)
RETURNS TABLE (
  total_transactions BIGINT,
  total_amount DECIMAL(10,2),
  successful_transactions BIGINT,
  failed_transactions BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_transactions,
    COALESCE(SUM(amount), 0) as total_amount,
    COUNT(*) FILTER (WHERE status = 'success') as successful_transactions,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_transactions
  FROM airtime_transactions
  WHERE user_id = user_uuid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_airtime_stats(UUID) TO authenticated; 