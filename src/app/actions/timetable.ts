"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { isAdminOrTeacher } from "@/lib/auth-utils";

// ===== TIMETABLE =====

async function checkConflicts(supabase: any, data: {
    timetable_id: string;
    academic_year_id: string;
    day_of_week: string;
    teacher_id: string;
    start_time: string;
    end_time: string;
    exclude_slot_id?: string;
}) {
    // 1. Check for room/class conflicts in this specific timetable
    let roomQuery = supabase
        .from("timetable_slots")
        .select("id")
        .eq("timetable_id", data.timetable_id)
        .lt("start_time", data.end_time)
        .gt("end_time", data.start_time);

    if (data.exclude_slot_id) {
        roomQuery = roomQuery.ne("id", data.exclude_slot_id);
    }

    const { data: roomConflicts, error: roomErr } = await roomQuery;
    if (roomErr) throw roomErr;
    if (roomConflicts && roomConflicts.length > 0) {
        return "Time slot conflicts with an existing slot for this class.";
    }

    // 2. Check for teacher conflicts across ALL classes on the same day/year
    const { data: matchingTimetables, error: tsErr } = await supabase
        .from("timetables")
        .select("id")
        .eq("academic_year_id", data.academic_year_id)
        .eq("day_of_week", data.day_of_week);
        
    if (tsErr) throw tsErr;
    
    if (matchingTimetables && matchingTimetables.length > 0) {
        const timetableIds = matchingTimetables.map((t: any) => t.id);
        let teacherQuery = supabase
            .from("timetable_slots")
            .select("id")
            .in("timetable_id", timetableIds)
            .eq("teacher_id", data.teacher_id)
            .lt("start_time", data.end_time)
            .gt("end_time", data.start_time);

        if (data.exclude_slot_id) {
            teacherQuery = teacherQuery.ne("id", data.exclude_slot_id);
        }

        const { data: teacherConflicts, error: teacherErr } = await teacherQuery;
        if (teacherErr) throw teacherErr;
        if (teacherConflicts && teacherConflicts.length > 0) {
            return "Teacher is already scheduled for another class at this time.";
        }
    }

    return null;
}

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
        if (!(await isAdminOrTeacher())) {
            throw new Error("Unauthorized: Only administrators and teachers can modify the timetable.");
        }
        const supabase = createAdminClient();

        // Ensure timetable exists for this class/day
        const { data: existingRecords, error: findErr } = await supabase
            .from("timetables")
            .select("id")
            .eq("class_id", data.class_id)
            .eq("academic_year_id", data.academic_year_id)
            .eq("day_of_week", data.day_of_week);

        if (findErr) throw findErr;

        let timetableId = existingRecords?.[0]?.id;

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

        const conflictMsg = await checkConflicts(supabase, {
            timetable_id: timetableId,
            academic_year_id: data.academic_year_id,
            day_of_week: data.day_of_week,
            teacher_id: data.teacher_id,
            start_time: data.start_time,
            end_time: data.end_time
        });

        if (conflictMsg) return { success: false, error: conflictMsg };

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
        revalidatePath("/classes");
        revalidatePath("/teachers");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTimetableSlot(slotId: string, data: {
    academic_year_id: string;
    day_of_week: string;
    subject_id: string;
    teacher_id: string;
    start_time: string;
    end_time: string;
    room_number?: string;
}) {
    try {
        if (!(await isAdminOrTeacher())) {
            throw new Error("Unauthorized: Only administrators and teachers can modify the timetable.");
        }
        const supabase = createAdminClient();

        // Get current slot to find its timetable
        const { data: slot, error: slotErr } = await supabase
            .from("timetable_slots")
            .select("timetable_id")
            .eq("id", slotId)
            .single();

        if (slotErr) throw slotErr;

        const conflictMsg = await checkConflicts(supabase, {
            timetable_id: slot.timetable_id,
            academic_year_id: data.academic_year_id,
            day_of_week: data.day_of_week,
            teacher_id: data.teacher_id,
            start_time: data.start_time,
            end_time: data.end_time,
            exclude_slot_id: slotId
        });

        if (conflictMsg) return { success: false, error: conflictMsg };

        const { error } = await supabase
            .from("timetable_slots")
            .update({
                subject_id: data.subject_id,
                teacher_id: data.teacher_id,
                start_time: data.start_time,
                end_time: data.end_time,
                room_number: data.room_number || null,
            })
            .eq("id", slotId);

        if (error) throw error;
        revalidatePath("/timetable");
        revalidatePath("/classes");
        revalidatePath("/teachers");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteTimetableSlot(slotId: string) {
    try {
        if (!(await isAdminOrTeacher())) {
            throw new Error("Unauthorized: Only administrators and teachers can delete timetable slots.");
        }
        const supabase = createAdminClient();
        const { error } = await supabase.from("timetable_slots").delete().eq("id", slotId);
        if (error) throw error;
        revalidatePath("/timetable");
        revalidatePath("/classes");
        revalidatePath("/teachers");
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

export async function debugTimetableData(classId: string, academicYearId: string) {
    try {
        const supabase = createAdminClient();
        
        // Check timetables
        const { data: timetables, error: ttError } = await supabase
            .from("timetables")
            .select("*")
            .eq("class_id", classId)
            .eq("academic_year_id", academicYearId);

        if (ttError) throw ttError;

        // Check slots
        let slots: any[] = [];
        if (timetables && timetables.length > 0) {
            const ttIds = timetables.map(t => t.id);
            const { data: timetableSlots, error: slotError } = await supabase
                .from("timetable_slots")
                .select("*")
                .in("timetable_id", ttIds);
            
            if (slotError) throw slotError;
            slots = timetableSlots || [];
        }

        return { 
            success: true, 
            timetables: timetables || [],
            slots,
            count: slots.length
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getTimetableSlotsRaw(classId: string, academicYearId: string, dayOfWeek?: string) {
    try {
        const supabase = createAdminClient();
        
        let query = supabase
            .from("timetables")
            .select("id")
            .eq("class_id", classId)
            .eq("academic_year_id", academicYearId);
            
        if (dayOfWeek) {
            query = query.eq("day_of_week", dayOfWeek);
        }

        const { data: timetables, error: ttError } = await query;
        if (ttError) throw ttError;

        if (!timetables || timetables.length === 0) {
            return { success: true, slots: [] };
        }

        const timetableIds = timetables.map(t => t.id);
        
        const { data: slots, error: slotsError } = await supabase
            .from("timetable_slots")
            .select("*")
            .in("timetable_id", timetableIds)
            .order("start_time");

        if (slotsError) throw slotsError;

        return { success: true, slots: slots || [] };
    } catch (error: any) {
        return { success: false, error: error.message, slots: [] };
    }
}
