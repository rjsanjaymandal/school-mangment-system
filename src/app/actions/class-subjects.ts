"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth-utils";

export async function addSubjectToClass(
    classId: string,
    subjectId: string,
    academicYearId?: string,
    teacherId?: string
) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can manage class subjects.");
        }
        const supabase = createAdminClient();

        const { error } = await supabase.from("class_subjects").insert({
            class_id: classId,
            subject_id: subjectId,
            academic_year_id: academicYearId,
            teacher_id: teacherId || null
        });

        if (error) {
            if (error.code === '23505') {
                return { success: false, error: "This subject is already assigned to this class." };
            }
            throw error;
        }

        revalidatePath("/academics/classes");
        revalidatePath("/academics/subjects");
        revalidatePath("/academics/timetable");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function assignTeacherToClassSubject(
    classSubjectId: string,
    teacherId: string | null
) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can assign teachers.");
        }
        const supabase = createAdminClient();

        const { error } = await supabase
            .from("class_subjects")
            .update({ teacher_id: teacherId })
            .eq("id", classSubjectId);

        if (error) throw error;

        revalidatePath("/academics/classes");
        revalidatePath("/academics/subjects");
        revalidatePath("/academics/timetable");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function removeSubjectFromClass(classSubjectId: string) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can manage class subjects.");
        }
        const supabase = createAdminClient();

        const { error } = await supabase
            .from("class_subjects")
            .delete()
            .eq("id", classSubjectId);

        if (error) throw error;

        revalidatePath("/academics/classes");
        revalidatePath("/academics/subjects");
        revalidatePath("/academics/timetable");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getClassSubjects(classId: string, academicYearId?: string) {
    try {
        const supabase = createAdminClient();

        let query = supabase
            .from("class_subjects")
            .select(`
                *,
                subject:subjects(*),
                class:classes(*),
                teacher:profiles!teacher_id(id, full_name, email)
            `)
            .eq("class_id", classId);

        if (academicYearId) {
            query = query.eq("academic_year_id", academicYearId);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, classSubjects: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message, classSubjects: [] };
    }
}

export async function bulkAddSubjectsToClass(
    classId: string,
    subjectIds: string[],
    academicYearId?: string
) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can manage class subjects.");
        }

        if (!subjectIds || subjectIds.length === 0) {
            return { success: false, error: "No subjects selected." };
        }

        const supabase = createAdminClient();

        const records = subjectIds.map(subjectId => ({
            class_id: classId,
            subject_id: subjectId,
            academic_year_id: academicYearId
        }));

        const { error } = await supabase
            .from("class_subjects")
            .upsert(records, { onConflict: 'class_id,subject_id,academic_year_id' });

        if (error) throw error;

        revalidatePath("/academics/classes");
        revalidatePath("/academics/subjects");
        revalidatePath("/academics/timetable");
        return { success: true, assignedCount: subjectIds.length };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
