"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ===== STUDENT CONDUCT CRUD =====

/**
 * Adds a new conduct record (merit or demerit).
 */
export async function addConductRecord(data: {
    student_id: string;
    teacher_id?: string;
    type: "merit" | "demerit";
    points: number;
    category: string;
    description?: string;
    incident_date?: string;
}) {
    try {
        const supabase = createAdminClient();
        const recordData = {
            ...data,
            teacher_id: (data.teacher_id && data.teacher_id !== "") ? data.teacher_id : null,
            student_id: (data.student_id && data.student_id !== "") ? data.student_id : undefined,
            incident_date: data.incident_date || new Date().toISOString().split('T')[0]
        };
        
        // Final validation for required UUIDs
        if (!recordData.student_id) throw new Error("Missing Student Vector (UUID)");

        const { error } = await supabase.from("student_conduct").insert(recordData);
        if (error) throw error;
        revalidatePath("/conduct");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Updates an existing conduct record.
 */
export async function updateConductRecord(id: string, data: {
    student_id?: string;
    teacher_id?: string | null;
    type?: "merit" | "demerit";
    points?: number;
    category?: string;
    description?: string;
    incident_date?: string;
}) {
    try {
        const supabase = createAdminClient();
        const updateData: any = { ...data };
        
        if (updateData.teacher_id === "") updateData.teacher_id = null;
        if (updateData.student_id === "") delete updateData.student_id;
        
        const { error } = await supabase
            .from("student_conduct")
            .update(updateData)
            .eq("id", id);
        
        if (error) throw error;
        revalidatePath("/conduct");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Deletes a conduct record.
 */
export async function deleteConductRecord(id: string) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("student_conduct")
            .delete()
            .eq("id", id);
        
        if (error) throw error;
        revalidatePath("/conduct");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Fetches conduct records for a specific student.
 */
export async function getConductByStudent(studentId: string) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("student_conduct")
            .select("*, teacher:teachers(*, profile:profiles(*))")
            .eq("student_id", studentId)
            .order("incident_date", { ascending: false });
        
        if (error) throw error;

        const merits = (data || []).filter((d) => d.type === "merit").reduce((s, d) => s + d.points, 0);
        const demerits = (data || []).filter((d) => d.type === "demerit").reduce((s, d) => s + d.points, 0);

        return { success: true, data: data || [], summary: { merits, demerits, net: merits - demerits } };
    } catch (error: any) {
        return { success: false, error: error.message, data: [], summary: { merits: 0, demerits: 0, net: 0 } };
    }
}
