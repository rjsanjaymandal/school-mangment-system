-- =====================================================
-- EduFox School ERP — Missing Satellite Module Tables
-- Provisions: alumni, activities, certificates
-- =====================================================

-- 0. PROFILES MIGRATION (Ensure compatibility with first_name/last_name)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='first_name') THEN
        ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
        ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
        
        -- Split full_name if it exists
        UPDATE public.profiles 
        SET 
            first_name = split_part(full_name, ' ', 1),
            last_name = substring(full_name from position(' ' in full_name) + 1)
        WHERE full_name IS NOT NULL;
    END IF;
END $$;

-- 1. ALUMNI TABLE
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

-- 2. ACTIVITIES TABLE
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

-- 3. CERTIFICATES TABLE
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

-- 4. ENABLE RLS
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
DO $$ 
DECLARE 
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['alumni', 'activities', 'certificates']) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "allow_public_read_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "allow_public_read_%s" ON public.%I FOR SELECT USING (true)', tbl, tbl);
        
        EXECUTE format('DROP POLICY IF EXISTS "allow_auth_all_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "allow_auth_all_%s" ON public.%I FOR ALL USING (auth.role() = ''authenticated'')', tbl, tbl);
    END LOOP;
END $$;

-- 6. SEED DATA
-- Alumni
INSERT INTO public.alumni (first_name, last_name, graduation_year, current_profession, company, achievements)
VALUES 
    ('Siddharth', 'Malhotra', 2015, 'Senior Software Architect', 'Google', 'Lead developer for Core Search algorithms'),
    ('Ananya', 'Pande', 2017, 'Neurosurgeon', 'Fortis Hospital', 'Youngest recipient of the Medical Excellence Award'),
    ('Vikram', 'Seth', 2012, 'Investment Banker', 'Goldman Sachs', 'Managed $2B emerging markets portfolio')
ON CONFLICT DO NOTHING;

-- Activities
INSERT INTO public.activities (name, description, category, location, schedule)
VALUES 
    ('Space Tech Club', 'Designing small-scale propellant models.', 'Science', 'Room R-101', 'Sat 10:00 AM'),
    ('Robotics Engineering', 'Building autonomous rovers.', 'Science', 'Tech Lab 2', 'Fri 4:00 PM'),
    ('Classical Music Ensemble', 'Violin and piano masterclasses.', 'Arts', 'Music Hall', 'Wed 3:30 PM')
ON CONFLICT DO NOTHING;

-- Certificates (Relies on existing students)
INSERT INTO public.certificates (student_id, type, reference_number, issued_date, remarks)
SELECT 
    id,
    'Academic Excellence',
    'CERT-' || floor(random() * 89999 + 10000)::text,
    CURRENT_DATE - INTERVAL '10 days',
    'Outstanding performance in Science and Mathematics.'
FROM public.students
LIMIT 3
ON CONFLICT (reference_number) DO NOTHING;
