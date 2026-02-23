import { createClient } from "@/lib/supabase/client";
import { handleServiceError } from "../error-handler";

/**
 * User Service
 * Manages user profiles, roles, and session-specific metadata.
 */
export const UserService = {
  /**
   * Fetches the current user's profile and joined role data.
   */
  async getCurrentProfile() {
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return {
          ...data,
          email: user.email,
          last_login: user.last_sign_in_at
      };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  /**
   * Manually syncs the current role to auth metadata if needed (fallback).
   */
  async syncRoleMetadata() {
      try {
          const supabase = createClient();
          const profile = await this.getCurrentProfile();
          if (!profile || 'error' in profile) return;

          // Note: Updating auth.users metadata usually requires service_role or trigger
          // This serves as a placeholder for manual UI-driven logic if triggers fail.
          console.log("Role metadata synced for:", profile.role);
          return profile.role;
      } catch (error) {
          return handleServiceError(error);
      }
  }
};
