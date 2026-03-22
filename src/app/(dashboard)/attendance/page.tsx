import { createClient } from "@/lib/supabase/server";
import { AttendanceDashboard } from "@/components/attendance/AttendanceDashboard";

export default async function AttendancePage() {
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .order("name");

  const { data: students } = await supabase
    .from("students")
    .select("*, profile:profiles(*), class:classes(*)")
    .order("admission_number");

  // Get today's attendance
  const today = new Date().toISOString().split("T")[0];
  const { data: todayAttendance } = await supabase
    .from("attendance")
    .select("*, student:students(*, profile:profiles(*))")
    .eq("date", today);

  // Get last 7 days attendance for stats
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: weekAttendance } = await supabase
    .from("attendance")
    .select("status, date")
    .gte("date", sevenDaysAgo.toISOString().split("T")[0]);

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <AttendanceDashboard
      classes={classes || []}
      students={students || []}
      todayAttendance={todayAttendance || []}
      weekAttendance={weekAttendance || []}
      currentUserId={user?.id || ""}
    />
  );
}

