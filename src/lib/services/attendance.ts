import { createClient } from "@/lib/supabase/client";
import { handleServiceError } from "../error-handler";

/**
 * Attendance Service Layer
 * For marking and retrieving attendance.
 */
export const AttendanceService = {
  async getClasses() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return (data || []);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async markAttendance(studentId: string, classId: string, status: 'present' | 'absent' | 'late') {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("attendance")
        .insert({
          student_id: studentId,
          class_id: classId,
          status,
          date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async batchMarkAttendance(attendanceData: Array<{ student_id: string, class_id: string, status: string, date: string }>) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("attendance")
        .upsert(attendanceData, { onConflict: 'student_id,class_id,date' })
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getAttendanceHistory(classId: string, date?: string) {
    try {
      const supabase = createClient();
      let query = supabase
        .from("attendance")
        .select(`
          *,
          student:students(
            *,
            profile:profiles(*)
          )
        `)
        .eq("class_id", classId);

      if (date) {
        query = query.eq("date", date);
      }

      const { data, error } = await query.order("date", { ascending: false });

      if (error) throw error;
      return (data || []);
    } catch (error) {
      return handleServiceError(error);
    }
  }
};
