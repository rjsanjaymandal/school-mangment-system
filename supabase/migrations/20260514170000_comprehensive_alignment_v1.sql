-- =====================================================
-- 🛡️ EDU MAYSAN ERP | COMPREHENSIVE ALIGNMENT & REPAIR
-- Phase: FINAL ALIGNMENT
-- =====================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE ALIGNMENT
-- Ensuring first_name, last_name, full_name, and role are all synced.
DO $$ 
BEGIN 
    -- 1.1 first_name / last_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='first_name') THEN
        ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
        ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
        
        UPDATE public.profiles 
        SET 
            first_name = split_part(full_name, ' ', 1),
            last_name = substring(full_name from position(' ' in full_name) + 1)
        WHERE full_name IS NOT NULL;
    END IF;

    -- 1.2 full_name backfill
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
        UPDATE public.profiles SET full_name = COALESCE(first_name, '') || ' ' || COALESCE(last_name, '');
    END IF;

    -- 1.3 role
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'student';
    END IF;
END $$;

-- 2. SATELLITE MODULE TABLES (Alumni, Activities, Certificates)
-- alumni
CREATE TABLE IF NOT EXISTS public.alumni (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    graduation_year INT NOT NULL,
    email TEXT,
    phone TEXT,
    current_profession TEXT,
    company TEXT,
    achievements TEXT,
    profile_picture_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- activities
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    teacher_in_charge UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    location TEXT,
    schedule TEXT,
    max_participants INT DEFAULT 30,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- certificates
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    reference_number TEXT UNIQUE NOT NULL,
    issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
    issued_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'revoked')),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. CORE TABLE METADATA SYNC
DO $$ 
BEGIN 
    -- 3.1 Classes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classes' AND column_name='capacity') THEN
        ALTER TABLE public.classes ADD COLUMN capacity INT DEFAULT 30;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classes' AND column_name='room_number') THEN
        ALTER TABLE public.classes ADD COLUMN room_number TEXT;
    END IF;
    
    -- 3.2 Subjects
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='code') THEN
        ALTER TABLE public.subjects ADD COLUMN code TEXT;
    END IF;

    -- 3.3 Students
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='admission_number') THEN
        ALTER TABLE public.students ADD COLUMN admission_number TEXT UNIQUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='roll_number') THEN
        ALTER TABLE public.students ADD COLUMN roll_number TEXT;
    END IF;
END $$;

-- 4. AUDIT LOGS REPAIR
-- Ensure actor_id links to profiles correctly.
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_data JSONB DEFAULT '{}',
    new_data JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='actor_id') THEN
        ALTER TABLE public.audit_logs ADD COLUMN actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. SCHOOL SETTINGS SEED
INSERT INTO public.school_settings (key, value, category) 
VALUES 
    ('target_revenue', '5000000', 'financial'),
    ('academic_year', '2024-25', 'academic'),
    ('currency', 'INR', 'finance')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 6. SECURITY & GRAPHQL ALIGNMENT
-- Ensure all tables are hidden from GraphQL scanning as per recent security hardening.
DO $$
DECLARE
    tbl_name TEXT;
    target_tables TEXT[] := ARRAY[
        'alumni', 'activities', 'certificates', 'audit_logs', 'school_settings'
    ];
BEGIN
    FOREACH tbl_name IN ARRAY target_tables
    LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl_name) THEN
            EXECUTE format('COMMENT ON TABLE public.%I IS ''@graphql({"expose": false})''', tbl_name);
        END IF;
    END LOOP;
END $$;

-- 7. RLS ENFORCEMENT
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Aligned with standard project patterns)
DROP POLICY IF EXISTS "Allow authenticated read alumni" ON public.alumni;
CREATE POLICY "Allow authenticated read alumni" ON public.alumni FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated read activities" ON public.activities;
CREATE POLICY "Allow authenticated read activities" ON public.activities FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated read certificates" ON public.certificates;
CREATE POLICY "Allow authenticated read certificates" ON public.certificates FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 8. SCHEMA CACHE RELOAD
NOTIFY pgrst, 'reload schema';

SELECT '✅ COMPREHENSIVE ALIGNMENT COMPLETED' as status;
