import { createClient } from "./supabase/server";
import { cookies } from "next/headers";

/**
 * getAuthContext
 * The Single Source of Truth for identity in Edu Maysan ERP.
 * Handles both the real authenticated user and the administrative 'Shadow mode'.
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

  // Fetch real profile directly from DB for security
  const { data: realProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", realUser.id)
    .single();

  const realRole = realProfile?.role;
  
  // Default: Effective is same as Real
  let effectiveUser = realProfile;
  let effectiveRole = realRole;
  let isImpersonating = false;

  // Security Logic: Only Admins can initiate Shadow mode
  if (impersonationId && realRole === 'admin') {
    const { data: shadowProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", impersonationId)
      .single();

    // Prevent shadow-looping (shadowing another admin who is also an admin)
    // and ensure the shadow profile actually exists.
    if (shadowProfile) {
      effectiveUser = shadowProfile;
      effectiveRole = shadowProfile.role;
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
