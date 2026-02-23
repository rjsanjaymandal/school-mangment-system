import { createClient } from "@/lib/supabase/client";
import { profileSchema, academicYearSchema, classSchema } from "../validations";
import { z } from "zod";

/**
 * Institutional Service Layer
 * Abstracts Supabase calls and enforces Zod validation.
 */
export const InstitutionalService = {
  // --- Profile Operations ---
  async getProfile(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return profileSchema.parse(data);
  },

  // --- Academic Operations ---
  async getCurrentAcademicYear() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("academic_years")
      .select("*")
      .eq("is_current", true)
      .single();

    if (error) throw error;
    return academicYearSchema.parse(data);
  },

  async getClasses(academicYearId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("academic_year_id", academicYearId);

    if (error) throw error;
    return z.array(classSchema).parse(data);
  },

  // --- Finance Operations ---
  async getFeeStatus(studentId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("fee_payments")
      .select("*")
      .eq("student_id", studentId);

    if (error) return [];
    return data;
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
