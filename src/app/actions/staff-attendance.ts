"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function markStaffAttendance(data: {
    date: string;
    records: { staff_id: string; status: string; remarks?: string }[];
    marked_by: string;
}) {
    try {
        const supabase = createAdminClient();

        const rows = data.records.map((r) => ({
            staff_id: r.staff_id,
            date: data.date,
            status: r.status,
            remarks: r.remarks || null,
            marked_by: data.marked_by,
        }));

        const { error } = await supabase
            .from("staff_attendance")
            .upsert(rows, { onConflict: "staff_id,date" });

        if (error) throw error;

        revalidatePath("/teachers");
        return { success: true };
    } catch (error: any) {
        console.error("Staff Attendance Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getStaffAttendanceByDate(date: string) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("staff_attendance")
            .select("*, staff:profiles!staff_id(*)")
            .eq("date", date);

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message, data: [] };
    }
}
