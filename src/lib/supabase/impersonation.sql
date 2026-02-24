-- impersonation_logs table
CREATE TABLE IF NOT EXISTS impersonation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    target_user_id UUID REFERENCES auth.users(id) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    ip_address TEXT,
    metadata JSONB
);

-- Enable RLS
ALTER TABLE impersonation_logs ENABLE ROW LEVEL SECURITY;

-- Only Admins can view/insert logs
CREATE POLICY "Admins can manage impersonation logs"
ON impersonation_logs
FOR ALL
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
));
