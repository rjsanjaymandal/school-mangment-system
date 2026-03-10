"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getGateways() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("payment_gateways")
            .select("*")
            .order("name", { ascending: true });

        if (error) throw error;
        return { data };
    } catch (error) {
        console.error("Error fetching payment gateways:", error);
        return { error: "Failed to fetch gateways" };
    }
}

export async function updateGatewayStatus(id: string, is_active: boolean) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("payment_gateways")
            .update({ is_active })
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/settings");
        return { success: true };
    } catch (error) {
        console.error(`Error updating gateway ${id}:`, error);
        return { error: "Failed to update gateway status" };
    }
}
