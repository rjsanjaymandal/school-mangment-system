"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getAuditLogs() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("audit_logs")
            .select("*, actor:profiles(*)")
            .order("created_at", { ascending: false })
            .limit(50); // Get recent 50 for UI

        if (error) throw error;
        return { data };
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return { error: "Failed to fetch audit logs" };
    }
}
