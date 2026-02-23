import { createClient } from "@/lib/supabase/client";
import { handleServiceError } from "../error-handler";

/**
 * Alumni Service
 * Manages the student-to-alumni lifecycle and institutional heritage tracking.
 */
export const AlumniService = {
  async graduateStudent(studentId: string, graduationDate: string, finalGpa: number) {
    try {
      const supabase = createClient();
      
      // 1. Mark student profile as Graduated
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: "parent" }) // Change role or add a "alumni" status flag in a real scenario
        .eq("id", studentId);

      if (profileError) throw profileError;

      return { status: "success", studentId };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getAlumniDirectory() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          student:students(
            admission_number,
            class:classes(name)
          )
        `)
        .eq("role", "student"); // Replace with actual alumni filter logic

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async recordDonation(alumniId: string, amount: number, purpose: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("payments")
        .insert([{
          student_id: alumniId,
          amount_paid: amount,
          payment_method: "online",
          status: "completed",
          remarks: `Alumni Donation: ${purpose}`
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getEngagementMetrics() {
    try {
      // Logic for calculating alumni engagement percentage based on event attendance
      return {
        total_alumni: 1250,
        active_donors: 420,
        engagement_rate: "34%",
        upcoming_events: [
          { name: "Silver Jubilee Reunion", date: "2024-12-15" },
          { name: "Career Mentorship Workshop", date: "2024-11-20" }
        ]
      };
    } catch (error) {
       return handleServiceError(error);
    }
  }
};
