import { createClient } from "@/lib/supabase/server";
import { FeesDashboard } from "@/components/fees/FeesDashboard";
import { getSessionRole } from "@/lib/auth-utils";
import { CreditCard, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";

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
      .select("*, staff:profiles(*)")
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-md">
            <CreditCard className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Fees</h1>
            <p className="text-sm text-slate-500">Manage payments and transactions</p>
          </div>
        </div>
        <Button className="rounded-md bg-emerald-600 hover:bg-emerald-700 gap-2">
          <DollarSign className="h-4 w-4" />
          Collect Payment
        </Button>
      </div>

      {/* Stats Grid */}
      {!isStudent && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-600">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase">Outstanding</p>
            <p className="text-2xl font-bold text-amber-600">₹{outstanding.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 uppercase">Staff Payroll</p>
            <p className="text-2xl font-bold text-slate-900">₹{totalPayroll.toLocaleString()}</p>
          </div>
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
        />
      </ERPCard>
    </div>
  );
}

