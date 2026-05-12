-- =====================================================
-- 🛡️ SECURITY PATCH: FIXING DATABASE LINTER WARNINGS
-- =====================================================

-- 1. FUNCTION SEARCH_PATH SECURITY
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.rpc_get_today_proxies() SET search_path = public;
ALTER FUNCTION public.generate_admission_number() SET search_path = public;
ALTER FUNCTION public.fn_auto_assign_proxy() SET search_path = public;
ALTER FUNCTION public.rpc_generate_optimized_schedule(UUID, UUID) SET search_path = public;
ALTER FUNCTION public.generate_staff_id() SET search_path = public;
ALTER FUNCTION public.rpc_get_teacher_load(UUID, TEXT) SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.get_fee_dashboard_stats(TEXT) SET search_path = public;
ALTER FUNCTION public.get_user_permissions(UUID) SET search_path = public;
ALTER FUNCTION public.has_permission(UUID, VARCHAR, VARCHAR) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.generate_voucher_no(TEXT) SET search_path = public;
ALTER FUNCTION public.process_monthly_salary(INTEGER, INTEGER) SET search_path = public;
ALTER FUNCTION public.rpc_check_schedule_conflicts(UUID) SET search_path = public;

-- 2. HELPER FUNCTION: auth_role()
-- SECURITY DEFINER bypasses RLS, preventing infinite recursion when
-- policies on the profiles table need to check the user's role.
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'student'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- 3. HARDENING OVERLY PERMISSIVE RLS POLICIES
-- Using auth_role() instead of subqueries to avoid recursion.

-- Exam Questions
DROP POLICY IF EXISTS "exam_questions_all" ON public.exam_questions;
DROP POLICY IF EXISTS "exam_questions_select" ON public.exam_questions;
DROP POLICY IF EXISTS "exam_questions_manage" ON public.exam_questions;
CREATE POLICY "exam_questions_select" ON public.exam_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "exam_questions_manage" ON public.exam_questions FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal', 'teacher'));

-- Library Books
DROP POLICY IF EXISTS "library_all" ON public.library_books;
DROP POLICY IF EXISTS "library_select" ON public.library_books;
DROP POLICY IF EXISTS "library_manage" ON public.library_books;
CREATE POLICY "library_select" ON public.library_books FOR SELECT TO authenticated USING (true);
CREATE POLICY "library_manage" ON public.library_books FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal', 'clerk'));

-- Library Transactions
DROP POLICY IF EXISTS "library_trans_all" ON public.library_transactions;
DROP POLICY IF EXISTS "library_trans_own" ON public.library_transactions;
DROP POLICY IF EXISTS "library_trans_manage" ON public.library_transactions;
CREATE POLICY "library_trans_own" ON public.library_transactions FOR SELECT TO authenticated 
    USING (student_id = auth.uid() OR public.auth_role() IN ('admin', 'principal', 'clerk'));
CREATE POLICY "library_trans_manage" ON public.library_transactions FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal', 'clerk'));

-- Notifications
DROP POLICY IF EXISTS "notifications_all" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_manage_admin" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated USING (sent_to = auth.uid());
CREATE POLICY "notifications_manage_admin" ON public.notifications FOR ALL TO authenticated 
    USING (public.auth_role() = 'admin');

-- Profiles
DROP POLICY IF EXISTS "profiles_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_auth" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_manage_admin" ON public.profiles;
CREATE POLICY "profiles_select_auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_manage_admin" ON public.profiles FOR ALL TO authenticated 
    USING (public.auth_role() = 'admin');

-- Staff
DROP POLICY IF EXISTS "staff_access" ON public.staff;
DROP POLICY IF EXISTS "staff_insert" ON public.staff;
DROP POLICY IF EXISTS "staff_update" ON public.staff;
DROP POLICY IF EXISTS "staff_delete" ON public.staff;
DROP POLICY IF EXISTS "staff_select_auth" ON public.staff;
DROP POLICY IF EXISTS "staff_manage_admin" ON public.staff;
CREATE POLICY "staff_select_auth" ON public.staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_manage_admin" ON public.staff FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal'));

-- Staff Attendance
DROP POLICY IF EXISTS "staff_attendance_all" ON public.staff_attendance;
DROP POLICY IF EXISTS "staff_attendance_select_own" ON public.staff_attendance;
DROP POLICY IF EXISTS "staff_attendance_manage_admin" ON public.staff_attendance;
CREATE POLICY "staff_attendance_select_own" ON public.staff_attendance FOR SELECT TO authenticated USING (staff_id = auth.uid());
CREATE POLICY "staff_attendance_manage_admin" ON public.staff_attendance FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal'));

-- Student Transport
DROP POLICY IF EXISTS "student_transport_all" ON public.student_transport;
DROP POLICY IF EXISTS "student_transport_select_auth" ON public.student_transport;
DROP POLICY IF EXISTS "student_transport_manage_admin" ON public.student_transport;
CREATE POLICY "student_transport_select_auth" ON public.student_transport FOR SELECT TO authenticated USING (true);
CREATE POLICY "student_transport_manage_admin" ON public.student_transport FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal'));

-- Subject Expertise
DROP POLICY IF EXISTS "subject_expertise_all" ON public.subject_expertise;
DROP POLICY IF EXISTS "subject_expertise_select_auth" ON public.subject_expertise;
DROP POLICY IF EXISTS "subject_expertise_manage_admin" ON public.subject_expertise;
CREATE POLICY "subject_expertise_select_auth" ON public.subject_expertise FOR SELECT TO authenticated USING (true);
CREATE POLICY "subject_expertise_manage_admin" ON public.subject_expertise FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal'));

-- Transport Routes & Vehicles
DROP POLICY IF EXISTS "transport_route_all" ON public.transport_routes;
DROP POLICY IF EXISTS "transport_route_select_auth" ON public.transport_routes;
DROP POLICY IF EXISTS "transport_route_manage_admin" ON public.transport_routes;
CREATE POLICY "transport_route_select_auth" ON public.transport_routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "transport_route_manage_admin" ON public.transport_routes FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal'));

DROP POLICY IF EXISTS "transport_all" ON public.transport_vehicles;
DROP POLICY IF EXISTS "transport_vehicle_select_auth" ON public.transport_vehicles;
DROP POLICY IF EXISTS "transport_vehicle_manage_admin" ON public.transport_vehicles;
CREATE POLICY "transport_vehicle_select_auth" ON public.transport_vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "transport_vehicle_manage_admin" ON public.transport_vehicles FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal'));

-- 4. GRAPHQL EXPOSURE: REVOKE ANON SELECT
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
    LOOP
        EXECUTE format('REVOKE SELECT ON public.%I FROM anon', tbl.tablename);
    END LOOP;
END $$;

-- 5. STORAGE BUCKET LISTING PREVENTION
DROP POLICY IF EXISTS "Allow authenticated read staff photos" ON storage.objects;
CREATE POLICY "Allow authenticated read staff photos" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'staff-photos' AND (storage.foldername(name))[1] IS NOT NULL);

DROP POLICY IF EXISTS "student_docs_read" ON storage.objects;
CREATE POLICY "student_docs_read" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'student-docs' AND (storage.foldername(name))[1] IS NOT NULL);

-- 6. LOCK DOWN auth_role from anon
REVOKE EXECUTE ON FUNCTION public.auth_role() FROM anon;
