"use server";

import { isAdmin } from "@/lib/auth-utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type GatewayPayload = {
    name: string;
    provider: string;
    is_active?: boolean;
    api_key?: string;
    secret_key?: string;
    webhook_secret?: string;
    config?: Record<string, string>;
};

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

export async function createGateway(data: GatewayPayload) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can manage payment gateways.");
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from("payment_gateways")
            .insert({
                ...data,
                config: data.config || {},
                is_active: data.is_active ?? true,
            });

        if (error) throw error;

        revalidatePath("/finance/gateways");
        revalidatePath("/settings");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating payment gateway:", error);
        return { success: false, error: error.message || "Failed to create gateway" };
    }
}

export async function updateGateway(id: string, data: Partial<GatewayPayload>) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can manage payment gateways.");
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from("payment_gateways")
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/finance/gateways");
        revalidatePath("/settings");
        return { success: true };
    } catch (error: any) {
        console.error(`Error updating gateway ${id}:`, error);
        return { success: false, error: error.message || "Failed to update gateway" };
    }
}

export async function updateGatewayStatus(id: string, is_active: boolean) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can manage payment gateways.");
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from("payment_gateways")
            .update({
                is_active,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/finance/gateways");
        revalidatePath("/settings");
        return { success: true };
    } catch (error: any) {
        console.error(`Error updating gateway ${id}:`, error);
        return { success: false, error: error.message || "Failed to update gateway status" };
    }
}

export async function deleteGateway(id: string) {
    try {
        if (!(await isAdmin())) {
            throw new Error("Unauthorized: Only administrators can manage payment gateways.");
        }

        const supabase = createAdminClient();
        const { error } = await supabase
            .from("payment_gateways")
            .delete()
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/finance/gateways");
        revalidatePath("/settings");
        return { success: true };
    } catch (error: any) {
        console.error(`Error deleting gateway ${id}:`, error);
        return { success: false, error: error.message || "Failed to delete gateway" };
    }
}
