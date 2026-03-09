import { createClient } from "@/lib/supabase/server";
import { HealthDashboard } from "@/components/health/HealthDashboard";

export default async function HealthPage() {
  const supabase = await createClient();

  const { data: infirmaryLogs } = await supabase
    .from("infirmary_logs")
    .select("*, student:students(*, profile:profiles(*)), recorder:profiles!recorded_by(*)")
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: healthProfiles } = await supabase
    .from("health_profiles")
    .select("*")
    .limit(50);

  const { data: students } = await supabase
    .from("students")
    .select("*, profile:profiles(*)")
    .order("admission_number");

  return (
    <HealthDashboard
      infirmaryLogs={infirmaryLogs || []}
      healthProfiles={healthProfiles || []}
      students={students || []}
    />
  );
}
