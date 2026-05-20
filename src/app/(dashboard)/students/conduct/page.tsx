import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth-utils";
import { ConductDashboard } from "@/components/students/conduct/ConductDashboard";
import { Shield, Plus } from "lucide-react";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

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
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      <UnifiedPageHeader 
        title="Conduct"
        subtitle="Behavioral Tracking & Records"
        icon={Shield}
        color="purple"
      />

      <ConductDashboard
        records={conductRecords || []}
        students={students || []}
        teachers={teachers || []}
        userRole={role}
      />
    </div>
  );
}
