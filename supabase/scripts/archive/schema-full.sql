-- =====================================================
-- EduFox School ERP — Complete Database Schema
-- Phase 1: All missing tables + RLS policies
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ACADEMIC YEARS (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. SUBJECTS (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CLASSES (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    capacity INT,
    room_number TEXT,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. EXAMS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    date DATE,
    start_time TIME,
    end_time TIME,
    max_marks DECIMAL(5,2) DEFAULT 100,
    passing_marks DECIMAL(5,2) DEFAULT 40,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. MARKS / RESULTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    marks_obtained DECIMAL(5,2) NOT NULL DEFAULT 0,
    max_marks DECIMAL(5,2) NOT NULL DEFAULT 100,
    grade TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, student_id, subject_id)
);

-- =====================================================
-- 6. ATTENDANCE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    remarks TEXT,
    marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date)
);

-- =====================================================
-- 7. TIMETABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, academic_year_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS public.timetable_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timetable_id UUID REFERENCES public.timetables(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. FEES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    description TEXT,
    fee_type TEXT DEFAULT 'tuition' CHECK (fee_type IN ('tuition', 'transport', 'library', 'lab', 'sports', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. PAYMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    fee_id UUID REFERENCES public.fees(id) ON DELETE SET NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'upi', 'bank_transfer', 'cheque', 'online')),
    transaction_id TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed', 'refunded')),
    receipt_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. STAFF PAYROLL
-- =====================================================
CREATE TABLE IF NOT EXISTS public.staff_payrolls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    base_salary DECIMAL(10,2) NOT NULL,
    bonuses DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    net_pay DECIMAL(10,2) GENERATED ALWAYS AS (base_salary + bonuses - deductions) STORED,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, month, year)
);

-- =====================================================
-- 11. LEAVE REQUESTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    leave_type TEXT NOT NULL CHECK (leave_type IN ('sick', 'casual', 'earned', 'maternity', 'paternity', 'unpaid')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 12. LIBRARY BOOKS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.library_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT,
    category TEXT,
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    shelf_location TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'issued', 'lost', 'damaged')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 13. LIBRARY TRANSACTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.library_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES public.library_books(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    fine_amount DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'overdue', 'lost')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 14. BUS ROUTES (Transport)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bus_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    route_number TEXT UNIQUE,
    driver_name TEXT,
    driver_phone TEXT,
    plate_number TEXT,
    capacity INT DEFAULT 40,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 15. BUS STOPS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bus_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID REFERENCES public.bus_routes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    pickup_time TIME,
    drop_time TIME,
    stop_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 16. STUDENT TRANSPORT ASSIGNMENT
-- =====================================================
CREATE TABLE IF NOT EXISTS public.student_transport (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    route_id UUID REFERENCES public.bus_routes(id) ON DELETE SET NULL,
    stop_id UUID REFERENCES public.bus_stops(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id)
);

-- =====================================================
-- 17. HEALTH PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.health_profiles (
    id UUID PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
    blood_group TEXT,
    allergies TEXT[],
    chronic_conditions TEXT[],
    medications TEXT[],
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    insurance_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 18. INFIRMARY LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.infirmary_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    visit_reason TEXT NOT NULL,
    symptoms TEXT,
    treatment_provided TEXT,
    medication_given TEXT,
    temperature DECIMAL(4,1),
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    status TEXT DEFAULT 'under_observation' CHECK (status IN ('under_observation', 'discharged', 'referral')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 19. STUDENT CONDUCT
-- =====================================================
CREATE TABLE IF NOT EXISTS public.student_conduct (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('merit', 'demerit')),
    points INT NOT NULL DEFAULT 0,
    category TEXT NOT NULL CHECK (category IN ('Discipline', 'Academics', 'Sports', 'Leadership', 'Community', 'Other')),
    description TEXT,
    incident_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 20. MESSAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    subject TEXT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 21. INVENTORY ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT,
    quantity_in_stock INT DEFAULT 0,
    unit_price DECIMAL(10,2) DEFAULT 0,
    sku TEXT UNIQUE,
    min_stock_level INT DEFAULT 5,
    location TEXT,
    supplier TEXT,
    status TEXT DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 22. DOCUMENT ARCHIVES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.document_archives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Academic' CHECK (category IN ('Legal', 'Academic', 'HR', 'Financial', 'Administrative')),
    file_path TEXT,
    file_size BIGINT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    expiry_date DATE,
    version INT DEFAULT 1,
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 23. AUDIT LOGS
-- =====================================================
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

-- =====================================================
-- 24. GUARDIAN / PARENT LINKS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.guardian_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guardian_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    relationship TEXT DEFAULT 'parent' CHECK (relationship IN ('parent', 'guardian', 'relative', 'other')),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guardian_id, student_id)
);

-- =====================================================
-- 25. NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 27. PAYMENT GATEWAYS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payment_gateways (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'financial', 'lms', etc.
    is_active BOOLEAN DEFAULT true,
    api_key TEXT,
    secret_key TEXT,
    webhook_secret TEXT,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 28. SCHOOL SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.school_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.school_settings (key, value, category) VALUES
    ('school_name', 'EduFox Academy', 'general'),
    ('school_address', '', 'general'),
    ('school_phone', '', 'general'),
    ('school_email', '', 'general'),
    ('academic_year', '', 'academic'),
    ('currency', 'INR', 'finance'),
    ('late_fee_per_day', '50', 'finance'),
    ('library_fine_per_day', '5', 'library'),
    ('max_books_per_student', '3', 'library')
ON CONFLICT (key) DO NOTHING;


-- =====================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT unnest(ARRAY[
            'academic_years', 'subjects', 'classes', 'exams', 'marks',
            'attendance', 'timetables', 'timetable_slots',
            'fees', 'payments', 'staff_payrolls', 'leave_requests',
            'library_books', 'library_transactions',
            'bus_routes', 'bus_stops', 'student_transport',
            'health_profiles', 'infirmary_logs', 'student_conduct',
            'messages', 'inventory_items', 'document_archives',
            'audit_logs', 'guardian_students', 'notifications', 'school_settings',
            'payment_gateways'
        ])
    LOOP
        EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY', tbl);
        
        -- Public read policy
        EXECUTE format('DROP POLICY IF EXISTS "allow_public_read_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "allow_public_read_%s" ON public.%I FOR SELECT USING (true)', tbl, tbl);
        
        -- Authenticated write policy
        EXECUTE format('DROP POLICY IF EXISTS "allow_auth_write_%s" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "allow_auth_write_%s" ON public.%I FOR ALL USING (auth.role() = ''authenticated'')', tbl, tbl);
    END LOOP;
END $$;

-- Messages: Only sender/receiver can read their own messages
DROP POLICY IF EXISTS "allow_public_read_messages" ON public.messages;
CREATE POLICY "messages_own_read" ON public.messages FOR SELECT
    USING (sender_id = auth.uid() OR receiver_id = auth.uid() OR auth.role() = 'authenticated');

-- Notifications: Users can only see their own
DROP POLICY IF EXISTS "allow_public_read_notifications" ON public.notifications;
CREATE POLICY "notifications_own_read" ON public.notifications FOR SELECT
    USING (user_id = auth.uid() OR auth.role() = 'authenticated');
