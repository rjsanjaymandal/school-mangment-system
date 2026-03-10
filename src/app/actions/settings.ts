"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Fetches all school settings and returns them as a keyed object.
 */
export async function getSettings() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("school_settings")
            .select("*");

        if (error) throw error;

        // Map array of {key, value} to { [key]: value }
        const settingsMap = (data || []).reduce((acc: any, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        return { data: settingsMap };
    } catch (error) {
        console.error("Error fetching school settings:", error);
        return { error: "Failed to fetch settings" };
    }
}

/**
 * Updates multiple settings at once using upsert.
 */
export async function updateSettings(settings: Record<string, string | null>, category: string = 'general') {
    try {
        const supabase = createAdminClient();

        // Prepare rows for upsert
        const rows = Object.entries(settings).map(([key, value]) => ({
            key,
            value,
            category
        }));

        const { error } = await supabase
            .from("school_settings")
            .upsert(rows, { onConflict: 'key' });

        if (error) throw error;

        revalidatePath("/settings");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating settings:", error);
        return { success: false, error: error.message || "Failed to update settings" };
    }
}
