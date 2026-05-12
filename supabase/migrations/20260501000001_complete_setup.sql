-- =====================================================
-- EDU MAYSAN ERP - COMPLETE DATABASE MIGRATION
-- =====================================================

-- Run this in Supabase SQL Editor to set up all tables

-- =====================================================
-- 1. NOTIFICATIONS TABLE
-- =====================================================
DROP TABLE IF EXISTS public.notifications;

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    recipient_type TEXT DEFAULT 'all',
    is_read BOOLEAN DEFAULT FALSE,
    sent_to UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_all" ON public.notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 2. LIBRARY TABLES
-- =====================================================
DROP TABLE IF EXISTS public.library_transactions;
DROP TABLE IF EXISTS public.library_books;

CREATE TABLE public.library_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,
    isbn TEXT,
    category TEXT DEFAULT 'General',
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    shelf_location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.library_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES public.library_books(id),
    student_id UUID REFERENCES public.students(id),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status TEXT DEFAULT 'issued',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "library_all" ON public.library_books FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "library_trans_all" ON public.library_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 3. TRANSPORT TABLES
-- =====================================================
DROP TABLE IF EXISTS public.student_transport;
DROP TABLE IF EXISTS public.transport_routes;
DROP TABLE IF EXISTS public.transport_vehicles;

CREATE TABLE public.transport_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_number TEXT NOT NULL,
    vehicle_type TEXT,
    capacity INTEGER DEFAULT 30,
    driver_name TEXT,
    driver_phone TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.transport_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_name TEXT NOT NULL,
    start_point TEXT,
    end_point TEXT,
    stops TEXT[],
    fare DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.student_transport (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id),
    route_id UUID REFERENCES public.transport_routes(id),
    stop_name TEXT,
    pickup_time TEXT,
    drop_time TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transport_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_transport ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transport_all" ON public.transport_vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "transport_route_all" ON public.transport_routes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "student_transport_all" ON public.student_transport FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 4. EXAM QUESTIONS TABLE
-- =====================================================
DROP TABLE IF EXISTS public.exam_questions;

CREATE TABLE public.exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id),
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice',
    options TEXT[],
    correct_answer TEXT,
    marks INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exam_questions_all" ON public.exam_questions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 5. STAFF ATTENDANCE TABLE (for proxy auto-assignment)
-- =====================================================
DROP TABLE IF EXISTS public.staff_attendance;

CREATE TABLE public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'on_leave', 'late', 'half_day')),
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    notes TEXT,
    marked_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, date)
);

ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_attendance_all" ON public.staff_attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 6. USER ROLES TABLE (fixed - no RLS recursion)
-- =====================================================
DROP TABLE IF EXISTS public.user_roles;

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'none' CHECK (role IN ('admin', 'principal', 'teacher', 'clerk', 'receptionist', 'student', 'parent', 'none')),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID,
    UNIQUE(user_id)
);

ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO anon;
GRANT ALL ON public.user_roles TO service_role;

-- =====================================================
-- 7. SUBJECT EXPERTISE TABLE
-- =====================================================
DROP TABLE IF EXISTS public.subject_expertise;

CREATE TABLE public.subject_expertise (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    required_tags TEXT[] DEFAULT '{}',
    proficiency_required INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(subject_id)
);

ALTER TABLE public.subject_expertise ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subject_expertise_all" ON public.subject_expertise FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 8. ADD COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add expertise columns to staff table
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS expertise_tags TEXT[] DEFAULT '{}';
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS proficiency_level INTEGER DEFAULT 5 CHECK (proficiency_level BETWEEN 1 AND 10);
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS max_daily_hours INTEGER DEFAULT 6;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS max_weekly_hours INTEGER DEFAULT 30;

-- Add proxy columns to timetable_slots
ALTER TABLE public.timetable_slots ADD COLUMN IF NOT EXISTS is_proxy BOOLEAN DEFAULT FALSE;
ALTER TABLE public.timetable_slots ADD COLUMN IF NOT EXISTS original_teacher_id UUID REFERENCES public.staff(id);
ALTER TABLE public.timetable_slots ADD COLUMN IF NOT EXISTS proxy_reason TEXT;
ALTER TABLE public.timetable_slots ADD COLUMN IF NOT EXISTS auto_assigned BOOLEAN DEFAULT FALSE;

-- =====================================================
-- 9. AUTO-SUBSTITUTION TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION public.fn_auto_assign_proxy()
RETURNS TRIGGER AS $$
DECLARE
    v_date DATE;
    v_day TEXT;
    v_slot RECORD;
    v_best_teacher UUID;
BEGIN
    IF NEW.status IN ('absent', 'on_leave') AND (OLD.status IS NULL OR OLD.status NOT IN ('absent', 'on_leave')) THEN
        v_date := NEW.date;
        v_day := TRIM(TO_CHAR(v_date, 'Day'));
        
        FOR v_slot IN 
            SELECT ts.id, ts.start_time, ts.end_time, ts.class_id, ts.subject_id
            FROM timetable_slots ts
            JOIN timetables t ON t.id = ts.timetable_id
            WHERE ts.teacher_id = NEW.staff_id
            AND t.day_of_week = v_day
            AND ts.is_proxy = FALSE
        LOOP
            -- Find teacher with matching expertise who is free
            SELECT s.id INTO v_best_teacher
            FROM staff s
            WHERE s.id != NEW.staff_id
            AND s.status = 'active'
            AND s.staff_type = 'teaching'
            AND NOT EXISTS (
                SELECT 1 FROM timetable_slots ts2
                JOIN timetables t2 ON t2.id = ts2.timetable_id
                WHERE ts2.teacher_id = s.id
                AND t2.day_of_week = v_day
                AND ts2.start_time < v_slot.end_time
                AND ts2.end_time > v_slot.start_time
            )
            AND NOT EXISTS (
                SELECT 1 FROM staff_attendance sa
                WHERE sa.staff_id = s.id
                AND sa.date = v_date
                AND sa.status IN ('absent', 'on_leave')
            )
            ORDER BY s.proficiency_level DESC
            LIMIT 1;

            IF v_best_teacher IS NOT NULL THEN
                UPDATE timetable_slots
                SET is_proxy = TRUE,
                    original_teacher_id = NEW.staff_id,
                    proxy_reason = 'Auto-substituted due to ' || NEW.status,
                    teacher_id = v_best_teacher,
                    auto_assigned = TRUE
                WHERE id = v_slot.id;
            END IF;
        END LOOP;
    END IF;

    -- Reverse proxy if returning
    IF OLD.status IN ('absent', 'on_leave') AND NEW.status = 'present' THEN
        UPDATE timetable_slots
        SET teacher_id = original_teacher_id,
            is_proxy = FALSE,
            original_teacher_id = NULL,
            proxy_reason = NULL,
            auto_assigned = FALSE
        WHERE original_teacher_id = NEW.staff_id
        AND is_proxy = TRUE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_proxy ON public.staff_attendance;
CREATE TRIGGER trg_auto_proxy
    AFTER INSERT OR UPDATE ON public.staff_attendance
    FOR EACH ROW
    EXECUTE FUNCTION fn_auto_assign_proxy();

-- =====================================================
-- 10. SAMPLE DATA
-- =====================================================

-- Sample library books
INSERT INTO library_books (title, author, isbn, category, total_copies, available_copies, shelf_location) VALUES
('Mathematics for Class X', 'R.D. Sharma', '978-93-52623-45-6', 'Mathematics', 5, 5, 'A-101'),
('Science for Class X', 'Lakhmir Singh', '978-93-52623-45-7', 'Science', 3, 3, 'A-102'),
('English Core X', 'Writers Choice', '978-93-52623-45-8', 'English', 4, 4, 'B-201'),
('History of India', 'Bipin Chandra', '978-93-52623-45-9', 'History', 2, 2, 'C-301'),
('Computer Science', 'Sumita Arora', '978-93-52623-46-0', 'Computer', 3, 3, 'D-401'),
('Physics Class XII', 'HC Verma', '978-93-52623-46-1', 'Physics', 3, 3, 'A-103'),
('Chemistry Class XII', 'O.P. Tandon', '978-93-52623-46-2', 'Chemistry', 3, 3, 'A-104')
ON CONFLICT DO NOTHING;

-- Sample transport vehicles
INSERT INTO transport_vehicles (vehicle_number, vehicle_type, capacity, driver_name, driver_phone, status) VALUES
('HR-01-BUS', 'Bus', 50, 'Mohammad Khan', '9876543210', 'active'),
('HR-02-BUS', 'Bus', 45, 'Raj Kumar', '9876543211', 'active'),
('HR-03-VAN', 'Van', 15, 'Amit Singh', '9876543212', 'active'),
('HR-04-BUS', 'Bus', 40, 'Praveen Sharma', '9876543213', 'active')
ON CONFLICT DO NOTHING;

-- Sample transport routes
INSERT INTO transport_routes (route_name, start_point, end_point, stops, fare) VALUES
('Route 1 - South', 'School', 'Sector 15', ARRAY['Stop 1 - Metro Station', 'Stop 2 - Park', 'Stop 3 - Market'], 500),
('Route 2 - North', 'School', 'Sector 22', ARRAY['Stop A - Colony Gate', 'Stop B - Main Road', 'Stop C - School'], 450),
('Route 3 - East', 'School', 'Old City', ARRAY['Market Square', 'Railway Station', 'Bus Stand'], 600),
('Route 4 - West', 'School', 'Airport Area', ARRAY['Terminal 1', 'Terminal 2', 'Hotel Zone'], 700)
ON CONFLICT DO NOTHING;

-- Update existing staff with default expertise
UPDATE staff 
SET 
    expertise_tags = COALESCE(expertise_tags, ARRAY['teaching']),
    proficiency_level = COALESCE(proficiency_level, 5),
    max_daily_hours = COALESCE(max_daily_hours, 6),
    max_weekly_hours = COALESCE(max_weekly_hours, 30)
WHERE staff_type = 'teaching'
AND (expertise_tags IS NULL OR array_length(expertise_tags, 1) IS NULL);

SELECT '✅ All tables created successfully!' as status;