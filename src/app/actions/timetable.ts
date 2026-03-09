"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ===== TIMETABLE =====

export async function createTimetableSlot(data: {
    class_id: string;
    academic_year_id: string;
    day_of_week: string;
    subject_id: string;
    teacher_id: string;
    start_time: string;
    end_time: string;
    room_number?: string;
}) {
    try {
        const supabase = createAdminClient();

        // Ensure timetable exists for this class/day
        const { data: existing, error: findErr } = await supabase
            .from("timetables")
            .select("id")
            .eq("class_id", data.class_id)
            .eq("academic_year_id", data.academic_year_id)
            .eq("day_of_week", data.day_of_week)
            .maybeSingle();

        if (findErr) throw findErr;

        let timetableId = existing?.id;

        if (!timetableId) {
            const { data: created, error: createErr } = await supabase
                .from("timetables")
                .insert({
                    class_id: data.class_id,
                    academic_year_id: data.academic_year_id,
                    day_of_week: data.day_of_week,
                })
                .select("id")
                .single();

            if (createErr) throw createErr;
            timetableId = created.id;
        }

        // Check for time conflicts
        const { data: conflicts, error: conflictErr } = await supabase
            .from("timetable_slots")
            .select("*")
            .eq("timetable_id", timetableId)
            .or(`and(start_time.lt.${data.end_time},end_time.gt.${data.start_time})`);

        if (conflictErr) throw conflictErr;
        if (conflicts && conflicts.length > 0) {
            return { success: false, error: "Time slot conflicts with an existing slot." };
        }

        // Create slot
        const { error } = await supabase.from("timetable_slots").insert({
            timetable_id: timetableId,
            subject_id: data.subject_id,
            teacher_id: data.teacher_id,
            start_time: data.start_time,
            end_time: data.end_time,
            room_number: data.room_number || null,
        });

        if (error) throw error;
        revalidatePath("/timetable");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteTimetableSlot(slotId: string) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("timetable_slots").delete().eq("id", slotId);
        if (error) throw error;
        revalidatePath("/timetable");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getTimetableByClass(classId: string, academicYearId: string) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("timetables")
            .select(`
        *,
        slots:timetable_slots(*, subject:subjects(*), teacher:teachers(*, profile:profiles(*)))
      `)
            .eq("class_id", classId)
            .eq("academic_year_id", academicYearId);

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message, data: [] };
    }
}
