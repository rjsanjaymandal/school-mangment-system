-- Create a helper function that bypasses RLS to check the user's role
-- SECURITY DEFINER means this function runs as the DB owner, bypassing RLS
CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'student'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Fix the recursive profiles policy
DROP POLICY IF EXISTS "profiles_manage_admin" ON public.profiles;
CREATE POLICY "profiles_manage_admin" ON public.profiles FOR ALL TO authenticated
    USING (public.auth_role() = 'admin');

-- Fix profiles_update_own (safe, no recursion)
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Now update ALL other policies that use the subquery pattern to use auth_role() instead
-- This prevents recursion if any policy on profiles is ever evaluated

-- Exam Questions
DROP POLICY IF EXISTS "exam_questions_manage" ON public.exam_questions;
CREATE POLICY "exam_questions_manage" ON public.exam_questions FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal', 'teacher'));

-- Library Books
DROP POLICY IF EXISTS "library_manage" ON public.library_books;
CREATE POLICY "library_manage" ON public.library_books FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal', 'clerk'));

-- Library Transactions
DROP POLICY IF EXISTS "library_trans_own" ON public.library_transactions;
CREATE POLICY "library_trans_own" ON public.library_transactions FOR SELECT TO authenticated 
    USING (student_id = auth.uid() OR public.auth_role() IN ('admin', 'principal', 'clerk'));
DROP POLICY IF EXISTS "library_trans_manage" ON public.library_transactions;
CREATE POLICY "library_trans_manage" ON public.library_transactions FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal', 'clerk'));

-- Notifications
DROP POLICY IF EXISTS "notifications_manage_admin" ON public.notifications;
CREATE POLICY "notifications_manage_admin" ON public.notifications FOR ALL TO authenticated 
    USING (public.auth_role() = 'admin');

-- Staff
DROP POLICY IF EXISTS "staff_manage_admin" ON public.staff;
CREATE POLICY "staff_manage_admin" ON public.staff FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal'));

-- Staff Attendance
DROP POLICY IF EXISTS "staff_attendance_manage_admin" ON public.staff_attendance;
CREATE POLICY "staff_attendance_manage_admin" ON public.staff_attendance FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal'));

-- Student Transport
DROP POLICY IF EXISTS "student_transport_manage_admin" ON public.student_transport;
CREATE POLICY "student_transport_manage_admin" ON public.student_transport FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal'));

-- Subject Expertise
DROP POLICY IF EXISTS "subject_expertise_manage_admin" ON public.subject_expertise;
CREATE POLICY "subject_expertise_manage_admin" ON public.subject_expertise FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal'));

-- Transport Routes
DROP POLICY IF EXISTS "transport_route_manage_admin" ON public.transport_routes;
CREATE POLICY "transport_route_manage_admin" ON public.transport_routes FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal'));

-- Transport Vehicles
DROP POLICY IF EXISTS "transport_vehicle_manage_admin" ON public.transport_vehicles;
CREATE POLICY "transport_vehicle_manage_admin" ON public.transport_vehicles FOR ALL TO authenticated 
    USING (public.auth_role() IN ('admin', 'principal'));

-- Revoke anon from auth_role to prevent unauthenticated use
REVOKE EXECUTE ON FUNCTION public.auth_role() FROM anon;
