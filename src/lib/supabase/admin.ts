import { createClient } from '@supabase/supabase-js';
import { wrapWithDemoProtection } from './demo-protection';

export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase admin credentials (SUPABASE_SERVICE_ROLE_KEY) are required');
  }

  // Create a Supabase client with the Service Role Key to bypass RLS
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  return wrapWithDemoProtection(client);
}
