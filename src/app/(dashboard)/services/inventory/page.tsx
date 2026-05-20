export const revalidate = 30;

import { createClient } from "@/lib/supabase/server";
import InventoryDashboardClient from "@/components/services/inventory/InventoryDashboardClient";
import { getSessionRole } from "@/lib/auth-utils";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";

export default async function ProcurementHub() {
  const supabase = await createClient();
  const role = await getSessionRole();

  const { data: inventoryItems, error } = await supabase
    .from("inventory_items")
    .select("*, category:inventory_categories(name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching inventory items inside page:", error);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-md">
            <Package className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
            <p className="text-sm text-slate-500">Manage school inventory</p>
          </div>
        </div>
        <Button className="rounded-md bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <ERPCard
        title="Inventory Management"
        description="Track and manage school supplies"
        icon={<Package className="h-5 w-5" />}
        color="amber"
      >
        <InventoryDashboardClient initialInventory={inventoryItems || []} userRole={role} />
      </ERPCard>
    </div>
  );
}
