import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth-utils";
import { AttendanceDashboard } from "@/components/attendance/AttendanceDashboard";
import { ClipboardCheck } from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";

export default async function AttendancePage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const { data: { user } } = await supabase.auth.getUser();

  let classes: any[] = [];
  let students: any[] = [];
  let todayAttendance: any[] = [];
  let weekAttendance: any[] = [];
  const isStudent = role === "student";

  if (isStudent) {
    const { data: student } = await supabase
      .from("students")
      .select("*, profile:profiles(*), class:classes(*)")
      .eq("profile_id", user?.id)
      .single();

    if (student) {
      students = [student];
      classes = student.class ? [student.class] : [];

      const today = new Date().toISOString().split("T")[0];
      const { data: todayAtt } = await supabase
        .from("attendance")
        .select("*, student:students(*, profile:profiles(*))")
        .eq("date", today)
        .eq("student_id", student.id);
      
      todayAttendance = todayAtt || [];

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: weekAtt } = await supabase
        .from("attendance")
        .select("status, date")
        .eq("student_id", student.id)
        .gte("date", sevenDaysAgo.toISOString().split("T")[0]);
      
      weekAttendance = weekAtt || [];
    }
  } else {
    const { data: allClasses } = await supabase
      .from("classes")
      .select("*")
      .order("name");
    classes = allClasses || [];

    const { data: allStudents } = await supabase
      .from("students")
      .select("*, profile:profiles(*), class:classes(*)")
      .order("admission_number");
    students = allStudents || [];

    const today = new Date().toISOString().split("T")[0];
    const { data: allTodayAttendance } = await supabase
      .from("attendance")
      .select("*, student:students(*, profile:profiles(*))")
      .eq("date", today);
    todayAttendance = allTodayAttendance || [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: allWeekAttendance } = await supabase
      .from("attendance")
      .select("status, date")
      .gte("date", sevenDaysAgo.toISOString().split("T")[0]);
    weekAttendance = allWeekAttendance || [];
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-amber-50 rounded-md">
          <ClipboardCheck className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
          <p className="text-sm text-slate-500">Track student and staff attendance</p>
        </div>
      </div>

      <ERPCard
        title="Daily Attendance"
        description="Mark present or absent"
        icon={<ClipboardCheck className="h-5 w-5" />}
        color="amber"
      >
        <AttendanceDashboard
          classes={classes || []}
          students={students || []}
          todayAttendance={todayAttendance || []}
          weekAttendance={weekAttendance || []}
          currentUserId={user?.id || ""}
          userRole={role}
          isStudent={isStudent}
        />
      </ERPCard>
    </div>
  );
}
