import { createClient } from "@/lib/supabase/client";
import { handleServiceError } from "../error-handler";

/**
 * Guardian Service
 * Bridges parents to their student's institutional data (Grades, Fees, Conduct).
 */
export const GuardianService = {
  async getLinkedStudents(parentId: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          profile:profiles!id(*),
          class:classes(*)
        `)
        .eq("parent_id", parentId);

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getStudentSnapshot(studentId: string) {
    try {
      const supabase = createClient();
      
      // Fetch multi-dimensional data in parallel
      const [marks, attendance, conduct, fees] = await Promise.all([
        supabase.from("marks").select("*").eq("student_id", studentId),
        supabase.from("attendance").select("*").eq("student_id", studentId),
        supabase.from("student_conduct").select("*").eq("student_id", studentId),
        supabase.from("payments").select("*").eq("student_id", studentId)
      ]);

      // Check for errors in any of the results
      const errors = [marks.error, attendance.error, conduct.error, fees.error].filter(Boolean);
      if (errors.length > 0) throw errors[0];

      return {
        marks: marks.data || [],
        attendance: attendance.data || [],
        conduct: conduct.data || [],
        payments: fees.data || []
      };
    } catch (error) {
      return handleServiceError(error);
    }
  }
};
