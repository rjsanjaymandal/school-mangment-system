"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function markAttendance(data: {
    class_id: string;
    date: string;
    records: { student_id: string; status: string; remarks?: string }[];
    marked_by: string;
}) {
    try {
        const supabase = createAdminClient();

        const rows = data.records.map((r) => ({
            student_id: r.student_id,
            class_id: data.class_id,
            date: data.date,
            status: r.status,
            remarks: r.remarks || null,
            marked_by: data.marked_by,
        }));

        const { error } = await supabase
            .from("attendance")
            .upsert(rows, { onConflict: "student_id,date" });

        if (error) throw error;

        revalidatePath("/attendance");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAttendanceByClassAndDate(
    classId: string,
    date: string
) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("attendance")
            .select("*, student:students(*, profile:profiles(*))")
            .eq("class_id", classId)
            .eq("date", date);

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message, data: [] };
    }
}

export async function getAttendanceSummary(classId: string, month: number, year: number) {
    try {
        const supabase = createAdminClient();
        const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
        const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

        const { data, error } = await supabase
            .from("attendance")
            .select("*")
            .eq("class_id", classId)
            .gte("date", startDate)
            .lte("date", endDate);

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message, data: [] };
    }
}
