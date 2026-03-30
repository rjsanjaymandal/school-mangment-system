import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth-utils";
import { HealthDashboard } from "@/components/health/HealthDashboard";

export default async function HealthPage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const { data: { user } } = await supabase.auth.getUser();

  let infirmaryLogs: any[] = [];
  let healthProfiles: any[] = [];
  let students: any[] = [];
  const isStudent = role === "student";

  if (isStudent) {
    const { data: student } = await supabase
      .from("students")
      .select("*, profile:profiles(*)")
      .eq("id", user?.id)
      .maybeSingle();

    if (student) {
      const { data: logs } = await supabase
        .from("infirmary_logs")
        .select("*, student:students(*, profile:profiles(*)), recorder:profiles!recorded_by(*)")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false });
      
      infirmaryLogs = logs || [];

      const { data: profile } = await supabase
        .from("health_profiles")
        .select("*")
        .eq("id", student.id)
        .maybeSingle();
      
      healthProfiles = profile ? [profile] : [];
      students = [student];
    }
  } else {
    // Admin/Teacher: All data
    const { data: allLogs } = await supabase
      .from("infirmary_logs")
      .select("*, student:students(*, profile:profiles(*)), recorder:profiles!recorded_by(*)")
      .order("created_at", { ascending: false })
      .limit(50);
    infirmaryLogs = allLogs || [];

    const { data: allProfiles } = await supabase
      .from("health_profiles")
      .select("*")
      .limit(50);
    healthProfiles = allProfiles || [];

    const { data: allStudents } = await supabase
      .from("students")
      .select("*, profile:profiles(*)")
      .order("admission_number");
    students = allStudents || [];
  }

  return (
    <HealthDashboard
      infirmaryLogs={infirmaryLogs || []}
      healthProfiles={healthProfiles || []}
      students={students || []}
      userRole={role}
    />
  );
}
