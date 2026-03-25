import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth-utils";
import { AttendanceDashboard } from "@/components/attendance/AttendanceDashboard";

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
    // Fetch only this student's specific data
    const { data: student } = await supabase
      .from("students")
      .select("*, profile:profiles(*), class:classes(*)")
      .eq("profile_id", user?.id)
      .single();

    if (student) {
      students = [student];
      classes = student.class ? [student.class] : [];

      // Get this student's attendance for today
      const today = new Date().toISOString().split("T")[0];
      const { data: todayAtt } = await supabase
        .from("attendance")
        .select("*, student:students(*, profile:profiles(*))")
        .eq("date", today)
        .eq("student_id", student.id);
      
      todayAttendance = todayAtt || [];

      // Get this student's attendance for the last 7 days
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
    // Admin/Teacher: Fetch all data
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
    <AttendanceDashboard
      classes={classes || []}
      students={students || []}
      todayAttendance={todayAttendance || []}
      weekAttendance={weekAttendance || []}
      currentUserId={user?.id || ""}
      userRole={role}
      isStudent={isStudent}
    />
  );
}
