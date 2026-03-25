"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth-utils";

export async function createClass(data: {
    name: string;
    capacity?: number;
    room_number?: string;
}) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can create classes.");
        }
        const supabase = createAdminClient();
        const { error } = await supabase.from("classes").insert(data);
        if (error) throw error;
        revalidatePath("/classes");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateClass(id: string, data: Partial<{
    name: string;
    capacity: number;
    room_number: string;
}>) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can update classes.");
        }
        const supabase = createAdminClient();
        const { error } = await supabase.from("classes").update(data).eq("id", id);
        if (error) throw error;
        revalidatePath("/classes");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
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
        revalidatePath("/classes");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
