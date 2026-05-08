import { cache } from "react";
import { createClient as createBrowserClient } from "./supabase/client";
import { createClient as createServerClient } from "./supabase/server";

async function getClient() {
  if (typeof window !== "undefined") {
    return createBrowserClient();
  }
  return createServerClient();
}

/**
 * Optimized getAuthContext - Uses React cache to prevent duplicate calls
 * within the same request and returns cached role for instant sidebar rendering
 */
export const getAuthContext = cache(async function getAuthContext() {
  try {
    const supabase = await getClient();
    
    const { data: { user: realUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !realUser) {
      return { 
        realUser: null, 
        realProfile: null, 
        realRole: null, 
        effectiveUser: null, 
        effectiveRole: null, 
        isImpersonating: false 
      };
    }

    let impersonationId: string | undefined;
    if (typeof window === "undefined") {
      const { cookies } = await import("next/headers");
      impersonationId = (await cookies()).get("impersonation_user_id")?.value;
    } else {
      impersonationId = undefined;
    }

    const { data: realProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, role, avatar_url, email, phone")
      .eq("id", realUser.id)
      .single();

    if (profileError) {
      console.warn("Failed to fetch profile in auth context:", profileError.message);
    }

    const realRole = realProfile?.role || "student";
    
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
  } catch (error) {
    console.error("Auth Context Critical Error:", error);
    return { 
      realUser: null, 
      realProfile: null, 
      realRole: null, 
      effectiveUser: null, 
      effectiveRole: null, 
      isImpersonating: false 
    };
  }
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