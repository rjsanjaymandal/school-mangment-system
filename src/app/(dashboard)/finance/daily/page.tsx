import { createClient } from "@/lib/supabase/server";
import { IndianRupee, Calendar, Clock, CreditCard, CheckCircle, TrendingUp, BarChart3, Activity } from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DailyCollectionPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  // Get today's payments
  const { data: todayPayments } = await supabase
    .from("payments")
    .select(`
      *,
      student:students(
        profile:profiles(full_name),
        class:classes(name)
      )
    `)
    .eq("status", "completed")
    .gte("payment_date", today)
    .order("payment_date", { ascending: false });

  const totalCollected = todayPayments?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;
  const transactionCount = todayPayments?.length || 0;

  // Group by mode
  const modeData: Record<string, number> = {};
  todayPayments?.forEach((p: any) => {
    modeData[p.payment_mode] = (modeData[p.payment_mode] || 0) + (p.amount_paid || 0);
  });

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      {/* Unified Page Header */}
      <UnifiedPageHeader 
        title="Daily Collection"
        subtitle={`Transaction log for ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
        icon={Clock}
        color="emerald"
      />

      {/* Unified Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardStatCard 
          title="Total Collected" 
          value={`₹${totalCollected.toLocaleString()}`} 
          icon={IndianRupee} 
          color="emerald" 
          description="Fees collected today"
        />
        <DashboardStatCard 
          title="Payments" 
          value={transactionCount} 
          icon={CreditCard} 
          color="blue" 
          description="Completed transactions"
        />
        <DashboardStatCard 
          title="Average Payment" 
          value={`₹${transactionCount > 0 ? Math.round(totalCollected / transactionCount).toLocaleString() : 0}`} 
          icon={TrendingUp} 
          color="purple" 
          description="Average per student"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Collection Breakdown */}
        <div className="lg:col-span-1">
          <ERPCard 
            title="Payment Methods" 
            description="Breakdown of how students paid" 
            color="emerald"
            icon={<BarChart3 className="h-5 w-5" />}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-6"
          >
            <div className="space-y-5 mt-4">
              {Object.entries(modeData).map(([mode, amount]) => {
                const percentage = totalCollected > 0 ? (amount / totalCollected) * 100 : 0;
                return (
                  <div key={mode} className="space-y-2">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mode.replace('_', ' ')}</span>
                       <span className="text-xs font-black text-slate-900 dark:text-white">₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50">
                      <div className={cn(
                        "h-full rounded-full transition-all duration-1000 shadow-sm",
                        mode === 'cash' ? "bg-emerald-500" : "bg-blue-500"
                      )} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
              {Object.keys(modeData).length === 0 && (
                <div className="py-12 text-center">
                    <Activity className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No payments today</p>
                </div>
              )}
            </div>
          </ERPCard>
        </div>

        {/* Real-time Ledger */}
        <div className="lg:col-span-2">
          <ERPCard 
            title="Recent Transactions" 
            description="Recent payments received today" 
            color="blue" 
            icon={<CheckCircle className="h-5 w-5" />}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-4 px-4">Time</th>
                    <th className="py-4 px-4">Student</th>
                    <th className="py-4 px-4">Class</th>
                    <th className="py-4 px-4">Mode</th>
                    <th className="py-4 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {todayPayments?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No data available</p>
                      </td>
                    </tr>
                  ) : (
                    todayPayments?.map((payment: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-100 dark:border-slate-800">
                        <td className="py-4 px-4 text-slate-400 font-mono text-[10px] font-bold">
                          {payment.payment_date?.substring(11, 16) || "--:--"}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{payment.student?.profile?.full_name || "N/A"}</span>
                        </td>
                        <td className="py-4 px-4">
                           <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{payment.student?.class?.name || "N/A"}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-[9px] font-black uppercase text-slate-400 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-md tracking-tighter shadow-sm bg-white dark:bg-slate-900 capitalize">
                            {payment.payment_mode?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-black text-emerald-600 text-sm">
                          ₹{payment.amount_paid?.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ERPCard>
        </div>
      </div>
    </div>
  );
}