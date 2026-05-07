-- =====================================================
-- AUTONOMOUS ENGINE DEMO DATA
-- This script populates data to demonstrate:
-- 1. Subject Expertise Requirements
-- 2. Staff Expertise & Load Management
-- 3. Auto-Substitution (Proxy) on Absence
-- 4. Load Balancing & Utilization Tracking
-- 5. Conflict Detection
-- =====================================================

DO $$
DECLARE
    v_ay_id UUID := 'a2222222-2222-4222-a222-222222222222';
    v_math_id UUID := '51111111-1111-4111-5111-111111111111';
    v_science_id UUID := '52222222-2222-4222-5222-222222222222';
    v_english_id UUID := '53333333-3333-4333-5333-333333333333';
    v_cs_id UUID := '55555555-5555-4555-5555-555555555555';
    
    v_class_10_id UUID := 'c1111111-1111-4111-c111-111111111111';
    v_class_11_id UUID := 'c2222222-2222-4222-c222-222222222222';
    
    v_teacher_aris_id UUID := 'f1111111-1111-4111-f111-111111111111';
    v_teacher_sarah_id UUID := 'f2222222-2222-4222-f222-222222222222';
    v_teacher_marcus_id UUID := 'f3333333-3333-4333-f333-333333333333';
    
    v_timetable_id UUID;
    v_today_name TEXT := TRIM(TO_CHAR(CURRENT_DATE, 'Day'));
BEGIN
    -- 1. Ensure Staff Records exist in the new staff table (from legacy teachers)
    -- This is already handled by migration, but let's ensure specific values for demo
    UPDATE public.staff 
    SET expertise_tags = ARRAY['math', 'science', 'physics'], 
        proficiency_level = 9,
        max_daily_hours = 4, -- Set low to show overload easily
        status = 'active'
    WHERE id = v_teacher_aris_id;

    UPDATE public.staff 
    SET expertise_tags = ARRAY['english', 'literature', 'history'], 
        proficiency_level = 8,
        max_daily_hours = 6,
        status = 'active'
    WHERE id = v_teacher_sarah_id;

    UPDATE public.staff 
    SET expertise_tags = ARRAY['cs', 'programming', 'math'], 
        proficiency_level = 7,
        max_daily_hours = 6,
        status = 'active'
    WHERE id = v_teacher_marcus_id;

    -- 2. Define Subject Expertise Requirements
    INSERT INTO public.subject_expertise (subject_id, required_tags, proficiency_required)
    VALUES 
        (v_math_id, ARRAY['math'], 5),
        (v_science_id, ARRAY['science'], 5),
        (v_english_id, ARRAY['english'], 4),
        (v_cs_id, ARRAY['cs'], 6)
    ON CONFLICT (subject_id) DO UPDATE SET
        required_tags = EXCLUDED.required_tags,
        proficiency_required = EXCLUDED.proficiency_required;

    -- 3. Create Timetable headers if they don't exist
    INSERT INTO public.timetables (id, class_id, academic_year_id, day_of_week)
    SELECT uuid_generate_v4(), v_class_10_id, v_ay_id, d
    FROM unnest(ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']) d
    WHERE NOT EXISTS (
        SELECT 1 FROM public.timetables 
        WHERE class_id = v_class_10_id AND academic_year_id = v_ay_id AND day_of_week = d
    );

    -- 4. Populate Monday Slots for Grade 10
    SELECT id INTO v_timetable_id FROM public.timetables 
    WHERE class_id = v_class_10_id AND day_of_week = 'Monday';

    -- Clear existing slots to have a clean demo for Monday
    DELETE FROM public.timetable_slots WHERE timetable_id = v_timetable_id;

    INSERT INTO public.timetable_slots (timetable_id, subject_id, teacher_id, start_time, end_time, room_number)
    VALUES 
        (v_timetable_id, v_math_id, v_teacher_aris_id, '08:00', '09:00', 'R-101'),
        (v_timetable_id, v_science_id, v_teacher_aris_id, '09:00', '10:00', 'R-101'),
        (v_timetable_id, v_english_id, v_teacher_sarah_id, '10:00', '11:00', 'R-101'),
        -- Unfilled slot for auto-generation test
        (v_timetable_id, v_cs_id, NULL, '11:00', '12:00', 'R-101');

    -- 5. Conflict Test: Double booking Aris on Monday at 08:00 in Grade 11
    INSERT INTO public.timetables (id, class_id, academic_year_id, day_of_week)
    VALUES (uuid_generate_v4(), v_class_11_id, v_ay_id, 'Monday')
    ON CONFLICT DO NOTHING;

    SELECT id INTO v_timetable_id FROM public.timetables 
    WHERE class_id = v_class_11_id AND day_of_week = 'Monday';

    INSERT INTO public.timetable_slots (timetable_id, subject_id, teacher_id, start_time, end_time, room_number)
    VALUES (v_timetable_id, v_math_id, v_teacher_aris_id, '08:00', '09:00', 'R-201')
    ON CONFLICT DO NOTHING;

    -- 6. Proxy/Substitution Test: Mark Sarah as Absent Today
    -- This will trigger the auto-substitution for any slots Sarah has TODAY
    
    -- Ensure Sarah has a slot today
    SELECT id INTO v_timetable_id FROM public.timetables 
    WHERE class_id = v_class_10_id AND day_of_week = v_today_name;

    IF v_timetable_id IS NOT NULL THEN
        -- Add a slot for Sarah today if it doesn't exist
        INSERT INTO public.timetable_slots (timetable_id, subject_id, teacher_id, start_time, end_time, room_number)
        VALUES (v_timetable_id, v_english_id, v_teacher_sarah_id, '14:00', '15:00', 'R-101')
        ON CONFLICT DO NOTHING;

        -- Now mark her absent for today
        INSERT INTO public.staff_attendance (staff_id, date, status, remarks)
        VALUES (v_teacher_sarah_id, CURRENT_DATE, 'absent', 'Demo: Sarah is sick today')
        ON CONFLICT (staff_id, date) DO UPDATE SET status = 'absent';
        
        -- The trigger 'trg_auto_proxy' will now run and assign a proxy for the 14:00 slot.
    END IF;

    -- 7. Overload Test: Assign Aris 5 slots on Wednesday (Max is 4)
    SELECT id INTO v_timetable_id FROM public.timetables 
    WHERE class_id = v_class_10_id AND day_of_week = 'Wednesday';

    DELETE FROM public.timetable_slots WHERE timetable_id = v_timetable_id AND teacher_id = v_teacher_aris_id;
    
    INSERT INTO public.timetable_slots (timetable_id, subject_id, teacher_id, start_time, end_time)
    VALUES 
        (v_timetable_id, v_math_id, v_teacher_aris_id, '08:00', '09:00'),
        (v_timetable_id, v_math_id, v_teacher_aris_id, '09:00', '10:00'),
        (v_timetable_id, v_math_id, v_teacher_aris_id, '10:00', '11:00'),
        (v_timetable_id, v_math_id, v_teacher_aris_id, '11:00', '12:00'),
        (v_timetable_id, v_math_id, v_teacher_aris_id, '12:00', '13:00');

END $$;
