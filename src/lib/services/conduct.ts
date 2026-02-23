import { createClient } from "@/lib/supabase/client";
import { studentConductSchema, ValidStudentConduct } from "../validations";
import { handleServiceError } from "../error-handler";
import { z } from "zod";

/**
 * Conduct Service
 * Manages behavioral tracking (merits/demerits) and institutional discipline.
 */
export const ConductService = {
  async recordConduct(incident: Omit<ValidStudentConduct, "id">): Promise<any> {
    try {
      const supabase = createClient();
      
      // Validate input before submission
      const validated = studentConductSchema.parse(incident);

      const { data, error } = await supabase
        .from("student_conduct")
        .insert([validated])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getStudentBehaviorHistory(studentId: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("student_conduct")
        .select(`
          *,
          teacher:profiles!teacher_id(first_name, last_name)
        `)
        .eq("student_id", studentId)
        .order("incident_date", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getBehavioralAnalytics(studentId: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("student_conduct")
        .select("type, points")
        .eq("student_id", studentId);

      if (error) throw error;

      const summary = data.reduce(
        (acc, curr) => {
          if (curr.type === "merit") acc.merits += curr.points;
          else acc.demerits += curr.points;
          return acc;
        },
        { merits: 0, demerits: 0 }
      );

      return {
        ...summary,
        netScore: summary.merits - summary.demerits,
        standing: (summary.merits - summary.demerits) >= 0 ? "Good Standings" : "Under Watch",
      };
    } catch (error) {
      return handleServiceError(error);
    }
  }
};
