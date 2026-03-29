import { createClient } from "@/lib/supabase/server";
import { FeesDashboard } from "@/components/fees/FeesDashboard";
import { getSessionRole } from "@/lib/auth-utils";
import { DollarSign, Landmark, TrendingUp } from "lucide-react";

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
    <div className="space-y-12 animate-in fade-in transition-all duration-1000">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 reveal-0">
            <div>
                <div className="flex items-center gap-x-3 mb-4">
                    <div className="px-3 py-1 rounded-sm bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-x-2">
                        <Landmark className="h-3 w-3 animate-pulse" />
                        Treasury Node: Live
                    </div>
                    <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest italic text-emerald-500/50">Matrix: Liquidity Matrix</span>
                </div>
                <h2 className="text-6xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                    Finance <span className="text-emerald-500 tracking-normal not-italic">/</span> Treasury
                </h2>
                <p className="text-foreground/50 font-black uppercase tracking-[0.25em] text-[10px] mt-4 flex items-center gap-x-3">
                    <DollarSign className="h-3 w-3 text-emerald-500" />
                    Institutional Liquidity & Revenue Monitoring
                </p>
            </div>
        </div>

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
    </div>
  );
}

