-- =====================================================
-- EduFox School ERP — Heritage & Alumni Setup
-- Provisions the alumni registry and seeds historical data
-- =====================================================

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

-- 2. ENABLE RLS
ALTER TABLE public.alumni ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES
CREATE POLICY "Allow public read access to alumni" 
ON public.alumni FOR SELECT 
TO authenticated, anon 
USING (true);

-- 4. SEED DATA
INSERT INTO public.alumni (first_name, last_name, graduation_year, current_profession, company, achievements)
VALUES 
    ('Siddharth', 'Malhotra', 2015, 'Senior Software Architect', 'Google', 'Lead developer for Core Search algorithms'),
    ('Ananya', 'Pande', 2017, 'Neurosurgeon', 'Fortis Hospital', 'Youngest recipient of the Medical Excellence Award'),
    ('Vikram', 'Seth', 2012, 'Investment Banker', 'Goldman Sachs', 'Managed $2B emerging markets portfolio'),
    ('Riya', 'Kapoor', 2019, 'Machine Learning Engineer', 'Tesla', 'Patented autonomous navigation sub-systems'),
    ('Kabir', 'Khan', 2010, 'Creative Director', 'Netflix', 'Multiple Emmy award winning documentarian')
ON CONFLICT DO NOTHING;
