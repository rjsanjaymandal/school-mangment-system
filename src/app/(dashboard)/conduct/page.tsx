import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth-utils";
import { ConductDashboard } from "@/components/conduct/ConductDashboard";
import { Shield, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";

export default async function ConductPage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const { data: { user } } = await supabase.auth.getUser();

  let conductRecords: any[] = [];
  let students: any[] = [];
  let teachers: any[] = [];
  const isStudent = role === "student";

  if (isStudent) {
    const { data: student } = await supabase
      .from("students")
      .select("*")
      .eq("profile_id", user?.id)
      .single();

    if (student) {
      const { data: records } = await supabase
        .from("student_conduct")
        .select("*, student:students(*, profile:profiles(*)), teacher:teachers(*, profile:profiles(*))")
        .eq("student_id", student.id)
        .order("incident_date", { ascending: false });
      
      conductRecords = records || [];
      students = [student];
    }
  } else {
    const { data: allRecords } = await supabase
      .from("student_conduct")
      .select("*, student:students(*, profile:profiles(*)), teacher:teachers(*, profile:profiles(*))")
      .order("incident_date", { ascending: false })
      .limit(100);
    conductRecords = allRecords || [];

    const { data: allStudents } = await supabase
      .from("students")
      .select("*, profile:profiles(*)")
      .order("admission_number");
    students = allStudents || [];

    const { data: allTeachers } = await supabase
      .from("teachers")
      .select("*, profile:profiles(*)")
      .eq("status", "active");
    teachers = allTeachers || [];
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-violet-50 rounded-md">
            <Shield className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Conduct</h1>
            <p className="text-sm text-slate-500">Track student behavior records</p>
          </div>
        </div>
        <Button className="rounded-md bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="h-4 w-4" />
          Add Record
        </Button>
      </div>

      <ERPCard
        title="Behavior Records"
        description="Track merits and demerits"
        icon={<Shield className="h-4 w-4" />}
        color="purple"
      >
        <ConductDashboard
          records={conductRecords || []}
          students={students || []}
          teachers={teachers || []}
          userRole={role}
        />
      </ERPCard>
    </div>
  );
}
