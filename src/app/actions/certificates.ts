"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getCertificates() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("certificates")
            .select("*, student:students(*, profile:profiles(*)), issuer:profiles!certificates_issued_by_fkey(*)")
            .order("issued_date", { ascending: false });

        if (error) throw error;
        return { data };
    } catch (error) {
        console.error("Error fetching certificates:", error);
        return { error: "Failed to fetch certificates" };
    }
}

export async function generateCertificate(data: {
    student_id: string;
    type: string;
    issued_by?: string;
    remarks?: string;
}) {
    try {
        const supabase = createAdminClient();

        // Generate a unique reference number (e.g., CERT-2024-XXXX)
        const year = new Date().getFullYear();
        const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
        const reference_number = `CERT-${year}-${randomString}`;

        const insertData = {
            ...data,
            reference_number,
            status: "issued"
        };

        const { error } = await supabase.from("certificates").insert(insertData);

        if (error) throw error;

        revalidatePath("/certificates");
        return { success: true, reference_number };
    } catch (error) {
        console.error("Error generating certificate:", error);
        return { error: "Failed to generate certificate log" };
    }
}

export async function revokeCertificate(id: string) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("certificates")
            .update({ status: "revoked" })
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/certificates");
        return { success: true };
    } catch (error) {
        console.error(`Error revoking certificate ${id}:`, error);
        return { error: "Failed to revoke certificate" };
    }
}
