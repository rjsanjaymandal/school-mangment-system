import { createClient } from "@/lib/supabase/client";
import { healthProfileSchema, infirmaryLogSchema, ValidHealthProfile, ValidInfirmaryLog } from "../validations";
import { handleServiceError } from "../error-handler";
import { z } from "zod";

/**
 * Health & Wellness Service
 * Manages student medical profiles, allergy tracking, and infirmary visit logs.
 */
export const HealthService = {
  async getHealthProfile(studentId: string) {
    const supabase = createClient();
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("health_profiles")
        .select("*")
        .eq("id", studentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Handle not found as null
      if (!data) return null;
      return healthProfileSchema.parse(data);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async updateHealthProfile(profile: ValidHealthProfile) {
    try {
      const supabase = createClient();
      const validated = healthProfileSchema.parse(profile);

      const { data, error } = await supabase
        .from("health_profiles")
        .upsert(validated)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async recordInfirmaryVisit(log: Omit<ValidInfirmaryLog, "id">) {
    try {
      const supabase = createClient();
      const validated = infirmaryLogSchema.parse(log);

      const { data, error } = await supabase
        .from("infirmary_logs")
        .insert([validated])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getInfirmaryLogs(studentId?: string) {
    const supabase = createClient();
    let query = supabase
      .from("infirmary_logs")
      .select(`
        *,
        student:students(
          id,
          profile:profiles(first_name, last_name)
        ),
        recorder:profiles!recorded_by(first_name, last_name)
      `)
      .order("check_in_time", { ascending: false });

    if (studentId) query = query.eq("student_id", studentId);

    try {
      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getHealthAlerts() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("health_profiles")
        .select(`
          id,
          allergies,
          chronic_conditions,
          student:students(
            profile:profiles(first_name, last_name)
          )
        `)
        .or('allergies.neq.{},chronic_conditions.neq.{}');

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  }
};
