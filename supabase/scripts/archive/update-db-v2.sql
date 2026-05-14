-- =====================================================
-- EduFox School ERP — Schema Alignment Migration (V2)
-- Updates exams table and creates payment_gateways table
-- =====================================================

-- 1. UPDATE EXAMS TABLE
DO $$ 
BEGIN 
    -- Add subject_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='subject_id') THEN
        ALTER TABLE public.exams ADD COLUMN subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL;
    END IF;

    -- Add class_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='class_id') THEN
        ALTER TABLE public.exams ADD COLUMN class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL;
    END IF;

    -- Add date (migrate from start_date if applicable)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='date') THEN
        ALTER TABLE public.exams ADD COLUMN date DATE;
        -- Move start_date to date if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='start_date') THEN
            UPDATE public.exams SET date = start_date WHERE date IS NULL;
        END IF;
    END IF;

    -- Add time and marks fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='start_time') THEN
        ALTER TABLE public.exams ADD COLUMN start_time TIME;
        ALTER TABLE public.exams ADD COLUMN end_time TIME;
        ALTER TABLE public.exams ADD COLUMN max_marks DECIMAL(5,2) DEFAULT 100;
        ALTER TABLE public.exams ADD COLUMN passing_marks DECIMAL(5,2) DEFAULT 40;
        ALTER TABLE public.exams ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- 2. CREATE PAYMENT GATEWAYS TABLE
CREATE TABLE IF NOT EXISTS public.payment_gateways (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    api_key TEXT,
    secret_key TEXT,
    webhook_secret TEXT,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENABLE RLS & POLICIES FOR PAYMENT GATEWAYS
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_payment_gateways" ON public.payment_gateways;
CREATE POLICY "allow_public_read_payment_gateways" ON public.payment_gateways FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_auth_all_payment_gateways" ON public.payment_gateways;
CREATE POLICY "allow_auth_all_payment_gateways" ON public.payment_gateways FOR ALL USING (auth.role() = 'authenticated');

-- 4. CLEANUP OLD COLUMNS (Optional/Safe phase)
-- We keep start_date/end_date for now to avoid breaking existing queries that might still use them.

-- 5. NOTIFY
SELECT 'Database alignment complete. Exams updated and Payment Gateways created.' as status;
