-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Students table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    admission_number TEXT UNIQUE NOT NULL,
    roll_number TEXT,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    date_of_birth DATE,
    gender TEXT,
    blood_group TEXT,
    parent_id UUID, -- Can link to profiles(id) if parents are users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Teachers table
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    specialization TEXT[],
    qualification TEXT,
    joining_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Fee Payments table
CREATE TABLE IF NOT EXISTS public.fee_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    fee_id UUID REFERENCES public.fees(id) ON DELETE CASCADE,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'completed'
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

-- 1. Students Policies
DROP POLICY IF EXISTS "Allow public read" ON public.students;
CREATE POLICY "Allow public read" ON public.students FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.students;
CREATE POLICY "Enable all for authenticated users" ON public.students FOR ALL USING (auth.role() = 'authenticated');

-- 2. Teachers Policies
DROP POLICY IF EXISTS "Allow public read" ON public.teachers;
CREATE POLICY "Allow public read" ON public.teachers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.teachers;
CREATE POLICY "Enable all for authenticated users" ON public.teachers FOR ALL USING (auth.role() = 'authenticated');

-- 3. Fee Payments Policies
DROP POLICY IF EXISTS "Allow public read" ON public.fee_payments;
CREATE POLICY "Allow public read" ON public.fee_payments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.fee_payments;
CREATE POLICY "Enable all for authenticated users" ON public.fee_payments FOR ALL USING (auth.role() = 'authenticated');

-- 4. Ensure Profiles can be read for joins
-- If you have a profiles table, it needs to be readable for the student list to show names
DROP POLICY IF EXISTS "Allow public read on profiles" ON public.profiles;
CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);

