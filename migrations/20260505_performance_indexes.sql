-- Performance Optimization Indexes
-- Run this in Supabase SQL Editor

-- 1. Class Enrollments
CREATE INDEX IF NOT EXISTS idx_class_enrollments_student_id ON public.class_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_class_enrollments_class_id ON public.class_enrollments(class_id);

-- 2. Attendance
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_class_id ON public.attendance(class_id);

-- 3. Timetables
CREATE INDEX IF NOT EXISTS idx_timetables_class_id ON public.timetables(class_id);
CREATE INDEX IF NOT EXISTS idx_timetables_day_of_week ON public.timetables(day_of_week);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_timetable_id ON public.timetable_slots(timetable_id);
CREATE INDEX IF NOT EXISTS idx_timetable_slots_teacher_id ON public.timetable_slots(teacher_id);

-- 4. Transactions (Accounts Module)
CREATE INDEX IF NOT EXISTS idx_transactions_related_staff_id ON public.transactions(related_staff_id);
CREATE INDEX IF NOT EXISTS idx_transactions_related_student_id ON public.transactions(related_student_id);

-- 5. User Roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
