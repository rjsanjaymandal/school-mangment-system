"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { isAdmin } from "@/lib/auth-utils";

export async function createStudent(data: {
    first_name: string;
    last_name: string;
    email: string;
    admission_number: string;
    roll_number?: string;
    class_id?: string;
}) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can create student records.");
        }
        const supabase = createAdminClient();

        // 1. Create Auth User
        // Note: For students, we might want to generate a random password or use a default one.
        // For now, we'll use a temporary one or let them reset it.
        const tempPassword = uuidv4();
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: data.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                role: "student",
                first_name: data.first_name,
                last_name: data.last_name,
            }
        });

        if (authError) {
            console.error("Auth user creation error:", authError);
            return { error: `Failed to create auth user: ${authError.message}` };
        }

        const userId = authData.user.id;

        // 2. Create Profile (if not already created by trigger)
        // We use upsert to handle cases where a trigger might have already created it
        const { error: profileError } = await supabase.from("profiles").upsert({
            id: userId,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            role: "student",
        });

        if (profileError) {
            console.error("Profile creation error:", profileError);
            // Rollback auth user
            await supabase.auth.admin.deleteUser(userId);
            return { error: "Failed to create student profile." };
        }

        // 3. Create Student
        const studentData: any = {
            id: userId, // One-to-one mapping
            admission_number: data.admission_number,
        };

        if (data.roll_number) studentData.roll_number = data.roll_number;
        if (data.class_id) studentData.class_id = data.class_id;

        const { error: studentError } = await supabase
            .from("students")
            .insert(studentData);

        if (studentError) {
            console.error("Student creation error:", studentError);
            // Rollback
            await supabase.from("profiles").delete().eq("id", userId);
            await supabase.auth.admin.deleteUser(userId);
            return { error: "Failed to create student record." };
        }

        revalidatePath("/students");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error creating student:", error);
        return { error: "An unexpected error occurred." };
    }
}

export async function updateStudent(
    id: string,
    data: {
        first_name: string;
        last_name: string;
        email: string;
        admission_number: string;
        roll_number?: string;
        class_id?: string;
    }
) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can update student records.");
        }
        const supabase = createAdminClient();

        // 1. Update Auth User (if email changed)
        const { error: authError } = await supabase.auth.admin.updateUserById(id, {
            email: data.email,
            user_metadata: {
                first_name: data.first_name,
                last_name: data.last_name,
            }
        });

        if (authError) {
            console.error("Auth user update error:", authError);
            // Some error might be because user doesn't exist in auth yet (if created before this fix)
            // So we might allow it to continue if it's just a profile/student record
        }

        // 2. Update Profile
        const { error: profileError } = await supabase
            .from("profiles")
            .update({
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
            })
            .eq("id", id);

        if (profileError) {
            console.error("Profile update error:", profileError);
            return { error: "Failed to update student profile." };
        }

        // 3. Update Student
        const studentData: any = {
            admission_number: data.admission_number,
        };
        if (data.roll_number) studentData.roll_number = data.roll_number;
        if (data.class_id) studentData.class_id = data.class_id;

        const { error: studentError } = await supabase
            .from("students")
            .update(studentData)
            .eq("id", id);

        if (studentError) {
            console.error("Student update error:", studentError);
            return { error: "Failed to update student record." };
        }

        revalidatePath("/students");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error updating student:", error);
        return { error: "An unexpected error occurred." };
    }
}

export async function deleteStudent(id: string) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can delete student records.");
        }
        const supabase = createAdminClient();

        // 1. Delete Student
        const { error: studentError } = await supabase
            .from("students")
            .delete()
            .eq("id", id);

        if (studentError) {
            console.error("Student deletion error:", studentError);
            return { error: "Failed to delete student record." };
        }

        // 2. Delete Profile
        const { error: profileError } = await supabase
            .from("profiles")
            .delete()
            .eq("id", id);

        if (profileError) {
            console.error("Profile deletion error:", profileError);
            return { error: "Failed to delete student profile." };
        }

        // 3. Delete Auth User
        const { error: authError } = await supabase.auth.admin.deleteUser(id);

        if (authError) {
            console.error("Auth user deletion error:", authError);
            // Non-blocking if auth user is already gone
        }

        revalidatePath("/students");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error deleting student:", error);
        return { error: "An unexpected error occurred." };
    }
}
