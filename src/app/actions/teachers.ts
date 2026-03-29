"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { isAdmin } from "@/lib/auth-utils";

export async function createTeacher(data: {
    full_name: string;
    email: string;
    employee_id: string;
    specialization: string[];
    qualification: string;
}) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can create teacher records.");
        }
        const supabase = createAdminClient();

        // 1. Create Auth User
        const tempPassword = uuidv4();
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: data.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                role: "teacher",
                full_name: data.full_name,
            }
        });

        if (authError) {
            console.error("Auth user creation error:", authError);
            return { error: `Failed to create auth user: ${authError.message}` };
        }

        const userId = authData.user.id;

        // 2. Create Profile
        const { error: profileError } = await supabase.from("profiles").upsert({
            id: userId,
            full_name: data.full_name,
            email: data.email,
            role: "teacher",
        });

        if (profileError) {
            console.error("Profile creation error:", profileError);
            await supabase.auth.admin.deleteUser(userId);
            return { error: "Failed to create teacher profile." };
        }

        // 3. Create Teacher
        const { error: teacherError } = await supabase
            .from("teachers")
            .insert({
                id: userId,
                employee_id: data.employee_id,
                specialization: data.specialization,
                qualification: data.qualification,
                status: "active"
            });

        if (teacherError) {
            console.error("Teacher creation error:", teacherError);
            await supabase.from("profiles").delete().eq("id", userId);
            await supabase.auth.admin.deleteUser(userId);
            return { error: "Failed to create teacher record." };
        }

        revalidatePath("/teachers");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error creating teacher:", error);
        return { error: "An unexpected error occurred." };
    }
}

export async function updateTeacher(
    id: string,
    data: {
        full_name: string;
        email: string;
        employee_id: string;
        specialization: string[];
        qualification: string;
    }
) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can update teacher records.");
        }
        const supabase = createAdminClient();

        // 1. Update Auth User
        const { error: authError } = await supabase.auth.admin.updateUserById(id, {
            email: data.email,
            user_metadata: {
                full_name: data.full_name,
            }
        });

        if (authError) {
            console.error("Auth user update error:", authError);
        }

        // 2. Update Profile
        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                full_name: data.full_name,
                email: data.email,
            })
            .eq("id", id);

        if (profileError) {
            return { error: "Failed to update teacher profile." };
        }

        // 3. Update Teacher
        const { error: teacherError } = await supabase
            .from("teachers")
            .update({
                employee_id: data.employee_id,
                specialization: data.specialization,
                qualification: data.qualification,
            })
            .eq("id", id);

        if (teacherError) {
            return { error: "Failed to update teacher record." };
        }

        revalidatePath("/teachers");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error updating teacher:", error);
        return { error: "An unexpected error occurred." };
    }
}

export async function deleteTeacher(id: string) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can delete teacher records.");
        }
        const supabase = createAdminClient();

        // 1. Delete Teacher
        const { error: teacherError } = await supabase
            .from("teachers")
            .delete()
            .eq("id", id);

        if (teacherError) {
            return { error: "Failed to delete teacher record." };
        }

        // 2. Delete Profile
        const { error: profileError } = await supabase
            .from("profiles")
            .delete()
            .eq("id", id);

        if (profileError) {
            return { error: "Failed to delete teacher profile." };
        }

        // 3. Delete Auth User
        await supabase.auth.admin.deleteUser(id);

        revalidatePath("/teachers");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error deleting teacher:", error);
        return { error: "An unexpected error occurred." };
    }
}
