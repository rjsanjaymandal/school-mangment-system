-- =====================================================
-- 🛡️ Fix Leave Requests Relationships
-- Adds missing foreign key constraints to leave_requests
-- =====================================================

-- 1. Add staff_id foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc 
        WHERE tc.constraint_name = 'leave_requests_staff_id_fkey' 
          AND tc.table_name = 'leave_requests'
    ) THEN
        ALTER TABLE public.leave_requests
        ADD CONSTRAINT leave_requests_staff_id_fkey
        FOREIGN KEY (staff_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Add approved_by foreign key constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc 
        WHERE tc.constraint_name = 'leave_requests_approved_by_fkey' 
          AND tc.table_name = 'leave_requests'
    ) THEN
        ALTER TABLE public.leave_requests
        ADD CONSTRAINT leave_requests_approved_by_fkey
        FOREIGN KEY (approved_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Reload schema cache
NOTIFY pgrst, 'reload schema';
