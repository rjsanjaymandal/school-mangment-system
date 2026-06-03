export const revalidate = 15;

import { createClient } from "@/lib/supabase/server";
import { 
  IndianRupee, TrendingUp, TrendingDown, Calendar, 
  Clock, ArrowUpRight, ArrowDownRight, Wallet, Percent,
  Activity, Receipt, BarChart3, PieChart
} from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { cn } from "@/lib/utils";

// Real-time payment subscription component
function LiveCollectionPill() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-sm shadow-emerald-500/5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live Payments</span>
    </div>
  );
}

export default async function FinanceDashboardPage() {
  const supabase = await createClient();
  
  // Get today's date
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const msPerDay = 24 * 60 * 60 * 1000;
  const weekStart = new Date(now.getTime() - 7 * msPerDay).toISOString().split("T")[0];

  // Fetch today's payments
  const { data: todayPayments } = await supabase
    .from("payments")
    .select("amount_paid, status")
    .eq("payment_date", today)
    .eq("status", "completed");

  const todayCollected = todayPayments?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;

  // Fetch weekly payments
  const { data: weeklyPayments } = await supabase
    .from("payments")
    .select("amount_paid, status")
    .gte("payment_date", weekStart)
    .eq("status", "completed");

  const weeklyCollected = weeklyPayments?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;

  // Fetch total assigned fees
  const { data: feeStructures } = await supabase
    .from("fee_structures")
    .select("amount, class_id");

  const totalAssigned = feeStructures?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
  
  const { count: activeStudents } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const estimatedTotal = activeStudents ? (totalAssigned * activeStudents) : totalAssigned;
  
  const recoveryPercentage = estimatedTotal > 0 
    ? Math.round((weeklyCollected / estimatedTotal) * 100) 
    : 0;

  const { count: pendingPayments } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { data: overdueFees } = await supabase
    .from("fee_structures")
    .select("amount, due_date")
    .lt("due_date", today);

  const overdueAmount = overdueFees?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;

  // Comparison logic
  const yesterday = new Date(now.getTime() - msPerDay).toISOString().split("T")[0];
  const { data: yesterdayPayments } = await supabase
    .from("payments")
    .select("amount_paid, status")
    .eq("payment_date", yesterday)
    .eq("status", "completed");

  const yesterdayCollected = yesterdayPayments?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;
  const todayVsYesterday = todayCollected - yesterdayCollected;
  const percentChange = yesterdayCollected > 0 ? Math.round((todayVsYesterday / yesterdayCollected) * 100) : 0;

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      {/* Unified Page Header */}
      <UnifiedPageHeader 
        title="Finance"
        subtitle="Track school revenue, fees, and collections"
        icon={IndianRupee}
        color="emerald"
        actions={<LiveCollectionPill />}
      />

      {/* Unified Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStatCard 
          title="Today's Collection" 
          value={`₹${todayCollected.toLocaleString()}`} 
          icon={IndianRupee} 
          color="emerald" 
          trend={{ value: `${Math.abs(percentChange)}%`, isUp: percentChange >= 0 }}
        />
        <DashboardStatCard 
          title="Weekly Collection" 
          value={`₹${weeklyCollected.toLocaleString()}`} 
          icon={Calendar} 
          color="blue" 
          description="Total this week"
        />
        <DashboardStatCard 
          title="Fee Recovery" 
          value={`${recoveryPercentage}%`} 
          icon={Percent} 
          color="purple" 
          description="Collection target"
        />
        <DashboardStatCard 
          title="Outstanding Fees" 
          value={`₹${overdueAmount.toLocaleString()}`} 
          icon={Clock} 
          color="rose" 
          description={`${pendingPayments || 0} pending payments`}
        />
      </div>

      {/* Quick Action Framework */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-700 delay-150">
        <FinanceActionCard title="New Payment" desc="Collect fees" icon={Receipt} color="emerald" />
        <FinanceActionCard title="Fee Setup" desc="Manage fees" icon={Wallet} color="blue" />
        <FinanceActionCard title="Reports" desc="Finance charts" icon={BarChart3} color="purple" />
        <FinanceActionCard title="Transactions" desc="Daily log" icon={Calendar} color="amber" />
      </div>

      {/* Recent Payments */}
      <ERPCard
        title="Recent Payments"
        description="Daily log of all completed transactions"
        icon={<TrendingUp className="h-5 w-5" />}
        color="emerald"
        className="bg-white border border-slate-200 rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th className="py-4 px-4">Receipt</th>
                <th className="py-4 px-4">Student Name</th>
                <th className="py-4 px-4">Class</th>
                <th className="py-4 px-4 text-center">Amount</th>
                <th className="py-4 px-4 text-center">Mode</th>
                <th className="py-4 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td colSpan={6} className="py-4 px-4 text-center">
                   <div className="flex flex-col items-center py-16">
                      <div className="p-6 bg-slate-50 rounded-full mb-4 animate-pulse">
                         <PieChart className="h-10 w-10 text-slate-200" />
                      </div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Loading Transactions...</p>
                   </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ERPCard>
    </div>
  );
}

function FinanceActionCard({ title, desc, icon: Icon, color }: { title: string; desc: string; icon: any; color: string }) {
  const colors: Record<string, string> = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:scale-[1.05] transition-all group hover:shadow-2xl">
      <div className={cn("h-12 w-12 mx-auto rounded-xl border flex items-center justify-center mb-4 transition-all group-hover:rotate-12", colors[color])}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-sm font-black text-slate-900 tracking-tight uppercase mb-1">{title}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{desc}</p>
    </div>
  );
}