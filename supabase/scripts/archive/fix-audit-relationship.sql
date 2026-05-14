-- 🛡️ Edu Maysan ERP | Corrected Audit Log Relationship
-- This script correctly links audit logs to user profiles via the 'actor_id' field.

-- 1. Ensure the audit_logs table exists with the correct structure
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB DEFAULT '{}',
    new_data JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Safely add missing columns if the table existed but was incomplete
DO $$
BEGIN
    -- Ensure actor_id exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='actor_id') THEN
        ALTER TABLE public.audit_logs ADD COLUMN actor_id UUID REFERENCES public.profiles(id);
    END IF;

    -- Ensure entity_type exists (renaming from entity if needed)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='entity_type') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='audit_logs' AND column_name='entity') THEN
            ALTER TABLE public.audit_logs RENAME COLUMN entity TO entity_type;
        ELSE
            ALTER TABLE public.audit_logs ADD COLUMN entity_type TEXT;
        END IF;
    END IF;

    -- Add the foreign key constraint if missing
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_actor_id_fkey') THEN
        ALTER TABLE public.audit_logs 
        ADD CONSTRAINT audit_logs_actor_id_fkey 
        FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Enable RLS and establish policies
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
