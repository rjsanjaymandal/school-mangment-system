import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth-utils";
import { HealthDashboard } from "@/components/health/HealthDashboard";
import { Stethoscope, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

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
    <div className="p-6 space-y-8 animate-in fade-in duration-1000">
      <UnifiedPageHeader 
        title="Institutional Health"
        subtitle="Medical registry and infirmary diagnostics"
        icon={Stethoscope}
        color="rose"
        actions={
          role !== 'student' && (
            <Button className="h-11 rounded-xl bg-slate-900 text-white hover:bg-black font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95">
              <Plus className="h-4 w-4 mr-2" /> Record Visit
            </Button>
          )
        }
      />

      <div className="animate-in slide-in-from-bottom-4 duration-700 delay-150">
        <HealthDashboard
          infirmaryLogs={infirmaryLogs || []}
          healthProfiles={healthProfiles || []}
          students={students || []}
          userRole={role}
        />
      </div>
    </div>
  );
}
