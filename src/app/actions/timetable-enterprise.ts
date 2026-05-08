"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function swapTeacherInSlot(slotId: string, newTeacherId: string, reason?: string) {
  const supabase = await createClient();
  
  try {
    const { error } = await supabase
      .from("timetable_slots")
      .update({ 
        teacher_id: newTeacherId,
        is_proxy: true,
        proxy_reason: reason || "Manual swap by admin"
      })
      .eq("id", slotId);

    if (error) throw error;

    revalidatePath("/timetable");
    return { success: true };
  } catch (error: any) {
    console.error("Error swapping teacher:", error);
    return { success: false, error: error.message };
  }
}

export async function bulkGenerateSchedule(academicYearId: string) {
  const supabase = await createClient();
  
  try {
    const { data: classes } = await supabase
      .from("classes")
      .select("id")
      .order("name");

    if (!classes || classes.length === 0) {
      return { success: false, error: "No classes found" };
    }

    const results = [];
    for (const cls of classes) {
      const { data, error } = await supabase.rpc("rpc_generate_optimized_schedule", {
        p_academic_year_id: academicYearId,
        p_class_id: cls.id
      });
      
      if (error) {
        results.push({ classId: cls.id, error: error.message });
      } else {
        results.push({ classId: cls.id, success: true, filled: data?.filter((d: any) => d.was_filled)?.length || 0 });
      }
    }

    revalidatePath("/timetable");
    return { success: true, data: results };
  } catch (error: any) {
    console.error("Error bulk generating schedule:", error);
    return { success: false, error: error.message };
  }
}

export async function copyTimetableToDay(fromDay: string, toDays: string[]) {
  const supabase = await createClient();
  
  try {
    const { data: sourceSlots } = await supabase
      .from("timetable_slots")
      .select(`
        *,
        timetable:timetables(day_of_week, class_id, academic_year_id)
      `)
      .eq("timetables.day_of_week", fromDay);

    if (!sourceSlots || sourceSlots.length === 0) {
      return { success: false, error: "No slots found for source day" };
    }

    const newSlots = [];
    for (const day of toDays) {
      for (const slot of sourceSlots) {
        const timetable = slot.timetable?.[0];
        if (!timetable) continue;
        
        const { data: targetTimetable } = await supabase
          .from("timetables")
          .select("id")
          .eq("day_of_week", day)
          .eq("class_id", timetable.class_id)
          .eq("academic_year_id", timetable.academic_year_id)
          .single();

        if (targetTimetable) {
          newSlots.push({
            timetable_id: targetTimetable.id,
            subject_id: slot.subject_id,
            teacher_id: slot.teacher_id,
            start_time: slot.start_time,
            end_time: slot.end_time,
            room_number: slot.room_number
          });
        }
      }
    }

    if (newSlots.length > 0) {
      const { error } = await supabase
        .from("timetable_slots")
        .insert(newSlots);

      if (error) throw error;
    }

    revalidatePath("/timetable");
    return { success: true, created: newSlots.length };
  } catch (error: any) {
    console.error("Error copying timetable:", error);
    return { success: false, error: error.message };
  }
}

export async function clearTimetableForClass(classId: string, academicYearId: string) {
  const supabase = await createClient();
  
  try {
    const { data: timetables } = await supabase
      .from("timetables")
      .select("id")
      .eq("class_id", classId)
      .eq("academic_year_id", academicYearId);

    if (timetables && timetables.length > 0) {
      const { error } = await supabase
        .from("timetable_slots")
        .delete()
        .in("timetable_id", timetables.map(t => t.id));

      if (error) throw error;
    }

    revalidatePath("/timetable");
    return { success: true };
  } catch (error: any) {
    console.error("Error clearing timetable:", error);
    return { success: false, error: error.message };
  }
}

export async function getClassTimetableOverview(academicYearId: string) {
  const supabase = await createClient();
  
  try {
    const { data: classes } = await supabase
      .from("classes")
      .select("id, name, section, room_number");

    const overview = [];
    
    for (const cls of classes || []) {
      const { data: timetables } = await supabase
        .from("timetables")
        .select("id, day_of_week")
        .eq("class_id", cls.id)
        .eq("academic_year_id", academicYearId);

      const timetableIds = timetables?.map(t => t.id) || [];
      
      let totalSlots = 0;
      let uniqueSubjects = 0;
      let uniqueTeachers = 0;
      
      if (timetableIds.length > 0) {
        const { data: slots } = await supabase
          .from("timetable_slots")
          .select("subject_id, teacher_id")
          .in("timetable_id", timetableIds);

        totalSlots = slots?.length || 0;
        uniqueSubjects = new Set(slots?.map(s => s.subject_id)).size;
        uniqueTeachers = new Set(slots?.map(s => s.teacher_id)).size;
      }

      overview.push({
        class: cls,
        daysCovered: timetables?.length || 0,
        totalSlots,
        uniqueSubjects,
        uniqueTeachers,
        completion: Math.round((totalSlots / (6 * 8)) * 100)
      });
    }

    return { success: true, data: overview };
  } catch (error: any) {
    console.error("Error getting class overview:", error);
    return { success: false, error: error.message };
  }
}

export async function assignSubstituteTeacher(
  originalSlotId: string, 
  substituteTeacherId: string,
  reason: string
) {
  const supabase = await createClient();
  
  try {
    const { data: slot } = await supabase
      .from("timetable_slots")
      .select("teacher_id, timetable:timetables(academic_year_id)")
      .eq("id", originalSlotId)
      .single();

    if (!slot) {
      return { success: false, error: "Slot not found" };
    }

    const { error } = await supabase
      .from("timetable_slots")
      .update({
        teacher_id: substituteTeacherId,
        is_proxy: true,
        original_teacher_id: slot.teacher_id,
        proxy_reason: reason,
        auto_assigned: false
      })
      .eq("id", originalSlotId);

    if (error) throw error;

    revalidatePath("/timetable");
    return { success: true };
  } catch (error: any) {
    console.error("Error assigning substitute:", error);
    return { success: false, error: error.message };
  }
}

export async function generateTimetableReport(academicYearId: string, classId?: string) {
  const supabase = await createClient();
  
  try {
    const query = supabase
      .from("timetables")
      .select(`
        *,
        class:classes(name, section),
        slots:timetable_slots(
          *,
          subject:subjects(name),
          teacher:staff(profile:profiles(full_name))
        )
      `)
      .eq("academic_year_id", academicYearId);

    if (classId) {
      query.eq("class_id", classId);
    }

    const { data: timetables, error } = await query;

    if (error) throw error;

    const report = {
      totalClasses: new Set(timetables?.map(t => t.class_id)).size,
      totalSlots: timetables?.reduce((sum, t) => sum + (t.slots?.length || 0), 0) || 0,
      daysCovered: new Set(timetables?.map(t => t.day_of_week)).size,
      subjectsByClass: {} as Record<string, Set<string>>,
      teacherUtilization: {} as Record<string, number>
    };

    timetables?.forEach(t => {
      const className = t.class?.name;
      if (!report.subjectsByClass[className]) {
        report.subjectsByClass[className] = new Set();
      }
      t.slots?.forEach((s: any) => {
        if (s.subject_id) report.subjectsByClass[className].add(s.subject_id);
        if (s.teacher_id) {
          report.teacherUtilization[s.teacher_id] = (report.teacherUtilization[s.teacher_id] || 0) + 1;
        }
      });
    });

    return { success: true, data: { timetables, report } };
  } catch (error: any) {
    console.error("Error generating report:", error);
    return { success: false, error: error.message };
  }
}