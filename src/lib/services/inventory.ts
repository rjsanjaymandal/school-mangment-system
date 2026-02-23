import { createClient } from "@/lib/supabase/client";

/**
 * Inventory Service v2
 * High-precision asset tracking and automated procurement workflows.
 */
export const InventoryService = {
  async getStockTelemetry() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("inventory_items")
      .select(`
        *,
        category:inventory_categories(*)
      `);

    if (error) throw error;
    
    // Logic for low-stock triggers
    return data.map(item => ({
      ...item,
      status: item.quantity_in_stock < 10 ? "Critical" : item.quantity_in_stock < 50 ? "Low" : "Optimal"
    }));
  },

  async generateDraftOrder(itemId: string, quantity: number) {
    const supabase = createClient();
    
    // Fetch item for pricing context
    const { data: item } = await supabase.from("inventory_items").select("*").eq("id", itemId).single();
    if (!item) throw new Error("Item not found");

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
  }
};
