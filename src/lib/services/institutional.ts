import { createClient } from "@/lib/supabase/client";
import { profileSchema, academicYearSchema, classSchema } from "../validations";
import { handleServiceError } from "../error-handler";
import { z } from "zod";

/**
 * Institutional Service Layer
 * Abstracts Supabase calls and enforces Zod validation.
 */
export const InstitutionalService = {
  // --- Profile Operations ---
  async getProfile(userId: string) {
    try {
      const supabase = createClient();
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
  async getCurrentAcademicYear() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("academic_years")
        .select("*")
        .eq("is_current", true)
        .single();

      if (error) throw error;
      return academicYearSchema.parse(data);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getClasses(academicYearId: string) {
    try {
      const supabase = createClient();
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
  async getFeeStatus(studentId: string) {
    try {
      const supabase = createClient();
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

  async getStudents() {
    try {
      const supabase = createClient();
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

  async getTeachers() {
    try {
      const supabase = createClient();
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
  setupRealtimeMessages(userId: string, callback: (payload: any) => void) {
    const supabase = createClient();
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
