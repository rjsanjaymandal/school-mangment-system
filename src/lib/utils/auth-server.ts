import { createClient } from "../supabase/server";
import { cookies } from "next/headers";

/**
 * Returns the active user ID for data fetching.
 * If an admin is impersonating a user, it returns the target user's ID.
 * Otherwise, it returns the authenticated user's ID.
 */
export async function getActiveUser() {
  const cookieStore = await cookies();
  const impersonationId = cookieStore.get("impersonation_user_id")?.value;

  if (impersonationId) {
    return impersonationId;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}
