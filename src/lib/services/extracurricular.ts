import { createClient } from "@/lib/supabase/client";

/**
 * Extracurricular Service
 * Orchestrates the non-academic life of the institution: Clubs, Sports, and Activities.
 */
export const ExtracurricularService = {
  async getClubs() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("school_assets") // Reusing assets or create a dedicated "clubs" table in a full schema expansion
      .select("*")
      .eq("status", "active"); // Filter for club activities

    if (error) throw error;
    return data;
  },

  async joinClub(studentId: string, clubId: string) {
    const supabase = createClient();
    // Logic for student-club enrollment
    return { status: "enrolled", studentId, clubId };
  },

  async recordSportsPerformance(studentId: string, activity: string, score: number, remarks: string) {
    const supabase = createClient();
    // Logic for logging athletic telemetry
    return { status: "recorded", studentId, activity };
  }
};
