import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database at the admin level
// This bypasses RLS and should only be used in secure, server-side code.
export const createAdminClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}
