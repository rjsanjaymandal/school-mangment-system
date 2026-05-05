import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth-utils";
import { HealthDashboard } from "@/components/health/HealthDashboard";
import { HeartPulse, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";

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
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-md">
            <HeartPulse className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Health</h1>
            <p className="text-sm text-slate-500">Medical records and health profiles</p>
          </div>
        </div>
        <Button className="rounded-md bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="h-4 w-4" />
          Add Record
        </Button>
      </div>

      <ERPCard
        title="Health Records"
        description="Track student health"
        icon={<HeartPulse className="h-5 w-5" />}
        color="red"
      >
        <HealthDashboard
          infirmaryLogs={infirmaryLogs || []}
          healthProfiles={healthProfiles || []}
          students={students || []}
          userRole={role}
        />
      </ERPCard>
    </div>
  );
}
