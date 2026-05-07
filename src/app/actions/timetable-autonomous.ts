"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function generateOptimizedSchedule(academicYearId: string, classId?: string) {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase.rpc("rpc_generate_optimized_schedule", {
      p_academic_year_id: academicYearId,
      p_class_id: classId || null
    });

    if (error) throw error;

    revalidatePath("/timetable");
    return { success: true, data };
  } catch (error: any) {
    console.error("Error generating optimized schedule:", error);
    return { success: false, error: error.message };
  }
}

export async function getTeacherLoad(academicYearId: string, dayOfWeek?: string) {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase.rpc("rpc_get_teacher_load", {
      p_academic_year_id: academicYearId,
      p_day_of_week: dayOfWeek || null
    });

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error("Error getting teacher load:", error);
    return { success: false, error: error.message };
  }
}

export async function checkScheduleConflicts(academicYearId: string) {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase.rpc("rpc_check_schedule_conflicts", {
      p_academic_year_id: academicYearId
    });

    if (error) throw error;

    return { success: true, data, hasConflicts: (data?.length || 0) > 0 };
  } catch (error: any) {
    console.error("Error checking conflicts:", error);
    return { success: false, error: error.message };
  }
}

export async function getTodayProxies() {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase.rpc("rpc_get_today_proxies");

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error("Error getting today proxies:", error);
    return { success: false, error: error.message };
  }
}

export async function markStaffAttendance(
  staffId: string, 
  date: string, 
  status: string,
  notes?: string
) {
  const supabase = await createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from("staff_attendance").upsert({
      staff_id: staffId,
      date: date,
      status: status,
      notes: notes,
      marked_by: user?.id
    }, { onConflict: "staff_id,date" });

    if (error) throw error;

    revalidatePath("/timetable");
    return { success: true };
  } catch (error: any) {
    console.error("Error marking attendance:", error);
    return { success: false, error: error.message };
  }
}

export async function getStaffAttendanceForDate(date: string) {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from("staff_attendance")
      .select("*")
      .eq("date", date);

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error("Error getting attendance:", error);
    return { success: false, error: error.message };
  }
}

export async function updateTeacherExpertise(
  teacherId: string,
  expertiseTags: string[],
  proficiencyLevel: number,
  maxDailyHours: number,
  maxWeeklyHours: number
) {
  const supabase = await createClient();
  
  try {
    const { error } = await supabase
      .from("staff")
      .update({
        expertise_tags: expertiseTags,
        proficiency_level: proficiencyLevel,
        max_daily_hours: maxDailyHours,
        max_weekly_hours: maxWeeklyHours
      })
      .eq("id", teacherId);

    if (error) throw error;

    revalidatePath("/timetable");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating teacher expertise:", error);
    return { success: false, error: error.message };
  }
}

export async function getTeacherExpertise(teacherId: string) {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from("staff")
      .select("expertise_tags, proficiency_level, max_daily_hours, max_weekly_hours")
      .eq("id", teacherId)
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error("Error getting teacher expertise:", error);
    return { success: false, error: error.message };
  }
}