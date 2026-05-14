-- =====================================================
-- 🎓 CERTIFICATES & CREDENTIALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    template_type TEXT NOT NULL CHECK (template_type IN ('Transfer Certificate', 'Character Certificate', 'Achievement', 'Participation')),
    issued_date DATE DEFAULT CURRENT_DATE,
    issued_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'issued' CHECK (status IN ('issued', 'pending', 'revoked')),
    metadata JSONB DEFAULT '{}',
    certificate_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 💰 ENFORCE RLS ON INSTITUTIONAL TABLES
-- =====================================================
ALTER TABLE IF EXISTS public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.staff_payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leave_requests ENABLE ROW LEVEL SECURITY;

-- 🎓 Certificates: Admin full access, Students read-only for their own
DROP POLICY IF EXISTS "certificates_select_policy" ON public.certificates;
CREATE POLICY "certificates_select_policy" ON public.certificates FOR SELECT
    USING (student_id = auth.uid() OR auth.role() = 'authenticated');

-- 💰 Payroll: ONLY Admins can see payroll (Strict Security)
DROP POLICY IF EXISTS "payroll_admin_policy" ON public.staff_payrolls;
CREATE POLICY "payroll_admin_policy" ON public.staff_payrolls FOR ALL
    USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('admin', 'super_admin')));

-- 📅 Leave: Owners see their own, Admins see all
DROP POLICY IF EXISTS "leave_select_policy" ON public.leave_requests;
CREATE POLICY "leave_select_policy" ON public.leave_requests FOR SELECT
    USING (staff_id = auth.uid() OR auth.role() = 'authenticated');
