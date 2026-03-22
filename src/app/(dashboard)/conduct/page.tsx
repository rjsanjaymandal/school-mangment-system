import { createClient } from "@/lib/supabase/server";
import { ConductDashboard } from "@/components/conduct/ConductDashboard";

export default async function ConductPage() {
  const supabase = await createClient();

  const { data: conductRecords } = await supabase
    .from("student_conduct")
    .select("*, student:students(*, profile:profiles(*)), teacher:teachers(*, profile:profiles(*))")
    .order("incident_date", { ascending: false })
    .limit(100);

  const { data: students } = await supabase
    .from("students")
    .select("*, profile:profiles(*)")
    .order("admission_number");

  const { data: teachers } = await supabase
    .from("teachers")
    .select("*, profile:profiles(*)")
    .eq("status", "active");

  return (
    <ConductDashboard
      records={conductRecords || []}
      students={students || []}
      teachers={teachers || []}
    />
  );
}

