"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getActivities() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("activities")
            .select("*, teacher:profiles!activities_teacher_in_charge_fkey(*)")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { data };
    } catch (error) {
        console.error("Error fetching activities:", error);
        return { error: "Failed to fetch activities" };
    }
}

export async function getActivity(id: string) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("activities")
            .select("*, teacher:profiles!activities_teacher_in_charge_fkey(*)")
            .eq("id", id)
            .single();

        if (error) throw error;
        return { data };
    } catch (error) {
        console.error(`Error fetching activity ${id}:`, error);
        return { error: "Failed to fetch activity" };
    }
}

export async function createActivity(data: {
    name: string;
    description?: string;
    category?: string;
    teacher_in_charge?: string;
    location?: string;
    schedule?: string;
    max_participants?: number;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("activities").insert(data);

        if (error) throw error;

        revalidatePath("/activities");
        return { success: true };
    } catch (error) {
        console.error("Error creating activity:", error);
        return { error: "Failed to create activity" };
    }
}

export async function updateActivity(id: string, data: {
    name?: string;
    description?: string;
    category?: string;
    teacher_in_charge?: string;
    location?: string;
    schedule?: string;
    max_participants?: number;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("activities")
            .update(data)
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/activities");
        return { success: true };
    } catch (error) {
        console.error(`Error updating activity ${id}:`, error);
        return { error: "Failed to update activity" };
    }
}

export async function deleteActivity(id: string) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("activities")
            .delete()
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/activities");
        return { success: true };
    } catch (error) {
        console.error(`Error deleting activity ${id}:`, error);
        return { error: "Failed to delete activity" };
    }
}

export async function enrollStudentInActivity(activityId: string, studentId: string) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("activity_enrollments")
            .upsert({
                activity_id: activityId,
                student_id: studentId,
                status: "enrolled"
            });

        if (error) throw error;

        revalidatePath("/activities");
        return { success: true };
    } catch (error) {
        console.error("Error enrolling student:", error);
        return { error: "Failed to enroll student" };
    }
}
