export const revalidate = 30;
export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import InventoryDashboardClient from "@/components/services/inventory/InventoryDashboardClient";
import { getSessionRole } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function ProcurementHub() {
  const role = await getSessionRole();

  if (role !== "admin" && role !== "teacher" && role !== "staff") {
    redirect("/unauthorized");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let inventoryItems: any[] = [];

  try {
    const { data } = await supabase
      .from("inventory_items")
      .select("*, category:inventory_categories(name)")
      .order("created_at", { ascending: false });

    if (data) inventoryItems = data;
  } catch (e) {
    console.error("Failed to fetch inventory:", e);
  }

  return (
    <InventoryDashboardClient initialInventory={inventoryItems} userRole={role} />
  );
}
