-- Fix fn_auto_assign_proxy to use t.class_id instead of ts.class_id
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
            SELECT ts.id, ts.start_time, ts.end_time, t.class_id, ts.subject_id
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
