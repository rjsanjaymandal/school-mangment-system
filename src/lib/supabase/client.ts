import { createBrowserClient } from "@supabase/ssr";
import { wrapWithDemoProtection } from "./demo-protection";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key is missing!');
  }

  const client = createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );

  return wrapWithDemoProtection(client);
}
