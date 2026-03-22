import { createClient } from "@/lib/supabase/server";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // Student count
  const { count: studentCount } = await supabase.from("students").select("*", { count: "exact", head: true });

  // Teacher count
  const { count: teacherCount } = await supabase.from("teachers").select("*", { count: "exact", head: true }).eq("status", "active");

  // Attendance data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: attendanceData } = await supabase
    .from("attendance")
    .select("status, date")
    .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

  // Fee collection summary
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, payment_date, status");

  // Exam results
  const { data: marks } = await supabase
    .from("marks")
    .select("marks_obtained, exam:exams(max_marks, passing_marks)");

  // Library stats
  const { count: totalBooks } = await supabase.from("library_books").select("*", { count: "exact", head: true });
  const { count: activeLoans } = await supabase.from("library_transactions").select("*", { count: "exact", head: true }).eq("status", "issued");

  // Conduct summary
  const { data: conductData } = await supabase.from("student_conduct").select("type, points");

  // Monthly attendance grouped
  const { data: monthlyAttendance } = await supabase
    .from("attendance")
    .select("status, date")
    .gte("date", new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0]);

  return (
    <AnalyticsDashboard
      studentCount={studentCount || 0}
      teacherCount={teacherCount || 0}
      attendanceData={attendanceData || []}
      payments={payments || []}
      marks={marks || []}
      totalBooks={totalBooks || 0}
      activeLoans={activeLoans || 0}
      conductData={conductData || []}
      monthlyAttendance={monthlyAttendance || []}
    />
  );
}

