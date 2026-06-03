"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getInventoryCategories() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("inventory_categories")
            .select("*")
            .order("name", { ascending: true });

        if (error) throw error;
        return { data };
    } catch (error) {
        console.error("Error fetching inventory categories:", error);
        return { error: "Failed to fetch inventory categories" };
    }
}

export async function getInventoryItems() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("inventory_items")
            .select("*, category:inventory_categories(name)")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return { data };
    } catch (error) {
        console.error("Error fetching inventory items:", error);
        return { error: "Failed to fetch inventory items" };
    }
}

export async function createInventoryItem(data: {
    name: string;
    category_id?: string;
    quantity_in_stock: number;
    unit_price: number;
    sku?: string;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("inventory_items").insert(data);

        if (error) throw error;

        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error("Error creating inventory item:", error);
        return { error: "Failed to create inventory item" };
    }
}

export async function updateInventoryItem(id: string, data: {
    name?: string;
    category?: string;
    quantity_in_stock?: number;
    unit_price?: number;
    sku?: string;
    min_stock_level?: number;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("inventory_items")
            .update(data)
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error(`Error updating inventory item ${id}:`, error);
        return { error: "Failed to update item" };
    }
}

export async function updateStock(id: string, quantity_in_stock: number) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("inventory_items")
            .update({ quantity_in_stock })
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error(`Error updating stock for item ${id}:`, error);
        return { error: "Failed to update stock" };
    }
}

export async function deleteInventoryItem(id: string) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("inventory_items")
            .delete()
            .eq("id", id);

        if (error) throw error;

        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error(`Error deleting inventory item ${id}:`, error);
        return { error: "Failed to delete item" };
    }
}
