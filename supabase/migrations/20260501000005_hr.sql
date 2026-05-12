-- =====================================================
-- HR & STAFF MANAGEMENT MODULE
-- =====================================================

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Designations Table
CREATE TABLE IF NOT EXISTS public.designations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Staff Table (Comprehensive HR)
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Section A: Staff Identification
    staff_type TEXT NOT NULL CHECK (staff_type IN ('teaching', 'non_teaching')),
    department_id UUID REFERENCES public.departments(id),
    designation_id UUID REFERENCES public.designations(id),
    
    -- Section B: Personal Details
    first_name TEXT NOT NULL,
    last_name TEXT,
    "father's_name" TEXT,
    mother_name TEXT,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    date_of_birth DATE,
    marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    caste_category TEXT,
    highest_qualification TEXT,
    mother_tongue TEXT,
    languages_known TEXT[],
    regional_language_proficiency TEXT,
    
    -- Section C: Contact & Salary
    mobile TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    date_of_joining DATE,
    monthly_salary DECIMAL(12,2),
    
    -- Section D: Media
    photo_url TEXT,
    
    -- Additional
    emergency_contact TEXT,
    emergency_phone TEXT,
    aadhar_number TEXT,
    pan_number TEXT,
    bank_account TEXT,
    ifsc_code TEXT,
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'terminated')),
    is_login_enabled BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Staff ID Auto-Generation Function
CREATE OR REPLACE FUNCTION generate_staff_id()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT;
    year_part TEXT;
    sequence_num INTEGER;
    new_staff_id TEXT;
BEGIN
    prefix := 'GCC';
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(staff_id FROM 10 FOR 4) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM staff
    WHERE staff_id LIKE prefix || '-' || year_part || '-%';
    
    NEW.staff_id := prefix || '-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generation
DROP TRIGGER IF EXISTS set_staff_id ON public.staff;
CREATE TRIGGER set_staff_id
    BEFORE INSERT ON public.staff
    FOR EACH ROW
    WHEN (NEW.staff_id IS NULL)
    EXECUTE FUNCTION generate_staff_id();

-- Enable RLS
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Departments Policies
DROP POLICY IF EXISTS "Departments read access" ON public.departments;
CREATE POLICY "Departments read access" ON public.departments FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Departments full access" ON public.departments;
CREATE POLICY "Departments full access" ON public.departments FOR ALL USING (auth.role() = 'authenticated');

-- Designations Policies
DROP POLICY IF EXISTS "Designations read access" ON public.designations;
CREATE POLICY "Designations read access" ON public.designations FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Designations full access" ON public.designations;
CREATE POLICY "Designations full access" ON public.designations FOR ALL USING (auth.role() = 'authenticated');

-- Staff Policies (with RBAC for salary)
DROP POLICY IF EXISTS "Staff read all fields" ON public.staff;
CREATE POLICY "Staff read all fields" ON public.staff FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Staff read limited" ON public.staff;
CREATE POLICY "Staff read limited" ON public.staff FOR SELECT 
    USING (
        NOT EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Staff full access" ON public.staff;
DROP POLICY IF EXISTS "Staff insert access" ON public.staff;
CREATE POLICY "Staff insert access" ON public.staff FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Staff update access" ON public.staff;
CREATE POLICY "Staff update access" ON public.staff FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Staff delete access" ON public.staff;
CREATE POLICY "Staff delete access" ON public.staff FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Insert default departments
INSERT INTO departments (name, code, description) VALUES
    ('Teaching', 'TEACH', 'Teaching Staff Department'),
    ('Administration', 'ADMIN', 'Administrative Staff'),
    ('Accounts', 'ACCT', 'Accounts & Finance'),
    ('Library', 'LIBR', 'Library Staff'),
    ('Sports', 'SPRT', 'Sports & Physical Education'),
    ('Transport', 'TRNS', 'Transport Department'),
    ('Hostel', 'HOST', 'Hostel Management'),
    ('Medical', 'MEDI', 'Medical & Health')
ON CONFLICT (name) DO NOTHING;

-- Insert default designations
INSERT INTO designations (name, code, department_id) 
SELECT name, code, id FROM departments
ON CONFLICT (name) DO NOTHING;

-- Storage Bucket for Staff Photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'staff-photos',
  'staff-photos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Allow authenticated read staff photos" ON storage.objects;
CREATE POLICY "Allow authenticated read staff photos" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'staff-photos');

DROP POLICY IF EXISTS "Allow authenticated upload staff photos" ON storage.objects;
CREATE POLICY "Allow authenticated upload staff photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'staff-photos');

DROP POLICY IF EXISTS "Allow authenticated update staff photos" ON storage.objects;
CREATE POLICY "Allow authenticated update staff photos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'staff-photos')
WITH CHECK (bucket_id = 'staff-photos');

DROP POLICY IF EXISTS "Allow authenticated delete staff photos" ON storage.objects;
CREATE POLICY "Allow authenticated delete staff photos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'staff-photos');