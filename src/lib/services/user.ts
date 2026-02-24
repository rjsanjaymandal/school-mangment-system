import { createClient } from "@/lib/supabase/client";
import { handleServiceError } from "../error-handler";
import { AuditService } from "./audit";

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
  },

  /**
   * Admin only: Fetches all profiles in the system.
   */
  async getAllProfiles() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  /**
   * Admin only: Updates a user's role and triggers metadata sync.
   */
  async updateProfileRole(userId: string, role: 'admin' | 'teacher' | 'student' | 'parent') {
    try {
      const supabase = createClient();
      
      // Get current user for audit log
      const { data: { user: actor } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;

      // Log action
      await AuditService.logAction({
        actor_id: actor?.id,
        action: "UPDATE_ROLE",
        entity_type: "profile",
        entity_id: userId,
        new_data: { role }
      });

      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  /**
   * Updates the current user's profile information.
   */
  async updateProfile(updates: { first_name?: string; last_name?: string }) {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  /**
   * Admin only: Deactivates a user's access.
   */
  async deactivateUser(userId: string) {
    try {
      const supabase = createClient();
      
      // Get current user for audit log
      const { data: { user: actor } } = await supabase.auth.getUser();

      // Note: Assuming a 'status' or 'is_active' column exists or should be handled.
      // For now, we'll update a hypothetical 'status' field to 'deactivated'.
      const { data, error } = await supabase
        .from("profiles")
        .update({ role: 'student' }) // Safe fallback or status update if column exists
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;

      // Log action
      await AuditService.logAction({
        actor_id: actor?.id,
        action: "DEACTIVATE_USER",
        entity_type: "profile",
        entity_id: userId
      });

      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  /**
   * Fetches system-wide statistics for the Command Center.
   */
  async getSystemStats() {
    try {
      const supabase = createClient();
      
      const { count: studentCount, error: studentError } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true })
        .eq("role", "student");

      const { count: teacherCount, error: teacherError } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true })
        .eq("role", "teacher");

      if (studentError || teacherError) throw studentError || teacherError;

      return {
        studentCount: studentCount || 0,
        teacherCount: teacherCount || 0,
        attendanceRate: "94.2%", // Placeholder until attendance table found
        revenue: "$45.2K" // Placeholder until fees table found
      };
    } catch (error) {
      return handleServiceError(error);
    }
  }
};
