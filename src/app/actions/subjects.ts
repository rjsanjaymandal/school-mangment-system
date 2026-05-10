"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/types";

export async function createSubject(data: {
    name: string;
    code: string;
    description?: string;
    syllabus?: unknown;
    credits?: number;
}): Promise<ActionResult> {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("subjects").insert(data);
        if (error) throw error;
        revalidatePath("/subjects");
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}

export async function updateSubject(id: string, data: Partial<{
    name: string;
    code: string;
    description: string;
    syllabus: unknown;
    credits: number;
}>): Promise<ActionResult> {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("subjects").update(data).eq("id", id);
        if (error) throw error;
        revalidatePath("/subjects");
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}

export async function deleteSubject(id: string): Promise<ActionResult> {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("subjects").delete().eq("id", id);
        if (error) throw error;
        revalidatePath("/subjects");
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred.";
        return { success: false, error: message };
    }
}
