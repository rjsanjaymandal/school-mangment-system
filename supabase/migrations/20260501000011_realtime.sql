-- Enable Supabase Realtime for the Fee Collection Module
-- Run this in your Supabase SQL Editor

-- 1. Create a publication for realtime if it doesn't exist
-- Note: Supabase usually has a default publication called 'supabase_realtime'
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- 2. Add tables to the publication
-- This enables INSERT, UPDATE, and DELETE event broadcasting for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE fee_structures;
ALTER PUBLICATION supabase_realtime ADD TABLE fee_assignments;

-- 3. Verify the tables are in the publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
