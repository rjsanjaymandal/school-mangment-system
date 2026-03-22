import { createClient } from "@/lib/supabase/server";
import { FeesDashboard } from "@/components/fees/FeesDashboard";

export default async function FeesPage() {
  const supabase = await createClient();

  const { data: fees } = await supabase
    .from("fees")
    .select("*, class:classes(*)")
    .order("created_at", { ascending: false });

  const { data: payments } = await supabase
    .from("payments")
    .select("*, student:students(*, profile:profiles(*)), fee:fees(*)")
    .order("payment_date", { ascending: false })
    .limit(50);

  const { data: students } = await supabase
    .from("students")
    .select("*, profile:profiles(*), class:classes(*)")
    .order("admission_number");

  const { data: classes } = await supabase
    .from("classes")
    .select("*")
    .order("name");

  const { data: staffPayrolls } = await supabase
    .from("staff_payrolls")
    .select("*, staff:profiles(*)")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: leaveRequests } = await supabase
    .from("leave_requests")
    .select("*, staff:profiles(*)")
    .order("created_at", { ascending: false })
    .limit(20);

  // Compute stats
  const totalFees = (fees || []).reduce((sum, f) => sum + Number(f.amount), 0);
  const totalPaid = (payments || []).filter(p => p.status === "completed").reduce((sum, p) => sum + Number(p.amount_paid), 0);
  const totalPayroll = (staffPayrolls || []).reduce((sum, p) => sum + Number(p.base_salary) + Number(p.bonuses || 0) - Number(p.deductions || 0), 0);

  return (
    <FeesDashboard
      fees={fees || []}
      payments={payments || []}
      students={students || []}
      classes={classes || []}
      staffPayrolls={staffPayrolls || []}
      leaveRequests={leaveRequests || []}
      stats={{
        totalRevenue: totalPaid,
        outstanding: totalFees - totalPaid,
        staffPayroll: totalPayroll,
      }}
    />
  );
}

