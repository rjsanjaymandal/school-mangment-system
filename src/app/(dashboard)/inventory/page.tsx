import { createClient } from "@/lib/supabase/server";
import InventoryDashboardClient from "@/components/inventory/InventoryDashboardClient";

export default async function ProcurementHub() {
  const supabase = await createClient();

  const { data: inventoryItems, error } = await supabase
    .from("inventory_items")
    .select("*, category:inventory_categories(name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching inventory items inside page:", error);
  }

  return <InventoryDashboardClient initialInventory={inventoryItems || []} />;
}
