import { createClient } from "@/lib/supabase/server";
import { FeesDashboard } from "@/components/fees/FeesDashboard";
import { getSessionRole } from "@/lib/auth-utils";

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
  let isStudent = role === "student";

  if (isStudent) {
    // Fetch only this student's specific data
    const { data: student } = await supabase
      .from("students")
      .select("*, class:classes(*)")
      .eq("profile_id", user?.id)
      .single();

    if (student) {
      // Get fees for student's class or global fees
      const { data: filteredFees } = await supabase
        .from("fees")
        .select("*, class:classes(*)")
        .or(`class_id.eq.${student.class_id},class_id.is.null`)
        .order("created_at", { ascending: false });
      
      fees = filteredFees || [];

      // Get payments for this student only
      const { data: filteredPayments } = await supabase
        .from("payments")
        .select("*, fee:fees(*)")
        .eq("student_id", student.id)
        .order("payment_date", { ascending: false });
      
      payments = filteredPayments || [];
      students = [student];
    }
  } else {
    // Admin/Teacher: Fetch all data
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
      .select("*, staff:profiles(*)")
      .order("created_at", { ascending: false })
      .limit(20);
    leaveRequests = allLeaveRequests || [];
  }

  // Compute stats
  let totalRevenue = (payments || []).filter(p => p.status === "completed").reduce((sum, p) => sum + Number(p.amount_paid), 0);
  let outstanding = 0;

  if (isStudent) {
    // For students, outstanding is (Sum of all assigned fees) - (Sum of their payments)
    const totalFees = (fees || []).reduce((sum, f) => sum + Number(f.amount), 0);
    outstanding = totalFees - totalRevenue;
  } else {
    // For admin, global outstanding
    const totalFees = (fees || []).reduce((sum, f) => sum + Number(f.amount), 0); // This is an approximation for admin
    outstanding = totalFees - totalRevenue;
  }

  const totalPayroll = (staffPayrolls || []).reduce((sum, p) => sum + Number(p.base_salary) + Number(p.bonuses || 0) - Number(p.deductions || 0), 0);

  return (
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
    />
  );
}

