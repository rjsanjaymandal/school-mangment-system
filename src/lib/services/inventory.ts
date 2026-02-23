import { createClient } from "@/lib/supabase/client";
import { handleServiceError } from "../error-handler";

/**
 * Inventory Service v2
 * High-precision asset tracking and automated procurement workflows.
 */
export const InventoryService = {
  async getStockTelemetry() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("inventory_items")
        .select(`
          *,
          category:inventory_categories(*)
        `);

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        status: item.quantity_in_stock < 10 ? "Critical" : item.quantity_in_stock < 50 ? "Low" : "Optimal"
      }));
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async generateDraftOrder(itemId: string, quantity: number) {
    try {
      const supabase = createClient();
      
      const { data: item, error: fetchError } = await supabase.from("inventory_items").select("*").eq("id", itemId).single();
      if (fetchError || !item) throw fetchError || new Error("Item not found");

      const totalCost = (item.unit_price || 0) * quantity;

      const { data, error } = await supabase
        .from("procurement_orders")
        .insert([{
          item_id: itemId,
          quantity,
          total_cost: totalCost,
          status: "ordered"
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  subscribeToStockUpdates(callback: (payload: any) => void) {
    const supabase = createClient();
    return supabase
      .channel("inventory-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "inventory_items" },
        callback
      )
      .subscribe();
  }
};
