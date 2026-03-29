import { createClient } from "@/lib/supabase/server";
import AuditDashboardClient from "@/components/audit/AuditDashboardClient";

export default async function AuditPage() {
  const supabase = await createClient();

  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select("*, actor:profiles(*)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching audit logs:", error.message, error.details);
  }

  return <AuditDashboardClient logs={logs || []} />;
}

