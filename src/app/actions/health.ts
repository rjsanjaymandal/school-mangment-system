"use server";

import { isAdminOrTeacher } from "@/lib/auth-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ===== HEALTH PROFILES =====

export async function upsertHealthProfile(studentId: string, data: {
    blood_group?: string;
    allergies?: string[];
    chronic_conditions?: string[];
    medications?: string[];
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    insurance_number?: string;
}) {
    try {
        if (!(await isAdminOrTeacher())) {
            throw new Error("Unauthorized: Only administrators and teachers can manage health profiles.");
        }
        const supabase = createAdminClient();
        const { error } = await supabase.from("health_profiles").upsert({
            id: studentId,
            ...data,
            updated_at: new Date().toISOString(),
        });
        if (error) throw error;
        revalidatePath("/health");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getHealthProfile(studentId: string) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("health_profiles")
            .select("*")
            .eq("id", studentId)
            .maybeSingle();
        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message, data: null };
    }
}

// ===== INFIRMARY LOGS =====

export async function createInfirmaryLog(data: {
    student_id: string;
    recorded_by?: string;
    visit_reason: string;
    symptoms?: string;
    treatment_provided?: string;
    medication_given?: string;
    temperature?: number;
}) {
    try {
        if (!(await isAdminOrTeacher())) {
            throw new Error("Unauthorized: Only administrators and teachers can record infirmary visits.");
        }
        const supabase = createAdminClient();
        const { error } = await supabase.from("infirmary_logs").insert(data);
        if (error) throw error;
        revalidatePath("/health");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function dischargeFromInfirmary(logId: string) {
    try {
        if (!(await isAdminOrTeacher())) {
            throw new Error("Unauthorized: Only administrators and teachers can discharge infirmary visits.");
        }
        const supabase = createAdminClient();
        const { error } = await supabase.from("infirmary_logs").update({
            check_out_time: new Date().toISOString(),
            status: "discharged",
        }).eq("id", logId);
        if (error) throw error;
        revalidatePath("/health");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateInfirmaryStatus(logId: string, status: "under_observation" | "discharged" | "referral") {
    try {
        if (!(await isAdminOrTeacher())) {
            throw new Error("Unauthorized: Only administrators and teachers can update infirmary visits.");
        }
        const supabase = createAdminClient();
        const updatePayload: Record<string, string> = { status };

        if (status === "discharged") {
            updatePayload.check_out_time = new Date().toISOString();
        }

        const { error } = await supabase
            .from("infirmary_logs")
            .update(updatePayload)
            .eq("id", logId);

        if (error) throw error;
        revalidatePath("/health");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
