-- =====================================================
-- EDU MAYSAN ERP - COMPREHENSIVE RECONCILIATION MIGRATION
-- Migration: 20260604000001_reconcile_core_schema_and_rpcs.sql
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. PROFILES & USER ROLES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'principal', 'teacher', 'clerk', 'receptionist', 'student', 'parent', 'guardian')),
    assigned_by UUID,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- 2. ACADEMIC FOUNDATION
-- =====================================================
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    description TEXT,
    credits INT DEFAULT 1,
    type TEXT DEFAULT 'core' CHECK (type IN ('core', 'elective', 'optional')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    section TEXT,
    capacity INT DEFAULT 40,
    room_number TEXT,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    admission_number TEXT UNIQUE NOT NULL,
    roll_number TEXT,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    date_of_birth DATE,
    gender TEXT,
    blood_group TEXT,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred', 'graduated')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    specialization TEXT[],
    qualification TEXT,
    joining_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.class_subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, subject_id)
);

CREATE TABLE IF NOT EXISTS public.class_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    roll_number TEXT,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- =====================================================
-- 3. EXAMS, MARKS & ATTENDANCE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS public.marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused', 'half_day')),
    remarks TEXT,
    marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, date)
);

CREATE TABLE IF NOT EXISTS public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused', 'half_day')),
    check_in TIME,
    check_out TIME,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, date)
);

-- =====================================================
-- 4. TIMETABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, academic_year_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS public.timetable_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timetable_id UUID REFERENCES public.timetables(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. FEES, PAYMENTS & FINANCIAL LEDGER
-- =====================================================
CREATE TABLE IF NOT EXISTS public.parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    father_name TEXT,
    mother_name TEXT,
    father_phone TEXT,
    mother_phone TEXT,
    father_occupation TEXT,
    mother_occupation TEXT,
    annual_income DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.guardian_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guardian_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.parents(id) ON DELETE SET NULL,
    relationship TEXT DEFAULT 'parent' CHECK (relationship IN ('parent', 'guardian', 'relative', 'other')),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(guardian_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    description TEXT,
    fee_type TEXT DEFAULT 'tuition' CHECK (fee_type IN ('tuition', 'transport', 'library', 'lab', 'sports', 'examination', 'annual', 'other')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fee_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    frequency TEXT DEFAULT 'monthly',
    due_date DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fee_heads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fee_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    fee_id UUID REFERENCES public.fees(id) ON DELETE CASCADE,
    fee_structure_id UUID REFERENCES public.fee_structures(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'waived')),
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, fee_id)
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    fee_id UUID REFERENCES public.fees(id) ON DELETE SET NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'upi', 'bank_transfer', 'cheque', 'online')),
    transaction_id TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed', 'refunded')),
    receipt_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fee_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    fee_id UUID REFERENCES public.fees(id) ON DELETE CASCADE,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'completed'
);

-- Financial Ledger / Day Book Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'fee_payment', 'salary_payout', 'refund')),
    amount DECIMAL(12,2) NOT NULL,
    category TEXT,
    payment_method TEXT DEFAULT 'cash',
    reference_id UUID,
    reference_type TEXT,
    description TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. HR & PAYROLL
-- =====================================================
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE,
    description TEXT,
    head_of_department UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.designations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL UNIQUE,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    base_salary DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    designation_id UUID REFERENCES public.designations(id) ON DELETE SET NULL,
    date_of_joining DATE DEFAULT CURRENT_DATE,
    qualification TEXT,
    experience_years INT DEFAULT 0,
    emergency_contact TEXT,
    bank_account_no TEXT,
    bank_name TEXT,
    ifsc_code TEXT,
    pan_number TEXT,
    aadhar_number TEXT,
    last_login_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'terminated')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.staff_payrolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS public.payroll_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    month INT NOT NULL,
    year INT NOT NULL,
    basic_salary DECIMAL(10,2) NOT NULL,
    allowances DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'processed',
    payment_date DATE,
    payment_method TEXT,
    payslip_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, month, year)
);

CREATE TABLE IF NOT EXISTS public.salary_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    basic_salary DECIMAL(10,2) NOT NULL,
    hra_percentage DECIMAL(5,2) DEFAULT 0,
    da_percentage DECIMAL(5,2) DEFAULT 0,
    allowances DECIMAL(10,2) DEFAULT 0,
    tax_deduction DECIMAL(10,2) DEFAULT 0,
    pf_deduction DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
-- 7. LIBRARY
-- =====================================================
CREATE TABLE IF NOT EXISTS public.library_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS public.library_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
-- 8. TRANSPORT
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bus_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    route_number TEXT UNIQUE,
    driver_name TEXT,
    driver_phone TEXT,
    plate_number TEXT,
    capacity INT DEFAULT 40,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bus_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES public.bus_routes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    pickup_time TIME,
    drop_time TIME,
    stop_order INT DEFAULT 0,
    fare DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_transport (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    route_id UUID REFERENCES public.bus_routes(id) ON DELETE SET NULL,
    stop_id UUID REFERENCES public.bus_stops(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id)
);

CREATE TABLE IF NOT EXISTS public.transport_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_number TEXT NOT NULL,
    vehicle_type TEXT,
    capacity INTEGER DEFAULT 30,
    driver_name TEXT,
    driver_phone TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. INVENTORY & PROCUREMENT
-- =====================================================
CREATE TABLE IF NOT EXISTS public.inventory_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT,
    category_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
    quantity_in_stock INT DEFAULT 0,
    unit_price DECIMAL(10,2) DEFAULT 0,
    sku TEXT UNIQUE,
    min_stock_level INT DEFAULT 5,
    location TEXT,
    supplier TEXT,
    status TEXT DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.procurement_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    total_cost DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'ordered' CHECK (status IN ('draft', 'ordered', 'received', 'cancelled')),
    order_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. COMPLIANCE & DOCUMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.document_archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Academic' CHECK (category IN ('Legal', 'Academic', 'HR', 'Financial', 'Administrative')),
    file_path TEXT,
    file_size BIGINT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    expiry_date DATE,
    version INT DEFAULT 1,
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. COMMS & NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sent_to UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    body TEXT,
    type TEXT DEFAULT 'info',
    recipient_type TEXT DEFAULT 'all',
    priority TEXT DEFAULT 'normal',
    channel TEXT DEFAULT 'all',
    status TEXT DEFAULT 'sent',
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS sent_to UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'all';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link TEXT;

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    subject TEXT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 12. GATEWAYS & SETTINGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payment_gateways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    api_key TEXT,
    secret_key TEXT,
    webhook_secret TEXT,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.school_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.school_settings (key, value, category) VALUES
    ('school_name', 'EduFox Academy', 'general'),
    ('school_address', '', 'general'),
    ('school_phone', '', 'general'),
    ('school_email', '', 'general'),
    ('academic_year', '', 'academic'),
    ('currency', 'INR', 'finance'),
    ('late_fee_per_day', '50', 'finance'),
    ('library_fine_per_day', '5', 'library'),
    ('max_books_per_student', '3', 'library'),
    ('smtp_host', '', 'email'),
    ('smtp_port', '587', 'email'),
    ('smtp_user', '', 'email'),
    ('smtp_pass', '', 'email'),
    ('smtp_from', 'noreply@edumaysan.com', 'email')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 13. HEALTH, INFIRMARY & CONDUCT
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

CREATE TABLE IF NOT EXISTS public.infirmary_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS public.student_conduct (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('merit', 'demerit')),
    points INT NOT NULL DEFAULT 0,
    category TEXT NOT NULL CHECK (category IN ('Discipline', 'Academics', 'Sports', 'Leadership', 'Community', 'Other')),
    description TEXT,
    incident_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 14. STORED PROCEDURE: get_fee_collection_data
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_fee_collection_data(
    p_search TEXT DEFAULT '',
    p_limit INT DEFAULT 10,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    student_id UUID,
    admission_number TEXT,
    student_name TEXT,
    father_name TEXT,
    class_name TEXT,
    total_due DECIMAL,
    total_paid DECIMAL,
    outstanding_balance DECIMAL,
    total_count BIGINT
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH raw_data AS (
        SELECT 
            s.id AS student_id,
            s.admission_number,
            COALESCE(pr.full_name, pr.first_name || ' ' || COALESCE(pr.last_name, ''), 'Unknown') AS student_name,
            COALESCE(p.father_name, 'N/A') AS father_name,
            COALESCE(c.name, 'Unassigned') AS class_name,
            COALESCE((
                SELECT SUM(COALESCE(fa.final_amount, fa.amount, fs.amount))
                FROM fee_assignments fa
                LEFT JOIN fees fs ON fs.id = fa.fee_id
                WHERE fa.student_id = s.id
            ), (
                SELECT SUM(fs.amount)
                FROM fees fs
                WHERE fs.class_id = s.class_id
            ), 0) AS total_due,
            COALESCE((
                SELECT SUM(pay.amount_paid)
                FROM payments pay
                WHERE pay.student_id = s.id AND pay.status = 'completed'
            ), 0) AS total_paid
        FROM students s
        LEFT JOIN profiles pr ON pr.id = s.id
        LEFT JOIN classes c ON c.id = s.class_id
        LEFT JOIN guardian_students gs ON gs.student_id = s.id
        LEFT JOIN parents p ON p.id = gs.parent_id
        WHERE 
            (p_search = '' OR 
             s.admission_number ILIKE '%' || p_search || '%' OR
             pr.full_name ILIKE '%' || p_search || '%' OR
             p.father_name ILIKE '%' || p_search || '%')
    ),
    counted_data AS (
        SELECT COUNT(*) AS exact_count FROM raw_data
    )
    SELECT 
        r.student_id::UUID,
        r.admission_number::TEXT,
        r.student_name::TEXT,
        r.father_name::TEXT,
        r.class_name::TEXT,
        r.total_due::DECIMAL,
        r.total_paid::DECIMAL,
        (r.total_due - r.total_paid)::DECIMAL AS outstanding_balance,
        c.exact_count::BIGINT AS total_count
    FROM raw_data r
    CROSS JOIN counted_data c
    ORDER BY r.student_name ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 15. ROW LEVEL SECURITY POLICIES
-- =====================================================
DO $$
DECLARE
    tbl TEXT;
    table_list TEXT[] := ARRAY[
        'profiles', 'user_roles', 'academic_years', 'subjects', 'classes', 'students', 'teachers',
        'class_subjects', 'class_enrollments', 'exams', 'marks', 'attendance', 'staff_attendance',
        'timetables', 'timetable_slots', 'parents', 'guardian_students', 'fees', 'fee_structures',
        'fee_heads', 'fee_assignments', 'payments', 'fee_payments', 'transactions',
        'departments', 'designations', 'staff', 'staff_payrolls', 'payroll_history', 'salary_settings', 'leave_requests',
        'library_books', 'library_transactions', 'bus_routes', 'bus_stops', 'student_transport', 'transport_vehicles',
        'inventory_categories', 'inventory_items', 'procurement_orders', 'document_archives',
        'notifications', 'messages', 'payment_gateways', 'school_settings',
        'health_profiles', 'infirmary_logs', 'student_conduct'
    ];
BEGIN
    FOREACH tbl IN ARRAY table_list
    LOOP
        IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
            
            -- Idempotent read policy
            EXECUTE format('DROP POLICY IF EXISTS "%s_select_all" ON public.%I', tbl, tbl);
            EXECUTE format('CREATE POLICY "%s_select_all" ON public.%I FOR SELECT USING (true)', tbl, tbl);
            
            -- Idempotent insert/update/delete policies for authenticated users
            EXECUTE format('DROP POLICY IF EXISTS "%s_insert_auth" ON public.%I', tbl, tbl);
            EXECUTE format('CREATE POLICY "%s_insert_auth" ON public.%I FOR INSERT WITH CHECK (true)', tbl, tbl);
            
            EXECUTE format('DROP POLICY IF EXISTS "%s_update_auth" ON public.%I', tbl, tbl);
            EXECUTE format('CREATE POLICY "%s_update_auth" ON public.%I FOR UPDATE USING (true) WITH CHECK (true)', tbl, tbl);
            
            EXECUTE format('DROP POLICY IF EXISTS "%s_delete_auth" ON public.%I', tbl, tbl);
            EXECUTE format('CREATE POLICY "%s_delete_auth" ON public.%I FOR DELETE USING (true)', tbl, tbl);
        END IF;
    END LOOP;
END $$;
