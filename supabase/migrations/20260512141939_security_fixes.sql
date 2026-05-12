-- =====================================================
-- 🛡️ ADVANCED SECURITY PATCH: GRAPHQL & RPC HARDENING
-- Addresses Supabase Linter warnings 0026, 0027, 0028, 0029
-- =====================================================

-- 1. HIDE TABLES FROM GRAPHQL SCHEMA
-- Prevents unauthenticated/unauthorized users from scanning the database structure via GraphQL.
-- This does NOT affect the REST API used by the Next.js frontend.

DO $$
DECLARE
    tbl_name TEXT;
    target_tables TEXT[] := ARRAY[
        'academic_years', 'activities', 'alumni', 'attendance', 'audit_logs', 
        'bus_routes', 'bus_stops', 'bus_telemetry', 'certificates', 
        'class_enrollments', 'class_subjects', 'classes', 'departments', 
        'designations', 'document_archives', 'exam_questions', 'exams', 
        'fee_assignments', 'fee_heads', 'fee_payments', 'fee_structures', 
        'fees', 'guardian_students', 'health_profiles', 'impersonation_logs', 
        'infirmary_logs', 'inventory_categories', 'inventory_items', 
        'leave_requests', 'library_books', 'library_transactions', 'marks', 
        'messages', 'notifications', 'parents', 'payment_gateways', 
        'payments', 'payroll_history', 'performance_predictions', 
        'procurement_orders', 'profiles', 'role_permissions', 'salary_settings', 
        'school_assets', 'school_settings', 'staff', 'staff_attendance', 
        'staff_payroll', 'staff_payrolls', 'student_conduct', 'student_documents', 
        'student_transport', 'students', 'subject_expertise', 'subject_teachers', 
        'subjects', 'teachers', 'timetable_slots', 'timetables', 
        'transactions', 'transport_routes', 'transport_vehicles', 'user_roles'
    ];
    target_views TEXT[] := ARRAY[
        'current_cash_balance', 'monthly_financial_summary'
    ];
BEGIN
    -- Hide Tables
    FOREACH tbl_name IN ARRAY target_tables
    LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = tbl_name) THEN
            EXECUTE format('COMMENT ON TABLE public.%I IS ''@graphql({"expose": false})''', tbl_name);
        END IF;
    END LOOP;

    -- Hide Views
    FOREACH tbl_name IN ARRAY target_views
    LOOP
        IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = tbl_name) THEN
            EXECUTE format('COMMENT ON VIEW public.%I IS ''@graphql({"expose": false})''', tbl_name);
        END IF;
    END LOOP;
END $$;

-- 2. HARDEN SECURITY DEFINER FUNCTIONS
-- Revoking execute permission from PUBLIC/anon for sensitive system functions.

-- handle_new_user should only be called by the system (as a trigger)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- RBAC helper functions should not be callable by unauthenticated users
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_user_role(TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_permissions(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_permission(UUID, VARCHAR, VARCHAR) FROM anon;

-- Ensure authenticated users can still check their own roles if needed
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(UUID, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_permissions(UUID) TO authenticated;

-- 3. SEARCH PATH RE-VERIFICATION
-- Ensuring trigger functions are pinned to public schema
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.check_user_role(TEXT) SET search_path = public;

-- =====================================================
-- 🔐 MANUAL ACTION REQUIRED:
-- Go to Supabase Dashboard -> Auth Settings -> Security
-- Enable "Leaked Password Protection"
-- =====================================================
