"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getSettings() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("school_settings")
            .select("*")
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'not found', handled via returning null
        return { data };
    } catch (error) {
        console.error("Error fetching school settings:", error);
        return { error: "Failed to fetch settings" };
    }
}

export async function updateSettings(id: string | undefined, data: any) {
    try {
        const supabase = createAdminClient();
        if (id) {
            const { error } = await supabase.from("school_settings").update(data).eq("id", id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from("school_settings").insert(data);
            if (error) throw error;
        }

        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating settings:", error);
        return { error: "Failed to update settings" };
    }
}
