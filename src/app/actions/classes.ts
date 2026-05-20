"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth-utils";
import type { ActionResult } from "@/types";

export async function createClass(data: {
    name: string;
    capacity?: number;
    room_number?: string;
    teacher_id?: string | null;
    grade_level?: string | null;
}) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can create classes.");
        }
        const supabase = createAdminClient();
        const { error } = await supabase.from("classes").insert(data);
        if (error) throw error;
        revalidatePath("/academics/classes");
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}

export async function updateClass(id: string, data: Partial<{
    name: string;
    capacity: number;
    room_number: string;
    teacher_id: string | null;
    grade_level: string | null;
}>) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can update classes.");
        }
        const supabase = createAdminClient();
        const { error } = await supabase.from("classes").update(data).eq("id", id);
        if (error) throw error;
        revalidatePath("/academics/classes");
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}

export async function deleteClass(id: string) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can delete classes.");
        }
        const supabase = createAdminClient();
        const { error } = await supabase.from("classes").delete().eq("id", id);
        if (error) throw error;
        revalidatePath("/academics/classes");
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}
