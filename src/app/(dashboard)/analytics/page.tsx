import { createClient } from "@/lib/supabase/server";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { DemographicsPanel } from "@/components/analytics/DemographicsPanel";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // Date ranges
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];

  // Parallelize ALL independent queries (original + demographics)
  const [
    currentAttendanceRes,
    previousAttendanceRes,
    currentMarksRes,
    previousMarksRes,
    settingsRes,
    lowInventoryRes,
    attendanceSummaryRes,
    monthlyAttendanceRes,
    studentCountRes,
    teacherCountRes,
    paymentsRes,
    totalBooksRes,
    activeLoansRes,
    conductDataRes,
    // Demographics queries
    demographicStudentsRes,
    classListRes,
    documentCountsRes,
  ] = await Promise.all([
    // Original queries
    supabase.from("attendance").select("status, date").gte("date", thirtyDaysAgo.toISOString().split("T")[0]),
    supabase.from("attendance").select("status, date").lt("date", thirtyDaysAgo.toISOString().split("T")[0]).gte("date", sixtyDaysAgo.toISOString().split("T")[0]),
    supabase.from("marks").select("marks_obtained, exam:exams(max_marks, passing_marks)").gte("created_at", thirtyDaysAgo.toISOString()),
    supabase.from("marks").select("marks_obtained, exam:exams(max_marks, passing_marks)").lt("created_at", thirtyDaysAgo.toISOString()).gte("created_at", sixtyDaysAgo.toISOString()),
    supabase.from("school_settings").select("key, value"),
    supabase.from("inventory_items").select("name, quantity_in_stock, min_stock_level").filter("quantity_in_stock", "lt", "min_stock_level").limit(3),
    supabase.from("attendance").select("student_id, status").gte("date", thirtyDaysAgo.toISOString().split("T")[0]),
    supabase.from("attendance").select("status, date").gte("date", yearStart),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("payments").select("amount_paid, status, payment_date"),
    supabase.from("library_books").select("*", { count: "exact", head: true }),
    supabase.from("library_transactions").select("*", { count: "exact", head: true }).eq("status", "issued"),
    supabase.from("student_conduct").select("type, points"),
    // Demographics: students with demographic fields + class name
    supabase.from("students").select("id, gender, date_of_birth, category, religion, class_id, class:classes(name)"),
    // All classes for filter dropdown
    supabase.from("classes").select("id, name").order("name"),
    // Document counts per student (grouped)
    supabase.from("student_documents").select("student_id"),
  ]);

  // Original data extraction
  const currentAttendance = currentAttendanceRes.data || [];
  const previousAttendance = previousAttendanceRes.data || [];
  const currentMarks = currentMarksRes.data || [];
  const previousMarks = previousMarksRes.data || [];
  const settings = settingsRes.data || [];
  const lowInventory = lowInventoryRes.data || [];
  const attendanceSummary = attendanceSummaryRes.data || [];
  const monthlyAttendance = monthlyAttendanceRes.data || [];
  const studentCount = studentCountRes.count || 0;
  const teacherCount = teacherCountRes.count || 0;
  const payments = paymentsRes.data || [];
  const totalBooks = totalBooksRes.count || 0;
  const activeLoans = activeLoansRes.count || 0;
  const conductData = conductDataRes.data || [];

  const targetRevenue = parseFloat(settings?.find(s => s.key === "target_revenue")?.value || "5000000");

  // Low attendance calculation
  const studentStats: Record<string, { total: number; present: number }> = {};
  attendanceSummary?.forEach(a => {
    if (!studentStats[a.student_id]) studentStats[a.student_id] = { total: 0, present: 0 };
    studentStats[a.student_id].total++;
    if (a.status === "present") studentStats[a.student_id].present++;
  });

  const lowAttendanceStudentIds = Object.entries(studentStats)
    .filter(([_, stats]) => (stats.present / stats.total) < 0.75)
    .map(([id]) => id)
    .slice(0, 3);

  let lowAttendanceStudents: any[] = [];
  if (lowAttendanceStudentIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("full_name")
      .in("id", lowAttendanceStudentIds);
    lowAttendanceStudents = profiles || [];
  }

  // Demographics data extraction
  const demographicStudents = (demographicStudentsRes.data || []).map((s: any) => ({
    id: s.id,
    gender: s.gender,
    date_of_birth: s.date_of_birth,
    category: s.category || "General",
    religion: s.religion || "Not Specified",
    class_id: s.class_id,
    class: s.class,
  }));

  const classList = (classListRes.data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
  }));

  // Count documents per student
  const docRaw = documentCountsRes.data || [];
  const docCountMap: Record<string, number> = {};
  docRaw.forEach((d: any) => {
    docCountMap[d.student_id] = (docCountMap[d.student_id] || 0) + 1;
  });
  const documentStats = Object.entries(docCountMap).map(([student_id, doc_count]) => ({
    student_id,
    doc_count,
  }));

  return (
    <div className="page-container page-fade-in space-y-16">
      <AnalyticsDashboard
        studentCount={studentCount || 0}
        teacherCount={teacherCount || 0}
        currentAttendance={currentAttendance || []}
        previousAttendance={previousAttendance || []}
        payments={payments || []}
        currentMarks={currentMarks || []}
        previousMarks={previousMarks || []}
        totalBooks={totalBooks || 0}
        activeLoans={activeLoans || 0}
        conductData={conductData || []}
        monthlyAttendance={monthlyAttendance || []}
        targetRevenue={targetRevenue}
        alerts={{
          lowInventory: lowInventory?.map(i => i.name) || [],
          lowAttendanceCount: lowAttendanceStudentIds.length,
          lowAttendanceNames: lowAttendanceStudents.map(s => s.full_name)
        }}
      />

      {/* Advanced Demographics Section */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-12">
        <DemographicsPanel
          students={demographicStudents}
          classes={classList}
          documentStats={documentStats}
        />
      </div>
    </div>
  );
}
