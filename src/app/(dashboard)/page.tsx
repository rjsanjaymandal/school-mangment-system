export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { DemographicsPanel } from "@/components/dashboard/DemographicsPanel";
import { PredictiveAnalytics } from "@/components/dashboard/PredictiveAnalytics";
import { ERPCard } from "@/components/ui/erp-card";
import { Users, BarChart3, GraduationCap, UserSquare2, Library, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Date ranges
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];

  // Safe query helper
  const safeQuery = async (queryBuilder: any) => {
    try {
      const result = await queryBuilder;
      return result.error ? { data: [], error: null } : result;
    } catch (e) {
      return { data: [], error: null };
    }
  };

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
    safeQuery(supabase.from("attendance").select("status, date").gte("date", thirtyDaysAgo.toISOString().split("T")[0])),
    safeQuery(supabase.from("attendance").select("status, date").lt("date", thirtyDaysAgo.toISOString().split("T")[0]).gte("date", sixtyDaysAgo.toISOString().split("T")[0])),
    safeQuery(supabase.from("marks").select("marks_obtained, exam:exams(max_marks, passing_marks)").gte("created_at", thirtyDaysAgo.toISOString())),
    safeQuery(supabase.from("marks").select("marks_obtained, exam:exams(max_marks, passing_marks)").lt("created_at", thirtyDaysAgo.toISOString()).gte("created_at", sixtyDaysAgo.toISOString())),
    safeQuery(supabase.from("school_settings").select("key, value")),
    safeQuery(supabase.from("inventory_items").select("name, quantity_in_stock, min_stock_level").filter("quantity_in_stock", "lt", "min_stock_level").limit(3)),
    safeQuery(supabase.from("attendance").select("student_id, status").gte("date", thirtyDaysAgo.toISOString().split("T")[0])),
    safeQuery(supabase.from("attendance").select("status, date").gte("date", yearStart)),
    safeQuery(supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student")),
    safeQuery(supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher")),
    safeQuery(supabase.from("payments").select("amount_paid, status, payment_date").limit(50)),
    safeQuery(supabase.from("library_books").select("*", { count: "exact", head: true })),
    safeQuery(supabase.from("library_transactions").select("*", { count: "exact", head: true }).eq("status", "issued")),
    safeQuery(supabase.from("student_conduct").select("type, points")),
    // Demographics: students with demographic fields + class name
    safeQuery(supabase.from("students").select("id, gender, date_of_birth, category, religion, class_id, class:classes(name)").limit(100)),
    // All classes for filter dropdown
    safeQuery(supabase.from("classes").select("id, name").order("name")),
    // Document counts per student (grouped)
    safeQuery(supabase.from("student_documents").select("student_id").limit(100)),
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

  const targetRevenue = parseFloat(settings?.find((s: any) => s.key === "target_revenue")?.value || "5000000");

  // Low attendance calculation
  const studentStats: Record<string, { total: number; present: number }> = {};
  attendanceSummary?.forEach((a: any) => {
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

  // New Metrics Aggregation
  const metrics = await getDashboardMetrics();

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-white/50 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl futuristic-card">
            <BarChart3 className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              School <span className="text-emerald-600 font-light">Dashboard</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              Daily Overview of Students & Staff
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 glass rounded-2xl border border-emerald-100/50 shadow-sm futuristic-card">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">System Status: Active</span>
        </div>
      </div>

      {/* Stats Grid - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={studentCount || 0}
          icon={GraduationCap}
          color="emerald"
        />
        <StatCard
          title="Active Teachers"
          value={teacherCount || 0}
          icon={UserSquare2}
          color="blue"
        />
        <StatCard
          title="Library Asset Index"
          value={totalBooks || 0}
          icon={Library}
          color="purple"
        />
        <StatCard
          title="Asset Circulation"
          value={activeLoans || 0}
          icon={BookOpen}
          color="amber"
        />
      </div>

      {/* Modern Dashboard Sections */}
      <DashboardOverview initialData={metrics} />
    </div>
  );
}

import { getDashboardMetrics } from "@/app/actions/dashboard-metrics";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: number; 
  icon: any; 
  color: string 
}) {
  const accentColorClasses: Record<string, string> = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
  };
  
  const borderColors: Record<string, string> = {
    emerald: "border-l-emerald-500",
    blue: "border-l-blue-500",
    purple: "border-l-purple-500",
    amber: "border-l-amber-500",
  };

  return (
    <div className={cn(
      "glass futuristic-card rounded-2xl p-5 border-l-4 shadow-sm",
      borderColors[color]
    )}>
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-xl border flex items-center justify-center", accentColorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
