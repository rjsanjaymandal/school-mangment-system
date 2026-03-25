"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { isAdminOrTeacher } from "@/lib/auth-utils";

export async function issueCertificate(data: {
    student_id: string;
    type: string;
    remarks?: string;
}) {
    const authorized = await isAdminOrTeacher();
    if (!authorized) return { success: false, message: "Unauthorized" };

    try {
        const supabaseAdmin = createAdminClient();
        
        // Generate a unique reference number
        const refNumber = `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const { error } = await supabaseAdmin
            .from("certificates")
            .insert({
                student_id: data.student_id,
                type: data.type,
                remarks: data.remarks,
                reference_number: refNumber,
                status: "issued"
            });

        if (error) throw error;
        revalidatePath("/certificates");
        return { success: true, message: `Digital Certificate ${refNumber} issued successfully` };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function revokeCertificate(id: string) {
    const authorized = await isAdminOrTeacher();
    if (!authorized) return { success: false, message: "Unauthorized" };

    try {
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin
            .from("certificates")
            .update({ status: "revoked" })
            .eq("id", id);

        if (error) throw error;
        revalidatePath("/certificates");
        return { success: true, message: "Certificate revoked from digital registry" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
