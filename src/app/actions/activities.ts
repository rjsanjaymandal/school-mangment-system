"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { isAdminOrTeacher } from "@/lib/auth-utils";

export async function createActivity(data: {
    name: string;
    description: string;
    category: string;
    location: string;
    schedule: string;
    max_participants: number;
    teacher_in_charge?: string;
}) {
    const authorized = await isAdminOrTeacher();
    if (!authorized) return { success: false, message: "Unauthorized" };

    try {
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin
            .from("activities")
            .insert(data);

        if (error) throw error;
        revalidatePath("/activities");
        return { success: true, message: "Activity protocol initialized" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function enrollInActivity(activityId: string, studentId: string) {
    try {
        const supabaseAdmin = createAdminClient();
        
        // Check capacity
        const { data: activity } = await supabaseAdmin
            .from("activities")
            .select("max_participants")
            .eq("id", activityId)
            .single();

        const { count } = await supabaseAdmin
            .from("activity_enrollments")
            .select("*", { count: 'exact', head: true })
            .eq("activity_id", activityId);

        if (activity && count !== null && count >= activity.max_participants) {
            return { success: false, message: "Activity node at maximum capacity" };
        }

        const { error } = await supabaseAdmin
            .from("activity_enrollments")
            .insert({
                activity_id: activityId,
                student_id: studentId,
                status: "enrolled"
            });

        if (error) throw error;
        revalidatePath("/activities");
        return { success: true, message: "Student successfully enrolled in activity node" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
