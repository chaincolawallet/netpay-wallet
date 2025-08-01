-- Create deletion_requests table
CREATE TABLE IF NOT EXISTS deletion_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user_id ON deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON deletion_requests(status);

-- Enable RLS (Row Level Security)
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own deletion requests
CREATE POLICY "Users can manage their own deletion requests" ON deletion_requests
  FOR ALL USING (auth.uid() = user_id);

-- Create policy to allow admins to view all deletion requests
CREATE POLICY "Admins can view all deletion requests" ON deletion_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role' = 'admin' OR auth.users.email LIKE '%@netpay.com')
    )
  );

-- Create function to update processed_at timestamp
CREATE OR REPLACE FUNCTION update_deletion_requests_processed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status AND NEW.status IN ('approved', 'rejected') THEN
    NEW.processed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update processed_at
CREATE TRIGGER update_deletion_requests_processed_at
  BEFORE UPDATE ON deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_deletion_requests_processed_at(); 