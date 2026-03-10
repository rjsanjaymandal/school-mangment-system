"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ===== EXAMS =====

export async function createExam(data: {
    name: string;
    academic_year_id: string;
    subject_id?: string;
    class_id?: string;
    date?: string;
    max_marks?: number;
    passing_marks?: number;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("exams").insert(data);
        if (error) throw error;
        revalidatePath("/exams");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateExam(id: string, data: {
    name?: string;
    academic_year_id?: string;
    subject_id?: string;
    class_id?: string;
    date?: string;
    max_marks?: number;
    passing_marks?: number;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("exams").update(data).eq("id", id);
        if (error) throw error;
        revalidatePath("/exams");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteExam(id: string) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("exams").delete().eq("id", id);
        if (error) throw error;
        revalidatePath("/exams");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ===== MARKS =====

export async function saveMarks(rows: {
    exam_id: string;
    student_id: string;
    subject_id: string;
    marks_obtained: number;
}[]) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("marks")
            .upsert(rows, { onConflict: "exam_id,student_id,subject_id" });

        if (error) throw error;
        revalidatePath("/exams");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getMarksByExam(examId: string) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("marks")
            .select("*, student:students(*, profile:profiles(*))")
            .eq("exam_id", examId);

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message, data: [] };
    }
}

export async function getStudentResults(studentId: string) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("marks")
            .select("*, exam:exams(*)")
            .eq("student_id", studentId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message, data: [] };
    }
}
