-- =====================================================
-- AUTONOMOUS SCHEDULING & SUBSTITUTION ENGINE
-- =====================================================

-- 1. Update Staff Table with Expertise & Load Management
ALTER TABLE public.staff 
ADD COLUMN IF NOT EXISTS expertise_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS proficiency_level INTEGER DEFAULT 5 CHECK (proficiency_level BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS max_daily_hours INTEGER DEFAULT 6,
ADD COLUMN IF NOT EXISTS max_weekly_hours INTEGER DEFAULT 30;

-- 2. Update Timetable Slots with Proxy Support
ALTER TABLE public.timetable_slots 
ADD COLUMN IF NOT EXISTS is_proxy BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS original_teacher_id UUID REFERENCES public.staff(id),
ADD COLUMN IF NOT EXISTS proxy_reason TEXT,
ADD COLUMN IF NOT EXISTS auto_assigned BOOLEAN DEFAULT FALSE;

-- DATA MIGRATION: Ensure all existing teachers have a record in the staff table
-- We use the legacy teacher ID (from profiles) as the staff.id to maintain compatibility
INSERT INTO public.staff (id, user_id, first_name, last_name, staff_type, status, staff_id)
SELECT 
    t.id, 
    (SELECT u.id FROM auth.users u WHERE u.id = t.id), -- Only link if user exists in auth.users
    COALESCE(split_part(p.full_name, ' ', 1), 'Teacher'),
    COALESCE(split_part(p.full_name, ' ', 2), 'Staff'),
    'teaching',
    'active',
    'EMP-' || floor(random() * 8999 + 1000)::text
FROM public.teachers t
JOIN public.profiles p ON p.id = t.id
WHERE NOT EXISTS (SELECT 1 FROM public.staff s WHERE s.id = t.id)
ON CONFLICT (id) DO UPDATE SET 
    user_id = EXCLUDED.user_id,
    staff_type = 'teaching'
WHERE staff.user_id IS NULL;

-- Ensure teacher_id references staff instead of teachers table
ALTER TABLE public.timetable_slots 
DROP CONSTRAINT IF EXISTS timetable_slots_teacher_id_fkey;

ALTER TABLE public.timetable_slots 
ADD CONSTRAINT timetable_slots_teacher_id_fkey 
FOREIGN KEY (teacher_id) REFERENCES public.staff(id) ON DELETE SET NULL;

-- 3. Staff Attendance Table for Real-Time Availability
CREATE TABLE IF NOT EXISTS public.staff_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'on_leave', 'late', 'half_day')),
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    notes TEXT,
    marked_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, date)
);

-- Enable RLS
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Staff attendance all access" ON public.staff_attendance;
CREATE POLICY "Staff attendance all access" ON public.staff_attendance 
    FOR ALL USING (auth.role() = 'authenticated');

-- 4. Subject Expertise Mapping Table
CREATE TABLE IF NOT EXISTS public.subject_expertise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    required_tags TEXT[] DEFAULT '{}',
    proficiency_required INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(subject_id)
);

-- 5. Trigger Function: Auto-Substitution on Absence
CREATE OR REPLACE FUNCTION public.fn_auto_assign_proxy()
RETURNS TRIGGER AS $$
DECLARE
    v_date DATE;
    v_day TEXT;
    v_conflict_slots TIMESTAMP[];
    v_eligible_teachers UUID[];
    v_best_teacher UUID;
    v_teacher_load INTEGER;
    v_slot RECORD;
BEGIN
    -- Only trigger on status change to absent or on_leave
    IF NEW.status IN ('absent', 'on_leave') AND (OLD.status IS NULL OR OLD.status NOT IN ('absent', 'on_leave')) THEN
        v_date := NEW.date;
        
        -- Get day of week
        v_day := TO_CHAR(v_date, 'Day');
        
        -- Find all slots for this teacher on this day
        FOR v_slot IN 
            SELECT ts.id, ts.start_time, ts.end_time, ts.class_id, ts.subject_id
            FROM timetable_slots ts
            JOIN timetables t ON t.id = ts.timetable_id
            WHERE ts.teacher_id = NEW.staff_id
            AND t.day_of_week = TRIM(v_day)
            AND ts.is_proxy = FALSE
        LOOP
            -- Step A: Find teachers with matching expertise for this subject
            SELECT ARRAY_AGG(s.id ORDER BY s.proficiency_level DESC)
            INTO v_eligible_teachers
            FROM staff s
            WHERE s.id != NEW.staff_id
            AND s.status = 'active'
            AND s.staff_type = 'teaching'
            AND s.expertise_tags && (
                SELECT COALESCE(required_tags, '{}')
                FROM subject_expertise se
                WHERE se.subject_id = v_slot.subject_id
            )
            AND NOT EXISTS (
                -- Must not have conflict in same time slot
                SELECT 1 FROM timetable_slots ts2
                JOIN timetables t2 ON t2.id = ts2.timetable_id
                WHERE ts2.teacher_id = s.id
                AND t2.day_of_week = TRIM(v_day)
                AND ts2.start_time < v_slot.end_time
                AND ts2.end_time > v_slot.start_time
            )
            AND NOT EXISTS (
                -- Must not be absent/on_leave
                SELECT 1 FROM staff_attendance sa
                WHERE sa.staff_id = s.id
                AND sa.date = v_date
                AND sa.status IN ('absent', 'on_leave')
            );

            -- If expert found, use them; otherwise find lowest load teacher
            IF array_length(v_eligible_teachers, 1) > 0 THEN
                v_best_teacher := v_eligible_teachers[1];
            ELSE
                -- Fallback: Find teacher with lowest daily load
                SELECT s.id INTO v_best_teacher
                FROM staff s
                WHERE s.id != NEW.staff_id
                AND s.status = 'active'
                AND s.staff_type = 'teaching'
                AND NOT EXISTS (
                    SELECT 1 FROM timetable_slots ts2
                    JOIN timetables t2 ON t2.id = ts2.timetable_id
                    WHERE ts2.teacher_id = s.id
                    AND t2.day_of_week = TRIM(v_day)
                    AND ts2.start_time < v_slot.end_time
                    AND ts2.end_time > v_slot.start_time
                )
                AND NOT EXISTS (
                    SELECT 1 FROM staff_attendance sa
                    WHERE sa.staff_id = s.id
                    AND sa.date = v_date
                    AND sa.status IN ('absent', 'on_leave')
                )
                ORDER BY (
                    SELECT COUNT(*) FROM timetable_slots ts3
                    JOIN timetables t3 ON t3.id = ts3.timetable_id
                    WHERE ts3.teacher_id = s.id AND t3.day_of_week = TRIM(v_day)
                ) ASC
                LIMIT 1;
            END IF;

            -- Update slot with proxy assignment
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

    -- Reverse proxy assignments if teacher returns
    IF OLD.status IN ('absent', 'on_leave') AND NEW.status = 'present' THEN
        v_date := NEW.date;
        v_day := TO_CHAR(v_date, 'Day');
        
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

-- Trigger
DROP TRIGGER IF EXISTS trg_auto_proxy ON public.staff_attendance;
CREATE TRIGGER trg_auto_proxy
    AFTER INSERT OR UPDATE ON public.staff_attendance
    FOR EACH ROW
    EXECUTE FUNCTION fn_auto_assign_proxy();

-- 6. RPC: Generate Optimized Schedule
CREATE OR REPLACE FUNCTION public.rpc_generate_optimized_schedule(
    p_academic_year_id UUID,
    p_class_id UUID DEFAULT NULL
)
RETURNS TABLE(
    slot_id UUID,
    class_name TEXT,
    day_of_week TEXT,
    subject_name TEXT,
    assigned_teacher TEXT,
    was_filled BOOLEAN,
    assignment_method TEXT
) AS $$
DECLARE
    v_slot RECORD;
    v_eligible_teachers UUID[];
    v_best_teacher UUID;
    v_teacher_load INTEGER;
    v_subject_tags TEXT[];
BEGIN
    -- Get all unfilled slots
    FOR v_slot IN
        SELECT ts.id, ts.subject_id, t.class_id, t.day_of_week, ts.start_time, ts.end_time
        FROM timetable_slots ts
        JOIN timetables t ON t.id = ts.timetable_id
        WHERE t.academic_year_id = p_academic_year_id
        AND (p_class_id IS NULL OR t.class_id = p_class_id)
        AND ts.teacher_id IS NULL
        AND ts.auto_assigned = FALSE
        ORDER BY t.day_of_week, ts.start_time
    LOOP
        -- Get subject expertise requirements
        SELECT COALESCE(required_tags, '{}'), se.proficiency_required
        INTO v_subject_tags, v_teacher_load
        FROM subject_expertise se
        WHERE se.subject_id = v_slot.subject_id;

        -- Find best teacher based on expertise
        SELECT s.id, s.proficiency_level
        INTO v_best_teacher, v_teacher_load
        FROM staff s
        WHERE s.status = 'active'
        AND s.staff_type = 'teaching'
        AND (s.expertise_tags && v_subject_tags OR array_length(v_subject_tags, 1) = 0)
        AND (
            SELECT COUNT(*)::INTEGER
            FROM timetable_slots ts2
            JOIN timetables t2 ON t2.id = ts2.timetable_id
            WHERE ts2.teacher_id = s.id
            AND t2.day_of_week = v_slot.day_of_week
            AND ts2.start_time < v_slot.end_time
            AND ts2.end_time > v_slot.start_time
        ) < s.max_daily_hours
        ORDER BY 
            CASE WHEN s.expertise_tags && v_subject_tags THEN 0 ELSE 1 END,
            (
                SELECT COUNT(*)::INTEGER
                FROM timetable_slots ts3
                JOIN timetables t3 ON t3.id = ts3.timetable_id
                WHERE ts3.teacher_id = s.id
                AND t3.day_of_week = v_slot.day_of_week
            ) ASC,
            s.proficiency_level DESC
        LIMIT 1;

        -- Update slot if teacher found and return result
        IF v_best_teacher IS NOT NULL THEN
            UPDATE timetable_slots
            SET teacher_id = v_best_teacher,
                auto_assigned = TRUE
            WHERE id = v_slot.id;

            RETURN QUERY 
            SELECT v_slot.id, c.name, v_slot.day_of_week, sub.name, p.full_name, TRUE, 'Expertise Match'::TEXT
            FROM subjects sub
            JOIN classes c ON c.id = v_slot.class_id
            JOIN staff p ON p.id = v_best_teacher
            WHERE sub.id = v_slot.subject_id;
        ELSE
            RETURN QUERY 
            SELECT v_slot.id, c.name, v_slot.day_of_week, sub.name, NULL::TEXT, FALSE, 'No Eligible Teacher'::TEXT
            FROM subjects sub
            JOIN classes c ON c.id = v_slot.class_id
            WHERE sub.id = v_slot.subject_id;
        END IF;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- 7. RPC: Get Teacher Load Summary
CREATE OR REPLACE FUNCTION public.rpc_get_teacher_load(
    p_academic_year_id UUID,
    p_day_of_week TEXT DEFAULT NULL
)
RETURNS TABLE(
    teacher_id UUID,
    teacher_name TEXT,
    daily_hours INTEGER,
    max_daily_hours INTEGER,
    weekly_hours INTEGER,
    max_weekly_hours INTEGER,
    utilization_pct INTEGER,
    is_overloaded BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        COALESCE(p.full_name, s.first_name || ' ' || s.last_name)::TEXT,
        COALESCE(daily.total_hours, 0)::INTEGER,
        s.max_daily_hours,
        COALESCE(weekly.total_hours, 0)::INTEGER,
        s.max_weekly_hours,
        LEAST(100, (COALESCE(daily.total_hours, 0)::FLOAT / NULLIF(s.max_daily_hours, 0)::FLOAT * 100))::INTEGER,
        (COALESCE(daily.total_hours, 0) > s.max_daily_hours)::BOOLEAN
    FROM staff s
    LEFT JOIN profiles p ON p.id = s.user_id
    LEFT JOIN LATERAL (
        SELECT COUNT(*) * 1 as total_hours
        FROM timetable_slots ts
        JOIN timetables t ON t.id = ts.timetable_id
        WHERE ts.teacher_id = s.id
        AND t.academic_year_id = p_academic_year_id
        AND (p_day_of_week IS NULL OR t.day_of_week = p_day_of_week)
    ) daily ON TRUE
    LEFT JOIN LATERAL (
        SELECT COUNT(*) * 1 as total_hours
        FROM timetable_slots ts
        JOIN timetables t ON t.id = ts.timetable_id
        WHERE ts.teacher_id = s.id
        AND t.academic_year_id = p_academic_year_id
    ) weekly ON TRUE
    WHERE s.status = 'active'
    AND s.staff_type = 'teaching'
    ORDER BY daily.total_hours DESC;
END;
$$ LANGUAGE plpgsql;

-- 8. RPC: Check Schedule Conflicts
CREATE OR REPLACE FUNCTION public.rpc_check_schedule_conflicts(
    p_academic_year_id UUID
)
RETURNS TABLE(
    conflict_type TEXT,
    teacher_id UUID,
    teacher_name TEXT,
    class_name TEXT,
    day_of_week TEXT,
    time_slot TEXT,
    details TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Teacher double-booking conflicts
    SELECT 
        'Teacher Overlap'::TEXT,
        ts.teacher_id,
        COALESCE(p.full_name, s.first_name)::TEXT,
        c.name,
        t.day_of_week,
        ts.start_time || ' - ' || ts.end_time,
        'Teacher assigned to multiple classes simultaneously'
    FROM timetable_slots ts
    JOIN timetables t ON t.id = ts.timetable_id
    JOIN classes c ON c.id = t.class_id
    JOIN staff s ON s.id = ts.teacher_id
    LEFT JOIN profiles p ON p.id = s.user_id
    WHERE t.academic_year_id = p_academic_year_id
    AND ts.teacher_id IS NOT NULL
    AND EXISTS (
        SELECT 1 FROM timetable_slots ts2
        JOIN timetables t2 ON t2.id = ts2.timetable_id
        WHERE ts2.teacher_id = ts.teacher_id
        AND t2.day_of_week = t.day_of_week
        AND ts2.start_time < ts.end_time
        AND ts2.end_time > ts.start_time
        AND ts2.id != ts.id
    )
    ORDER BY t.day_of_week, ts.start_time;
END;
$$ LANGUAGE plpgsql;

-- 9. RPC: Get Today Proxy Assignments
CREATE OR REPLACE FUNCTION public.rpc_get_today_proxies()
RETURNS TABLE(
    original_teacher TEXT,
    proxy_teacher TEXT,
    class_name TEXT,
    subject_name TEXT,
    time_slot TEXT,
    reason TEXT
) AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_day TEXT;
BEGIN
    v_day := TO_CHAR(v_today, 'Day');

    RETURN QUERY
    SELECT 
        COALESCE(p1.full_name, s1.first_name)::TEXT as original_teacher,
        COALESCE(p2.full_name, s2.first_name)::TEXT as proxy_teacher,
        c.name as class_name,
        sub.name as subject_name,
        ts.start_time || ' - ' || ts.end_time as time_slot,
        ts.proxy_reason as reason
    FROM timetable_slots ts
    JOIN timetables t ON t.id = ts.timetable_id
    JOIN classes c ON c.id = t.class_id
    JOIN subjects sub ON sub.id = ts.subject_id
    JOIN staff s1 ON s1.id = ts.original_teacher_id
    LEFT JOIN profiles p1 ON p1.id = s1.user_id
    JOIN staff s2 ON s2.id = ts.teacher_id
    LEFT JOIN profiles p2 ON p2.id = s2.user_id
    WHERE t.day_of_week = TRIM(v_day)
    AND ts.is_proxy = TRUE;
END;
$$ LANGUAGE plpgsql;

-- 10. Seed Sample Data for Testing
INSERT INTO subject_expertise (subject_id, required_tags, proficiency_required)
SELECT id, ARRAY['science', 'physics'], 5
FROM subjects WHERE LOWER(name) LIKE '%physics%'
ON CONFLICT (subject_id) DO NOTHING;

INSERT INTO subject_expertise (subject_id, required_tags, proficiency_required)
SELECT id, ARRAY['mathematics', 'math'], 5
FROM subjects WHERE LOWER(name) LIKE '%math%'
ON CONFLICT (subject_id) DO NOTHING;

INSERT INTO subject_expertise (subject_id, required_tags, proficiency_required)
SELECT id, ARRAY['english', 'language'], 3
FROM subjects WHERE LOWER(name) LIKE '%english%'
ON CONFLICT (subject_id) DO NOTHING;

-- Update existing staff with default values (if needed)
UPDATE staff 
SET expertise_tags = ARRAY['teaching'],
    proficiency_level = 5,
    max_daily_hours = 6,
    max_weekly_hours = 30
WHERE staff_type = 'teaching'
AND expertise_tags IS NULL OR array_length(expertise_tags, 1) IS NULL;