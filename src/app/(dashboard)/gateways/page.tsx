export const revalidate = 30;
export const dynamic = 'force-static';

import { createClient } from "@/lib/supabase/server";
import { GatewaysDashboardClient } from "@/components/gateways/GatewaysDashboardClient";

export default async function GatewayHub() {
  const supabase = await createClient();
  const { data: gateways } = await supabase
    .from("payment_gateways")
    .select("*")
    .order("name", { ascending: true });

  return <GatewaysDashboardClient initialGateways={gateways || []} />;
}
