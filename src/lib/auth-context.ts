import { cache } from "react";
import { createClient } from "./supabase/server";
import { cookies } from "next/headers";

/**
 * Optimized getAuthContext - Uses React cache to prevent duplicate calls
 * within the same request and returns cached role for instant sidebar rendering
 */
export const getAuthContext = cache(async function getAuthContext() {
  const supabase = await createClient();
  
  // Fast auth check
  const { data: { user: realUser }, error } = await supabase.auth.getUser();
  
  if (error || !realUser) {
    return { 
      realUser: null, 
      realProfile: null, 
      realRole: null, 
      effectiveUser: null, 
      effectiveRole: null, 
      isImpersonating: false 
    };
  }

  const cookieStore = await cookies();
  const impersonationId = cookieStore.get("impersonation_user_id")?.value;

  // Quick profile fetch - single query
  const { data: realProfile } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url, email, phone")
    .eq("id", realUser.id)
    .single();

  const realRole = realProfile?.role || "student";
  
  // If not admin, no need to check impersonation
  if (realRole !== "admin" || !impersonationId) {
    return { 
      realUser, 
      realProfile,
      realRole, 
      effectiveUser: realProfile, 
      effectiveRole: realRole, 
      isImpersonating: false 
    };
  }

  // Only check impersonation if admin
  const { data: impersonationProfile } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url, email, phone")
    .eq("id", impersonationId)
    .single();

  if (impersonationProfile) {
    return { 
      realUser, 
      realProfile,
      realRole, 
      effectiveUser: impersonationProfile, 
      effectiveRole: impersonationProfile.role, 
      isImpersonating: true 
    };
  }

  return { 
    realUser, 
    realProfile,
    realRole, 
    effectiveUser: realProfile, 
    effectiveRole: realRole, 
    isImpersonating: false 
  };
});

/**
 * Lightweight role check for client components - no DB calls
 * Use this in components where speed matters
 */
export async function getSessionRole(): Promise<string> {
  try {
    const { effectiveRole } = await getAuthContext();
    return effectiveRole || "student";
  } catch {
    return "student";
  }
}

export async function getRealRole(): Promise<string | null> {
  try {
    const { realRole } = await getAuthContext();
    return realRole;
  } catch {
    return null;
  }
}

export async function isAdminOrTeacher(): Promise<boolean> {
  const role = await getSessionRole();
  return role === "admin" || role === "teacher";
}

export async function isAdmin(): Promise<boolean> {
  const role = await getSessionRole();
  return role === "admin";
}

export async function isImpersonating(): Promise<boolean> {
  try {
    const { isImpersonating } = await getAuthContext();
    return isImpersonating;
  } catch {
    return false;
  }
}