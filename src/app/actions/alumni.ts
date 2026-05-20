"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { isAdminOrTeacher } from "@/lib/auth-utils";

type AlumniPayload = {
    first_name: string;
    last_name: string;
    graduation_year: number;
    email?: string;
    phone?: string;
    current_profession?: string;
    company?: string;
    achievements?: string;
    profile_picture_url?: string;
};

export async function graduateStudent(studentId: string, graduationData: {
    graduation_year: number;
    current_profession?: string;
    company?: string;
    achievements?: string;
}) {
    const authorized = await isAdminOrTeacher();
    if (!authorized) {
        return { success: false, message: "Unauthorized: Insufficient clearance" };
    }

    try {
        const supabaseAdmin = createAdminClient();

        // 1. Fetch student details
        const { data: student, error: fetchError } = await supabaseAdmin
            .from("students")
            .select("*, profile:profiles(*)")
            .eq("id", studentId)
            .single();

        if (fetchError || !student) {
            throw new Error("Student record not found in active registry");
        }

        const [firstName = "", ...restName] = (student.profile?.full_name || "").trim().split(" ");
        const lastName = restName.join(" ").trim();

        // 2. Insert into alumni table
        const { error: alumniError } = await supabaseAdmin
            .from("alumni")
            .insert({
                id: student.id, // Keep the same ID for continuity if possible, or let it gen
                first_name: student.profile.first_name || firstName || student.admission_number,
                last_name: student.profile.last_name || lastName || "Graduate",
                graduation_year: graduationData.graduation_year,
                email: student.profile.email,
                current_profession: graduationData.current_profession,
                company: graduationData.company,
                achievements: graduationData.achievements,
                profile_picture_url: student.profile.avatar_url
            });

        if (alumniError) throw alumniError;

        // 3. Mark student profile as 'student' (or we could change role to something else)
        // For now, we keep the profile but delete the student entry to remove from active classes
        const { error: deleteError } = await supabaseAdmin
            .from("students")
            .delete()
            .eq("id", studentId);

        if (deleteError) throw deleteError;

        revalidatePath("/services/alumni");
        revalidatePath("/students");
        
        return { success: true, message: `Node ${student.admission_number} successfully transitioned to Heritage Registry` };
    } catch (error: any) {
        console.error("Graduation Protocol Error:", error);
        return { success: false, message: error.message || "Protocol execution failed" };
    }
}

export async function addAlumnusManual(data: AlumniPayload) {
    const authorized = await isAdminOrTeacher();
    if (!authorized) return { success: false, message: "Unauthorized" };

    try {
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin
            .from("alumni")
            .insert(data);

        if (error) throw error;
        revalidatePath("/services/alumni");
        return { success: true, message: "Manual record inserted into Heritage Registry" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updateAlumnus(id: string, data: Partial<AlumniPayload>) {
    const authorized = await isAdminOrTeacher();
    if (!authorized) return { success: false, message: "Unauthorized" };

    try {
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin
            .from("alumni")
            .update(data)
            .eq("id", id);

        if (error) throw error;
        revalidatePath("/services/alumni");
        return { success: true, message: "Alumni record updated successfully" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteAlumnus(id: string) {
    const authorized = await isAdminOrTeacher();
    if (!authorized) return { success: false, message: "Unauthorized" };

    try {
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin
            .from("alumni")
            .delete()
            .eq("id", id);

        if (error) throw error;
        revalidatePath("/services/alumni");
        return { success: true, message: "Alumni record removed successfully" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
