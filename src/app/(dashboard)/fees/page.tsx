export const revalidate = 30;

import { createClient } from "@/lib/supabase/server";
import { FeesDashboard } from "@/components/fees/FeesDashboard";
import { getSessionRole } from "@/lib/auth-utils";
import { getFeeDashboardStats } from "@/app/actions/fees";
import { CreditCard, IndianRupee, TrendingUp } from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";

export default async function FeesPage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const { data: { user } } = await supabase.auth.getUser();

  let fees: any[] = [];
  let payments: any[] = [];
  let students: any[] = [];
  let classes: any[] = [];
  let staffPayrolls: any[] = [];
  let leaveRequests: any[] = [];
  const isStudent = role === "student";

  const statsResponse = await getFeeDashboardStats("2026-27");
  const dashboardStats = statsResponse.success ? statsResponse.data : null;

  if (isStudent) {
    const { data: student } = await supabase
      .from("students")
      .select("*, class:classes(*)")
      .eq("profile_id", user?.id)
      .single();

    if (student) {
      const { data: filteredFees } = await supabase
        .from("fees")
        .select("*, class:classes(*)")
        .or(`class_id.eq.${student.class_id},class_id.is.null`)
        .order("created_at", { ascending: false });

      fees = filteredFees || [];

      const { data: filteredPayments } = await supabase
        .from("payments")
        .select("*, fee:fees(*)")
        .eq("student_id", student.id)
        .order("payment_date", { ascending: false });

      payments = filteredPayments || [];
      students = [student];
    }
  } else {
    const { data: allFees } = await supabase
      .from("fees")
      .select("*, class:classes(*)")
      .order("created_at", { ascending: false });
    fees = allFees || [];

    const { data: allPayments } = await supabase
      .from("payments")
      .select("*, student:students(*, profile:profiles(*)), fee:fees(*)")
      .order("payment_date", { ascending: false })
      .limit(50);
    payments = allPayments || [];

    const { data: allStudents } = await supabase
      .from("students")
      .select("*, profile:profiles(*), class:classes(*)")
      .order("admission_number");
    students = allStudents || [];

    const { data: allClasses } = await supabase
      .from("classes")
      .select("*")
      .order("name");
    classes = allClasses || [];

    const { data: allStaffPayrolls } = await supabase
      .from("staff_payrolls")
      .select("*, staff:profiles(*)")
      .order("created_at", { ascending: false })
      .limit(20);
    staffPayrolls = allStaffPayrolls || [];

    const { data: allLeaveRequests } = await supabase
      .from("leave_requests")
      .select("*, staff:profiles!leave_requests_staff_id_fkey(*)")
      .order("created_at", { ascending: false })
      .limit(20);
    leaveRequests = allLeaveRequests || [];
  }

  const totalRevenue = (payments || []).filter(p => p.status === "completed").reduce((sum, p) => sum + Number(p.amount_paid), 0);
  let outstanding = 0;

  if (isStudent) {
    const totalFees = (fees || []).reduce((sum, f) => sum + Number(f.amount), 0);
    outstanding = totalFees - totalRevenue;
  } else {
    const totalFees = (fees || []).reduce((sum, f) => sum + Number(f.amount), 0);
    outstanding = totalFees - totalRevenue;
  }

  const totalPayroll = (staffPayrolls || []).reduce((sum, p) => sum + Number(p.base_salary) + Number(p.bonuses || 0) - Number(p.deductions || 0), 0);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-700">
      <UnifiedPageHeader
        title="Fees"
        subtitle="Manage payments and transactions"
        icon={CreditCard}
        color="emerald"
        actions={
          <button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50">
            <IndianRupee className="h-4 w-4 inline mr-2" />
            Collect Payment
          </button>
        }
      />

      {!isStudent && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DashboardStatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={IndianRupee} color="emerald" description="Total collected" />
          <DashboardStatCard title="Outstanding" value={`₹${outstanding.toLocaleString()}`} icon={CreditCard} color="amber" description="Pending payments" />
          <DashboardStatCard title="Staff Payroll" value={`₹${totalPayroll.toLocaleString()}`} icon={TrendingUp} color="blue" description="Resource allocation" />
        </div>
      )}

      <ERPCard
        title="Fees"
        description="Track payments"
        icon={<CreditCard className="h-5 w-5" />}
        color="emerald"
      >
        <FeesDashboard
            fees={fees || []}
            payments={payments || []}
            students={students || []}
            classes={classes || []}
            staffPayrolls={staffPayrolls || []}
            leaveRequests={leaveRequests || []}
            isStudent={isStudent}
            stats={{
                totalRevenue: totalRevenue,
                outstanding: outstanding,
                staffPayroll: totalPayroll,
            }}
            dashboardStats={dashboardStats}
        />
      </ERPCard>
    </div>
  );
}
