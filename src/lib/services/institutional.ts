import { SupabaseClient } from "@supabase/supabase-js";
import { createClient as defaultClient } from "@/lib/supabase/client";
import { profileSchema, academicYearSchema, classSchema } from "../validations";
import { handleServiceError } from "../error-handler";
import { z } from "zod";

/**
 * Institutional Service Layer
 * Abstracts Supabase calls and enforces Zod validation.
 */
export const InstitutionalService = {
  // --- Profile Operations ---
  async getProfile(userId: string, clientOverride?: SupabaseClient) {
    try {
      const supabase = clientOverride || defaultClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return profileSchema.parse(data);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  // --- Academic Operations ---
  async getCurrentAcademicYear(clientOverride?: SupabaseClient) {
    try {
      const supabase = clientOverride || defaultClient();
      const { data, error } = await supabase
        .from("academic_years")
        .select("*")
        .eq("is_current", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { error: "No active academic year found" };
      return academicYearSchema.parse(data);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getClasses(academicYearId: string, clientOverride?: SupabaseClient) {
    try {
      const supabase = clientOverride || defaultClient();
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("academic_year_id", academicYearId);

      if (error) throw error;
      return z.array(classSchema).parse(data);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  // --- Finance Operations ---
  async getFeeStatus(studentId: string, clientOverride?: SupabaseClient) {
    try {
      const supabase = clientOverride || defaultClient();
      const { data, error } = await supabase
        .from("fee_payments")
        .select("*")
        .eq("student_id", studentId);

      if (error) throw error;
      return (data || []);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getStudents(clientOverride?: SupabaseClient) {
    try {
      const supabase = clientOverride || defaultClient();
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          profile:profiles(*),
          class:classes(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getStudentById(id: string, clientOverride?: SupabaseClient) {
    try {
      const supabase = clientOverride || defaultClient();
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          profile:profiles(*),
          class:classes(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getTeachers(clientOverride?: SupabaseClient) {
    try {
      const supabase = clientOverride || defaultClient();
      const { data, error } = await supabase
        .from("teachers")
        .select(`
          *,
          profile:profiles(*)
        `)
        .order("joining_date", { ascending: false });

      if (error) throw error;
      return (data || []);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  // --- Real-time Hooks (Setup) ---
  setupRealtimeMessages(userId: string, callback: (payload: any) => void, clientOverride?: SupabaseClient) {
    const supabase = clientOverride || defaultClient();
    return supabase
      .channel(`user-messages-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` },
        callback
      )
      .subscribe();
  }
};
