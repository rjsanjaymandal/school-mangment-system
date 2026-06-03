export const revalidate = 30;
export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { PayrollDashboard } from "@/components/finance/payroll/PayrollDashboard";
import { getSessionRole } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { PayrollService } from "@/lib/services/payroll";

export default async function PayrollPage() {
  const role = await getSessionRole();
  
  // Strict Security: Only admins can access payroll
  if (role !== "admin" && role !== "super_admin") {
    redirect("/unauthorized");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch initial data with error handling
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  let payrollsData: any[] = [];
  let leaveData: any[] = [];
  let statsData: any = {};
  let staffData: any[] = [];

  try {
    const [payrollsRes, leaveRes, statsRes, staffRes] = await Promise.allSettled([
      PayrollService.getAllPayrolls({ month: currentMonth, year: currentYear }, supabase),
      PayrollService.getLeaveRequests({ status: 'pending' }, supabase),
      PayrollService.getPayrollSummary(currentYear, supabase),
      supabase.from("profiles").select("id, full_name, role, email").in("role", ["teacher", "admin", "staff"]).order("full_name")
    ]);

    if (payrollsRes.status === 'fulfilled') payrollsData = payrollsRes.value.data || [];
    if (leaveRes.status === 'fulfilled') leaveData = leaveRes.value.data || [];
    if (statsRes.status === 'fulfilled') statsData = statsRes.value.data || {};
    if (staffRes.status === 'fulfilled') staffData = staffRes.value.data || [];
  } catch (e) {
    console.error("Payroll page data fetch error:", e);
  }

  return (
    <PayrollDashboard 
      initialPayrolls={payrollsData}
      pendingLeaveRequests={leaveData}
      yearlyStats={statsData}
      staffMembers={staffData}
    />
  );
}
