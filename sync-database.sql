-- =====================================================
-- EduFox School ERP — Database Schema Synchronization
-- Purpose: Repair tables that are missing required metadata columns.
-- =====================================================

-- 1. Ensure Classes table has metadata
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classes' AND column_name='capacity') THEN
        ALTER TABLE public.classes ADD COLUMN capacity INT DEFAULT 30;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classes' AND column_name='room_number') THEN
        ALTER TABLE public.classes ADD COLUMN room_number TEXT;
    END IF;
END $$;

-- 2. Ensure Profiles table has full_name & role
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'student';
    END IF;
END $$;

-- 3. Ensure Subjects table has code
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='code') THEN
        ALTER TABLE public.subjects ADD COLUMN code TEXT;
    END IF;
END $$;

-- 4. Verify & Create Audit Logs (if missing)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable RLS and Policies for Audit
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated read audit_logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated read audit_logs" ON public.audit_logs FOR SELECT USING (true);

-- 6. Verify Students Table Columns
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='admission_number') THEN
        ALTER TABLE public.students ADD COLUMN admission_number TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='roll_number') THEN
        ALTER TABLE public.students ADD COLUMN roll_number TEXT;
    END IF;
END $$;
