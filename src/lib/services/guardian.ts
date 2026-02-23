import { createClient } from "@/lib/supabase/client";

/**
 * Guardian Service
 * Bridges parents to their student's institutional data (Grades, Fees, Conduct).
 */
export const GuardianService = {
  async getLinkedStudents(parentId: string) {
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
  },

  async getStudentSnapshot(studentId: string) {
    const supabase = createClient();
    
    // Fetch multi-dimensional data in parallel
    const [marks, attendance, conduct, fees] = await Promise.all([
      supabase.from("marks").select("*").eq("student_id", studentId),
      supabase.from("attendance").select("*").eq("student_id", studentId),
      supabase.from("student_conduct").select("*").eq("student_id", studentId),
      supabase.from("payments").select("*").eq("student_id", studentId)
    ]);

    return {
      marks: marks.data || [],
      attendance: attendance.data || [],
      conduct: conduct.data || [],
      payments: fees.data || []
    };
  }
};
