import { createClient } from "./supabase/server";
import { cookies } from "next/headers";

/**
 * getAuthContext
 * The Single Source of Truth for identity in Edu Maysan ERP.
 * Handles both the real authenticated user and admin 'View As' mode.
 */
export async function getAuthContext() {
  const supabase = await createClient();
  const { data: { user: realUser } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  const impersonationId = cookieStore.get("impersonation_user_id")?.value;

  if (!realUser) {
      return { 
        realUser: null, 
        realProfile: null, 
        realRole: null, 
        effectiveUser: null, 
        effectiveRole: null, 
        isImpersonating: false 
    };
  }

  // Fetch profiles in parallel to reduce latency
  const [realProfileRes, impersonationProfileRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", realUser.id).single(),
    impersonationId 
      ? supabase.from("profiles").select("*").eq("id", impersonationId).single()
      : Promise.resolve({ data: null })
  ]);

  const realProfile = realProfileRes.data;
  const realRole = realProfile?.role;
  
  // Default: Effective is same as Real
  let effectiveUser = realProfile;
  let effectiveRole = realRole;
  let isImpersonating = false;

  // Security Logic: Only Admins can initiate impersonation mode
  if (impersonationId && realRole === 'admin') {
    const impersonationProfile = impersonationProfileRes.data;

    // Ensure the profile actually exists.
    if (impersonationProfile) {
      effectiveUser = impersonationProfile;
      effectiveRole = impersonationProfile.role;
      isImpersonating = true;
    }
  }

  return { 
    realUser, 
    realProfile,
    realRole, 
    effectiveUser, 
    effectiveRole, 
    isImpersonating 
  };
}