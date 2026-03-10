"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export async function createParent(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    occupation?: string;
    relation_to_student: string;
    studentId: string;
}) {
    try {
        const supabase = createAdminClient();

        // 1. Create Auth User
        const tempPassword = uuidv4();
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: data.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                role: "parent",
                first_name: data.first_name,
                last_name: data.last_name,
            }
        });

        if (authError) {
            console.error("Parent auth creation error:", authError);
            return { error: `Failed to create auth user: ${authError.message}` };
        }

        const parentId = authData.user.id;

        // 2. Create Profile
        const { error: profileError } = await supabase.from("profiles").upsert({
            id: parentId,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone: data.phone,
            role: "parent",
        });

        if (profileError) {
            console.error("Parent profile creation error:", profileError);
            await supabase.auth.admin.deleteUser(parentId);
            return { error: "Failed to create parent profile." };
        }

        // 3. Link to Student (Junction table)
        const { error: linkError } = await supabase.from("guardian_students").insert({
            guardian_id: parentId,
            student_id: data.studentId,
            relationship: data.relation_to_student.toLowerCase(),
            is_primary: true
        });

        if (linkError) {
            console.error("Relation linking error:", linkError);
            // Non-blocking but return error
        }

        // 4. Update Student record (Direct link)
        await supabase
            .from("students")
            .update({ parent_id: parentId })
            .eq("id", data.studentId);

        revalidatePath("/students");
        revalidatePath("/admin/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error creating parent:", error);
        return { error: "An unexpected error occurred." };
    }
}

export async function getStudentGuardians(studentId: string) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("guardian_students")
            .select("*, guardian:profiles(*)")
            .eq("student_id", studentId);

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
