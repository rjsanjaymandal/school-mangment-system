-- Fix user_roles table - Run this in Supabase SQL Editor

-- 1. Drop table completely
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- 2. Recreate without RLS
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role TEXT NOT NULL DEFAULT 'none',
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID,
    UNIQUE(user_id)
);

-- 3. Disable RLS
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 4. Grant permissions
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO anon;
GRANT ALL ON public.user_roles TO service_role;

-- 5. Fix staff table policies
ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff read all fields" ON public.staff;
DROP POLICY IF EXISTS "Staff read limited" ON public.staff;
DROP POLICY IF EXISTS "Staff insert access" ON public.staff;
DROP POLICY IF EXISTS "Staff update access" ON public.staff;
DROP POLICY IF EXISTS "Staff delete access" ON public.staff;

DROP POLICY IF EXISTS "staff_access" ON public.staff;
CREATE POLICY "staff_access" ON public.staff FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Fix profiles table policies
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles read all" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;

DROP POLICY IF EXISTS "profiles_access" ON public.profiles;
CREATE POLICY "profiles_access" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

SELECT 'All tables fixed!' as status;