import { createClient } from "@/lib/supabase/client";

/**
 * Alumni Service
 * Manages the student-to-alumni lifecycle and institutional heritage tracking.
 */
export const AlumniService = {
  async graduateStudent(studentId: string, graduationDate: string, finalGpa: number) {
    const supabase = createClient();
    
    // 1. Mark student profile as Graduated
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: "parent" }) // Change role or add a "alumni" status flag in a real scenario
      .eq("id", studentId);

    if (profileError) throw profileError;

    // 2. Archive academic record (Placeholder logic)
    // In a full production system, we would move active student data to alumni_archives
    
    return { status: "success", studentId };
  },

  async getAlumniDirectory() {
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
  },

  async recordDonation(alumniId: string, amount: number, purpose: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("payments") // Reusing payments table for simplicity or create alumni_donations
      .insert([{
        student_id: alumniId,
        amount_paid: amount,
        payment_method: "online",
        status: "completed"
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
