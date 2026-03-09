import { createClient } from "@/lib/supabase/server";
import { ComplianceDashboard } from "@/components/compliance/ComplianceDashboard";

export default async function ComplianceVault() {
  const supabase = await createClient();

  const { data: documents } = await supabase
    .from("document_archives")
    .select("*, uploader:profiles!uploaded_by(*)")
    .order("created_at", { ascending: false });

  const { data: auditLogs } = await supabase
    .from("audit_logs")
    .select("*, actor:profiles(*)")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <ComplianceDashboard
      documents={documents || []}
      auditLogs={auditLogs || []}
    />
  );
}
