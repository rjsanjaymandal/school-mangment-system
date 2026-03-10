"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getAlumniList() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("alumni")
            .select("*")
            .order("graduation_year", { ascending: false });

        if (error) throw error;
        return { data };
    } catch (error) {
        console.error("Error fetching alumni:", error);
        return { error: "Failed to fetch alumni" };
    }
}

export async function getAlumni(id: string) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("alumni")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        return { data };
    } catch (error) {
        console.error(`Error fetching alumni ${id}:`, error);
        return { error: "Failed to fetch alumni profile" };
    }
}

export async function createAlumni(data: {
    first_name: string;
    last_name: string;
    graduation_year: number;
    email?: string;
    phone?: string;
    current_profession?: string;
    company?: string;
    achievements?: string;
    profile_picture_url?: string;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("alumni").insert(data);

        if (error) throw error;

        revalidatePath("/heritage");
        return { success: true };
    } catch (error) {
        console.error("Error creating alumni:", error);
        return { error: "Failed to create alumni record" };
    }
}

export async function updateAlumni(id: string, data: {
    first_name?: string;
    last_name?: string;
    graduation_year?: number;
    email?: string;
    phone?: string;
    current_profession?: string;
    company?: string;
    achievements?: string;
    profile_picture_url?: string;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("alumni")
            .update(data)
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/heritage");
        return { success: true };
    } catch (error) {
        console.error(`Error updating alumni ${id}:`, error);
        return { error: "Failed to update alumni record" };
    }
}

export async function deleteAlumni(id: string) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("alumni")
            .delete()
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/heritage");
        return { success: true };
    } catch (error) {
        console.error(`Error deleting alumni ${id}:`, error);
        return { error: "Failed to delete alumni record" };
    }
}
