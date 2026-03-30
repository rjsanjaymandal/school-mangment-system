import { createClient } from "@/lib/supabase/server";
import { PayrollDashboard } from "@/components/payroll/PayrollDashboard";
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

  // Fetch initial data
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [payrollsRes, leaveRes, statsRes, staffRes] = await Promise.all([
    PayrollService.getAllPayrolls({ month: currentMonth, year: currentYear }),
    PayrollService.getLeaveRequests({ status: 'pending' }),
    PayrollService.getPayrollSummary(currentYear),
    supabase.from("profiles").select("id, full_name, role, email").in("role", ["teacher", "admin", "staff"]).order("full_name")
  ]);

  return (
    <PayrollDashboard 
      initialPayrolls={payrollsRes.data || []}
      pendingLeaveRequests={leaveRes.data || []}
      yearlyStats={statsRes.data || {}}
      staffMembers={staffRes.data || []}
    />
  );
}
