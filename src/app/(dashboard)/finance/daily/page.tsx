import { createClient } from "@/lib/supabase/server";
import { IndianRupee, Calendar, Clock, CreditCard, CheckCircle } from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";
import { Badge } from "@/components/ui/badge";

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

  // Group by hour
  const hourlyData: Record<string, number> = {};
  todayPayments?.forEach((p: any) => {
    const hour = p.payment_date?.substring(11, 16) || "00:00";
    hourlyData[hour] = (hourlyData[hour] || 0) + (p.amount_paid || 0);
  });

  // Group by mode
  const modeData: Record<string, number> = {};
  todayPayments?.forEach((p: any) => {
    modeData[p.payment_mode] = (modeData[p.payment_mode] || 0) + (p.amount_paid || 0);
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-50 rounded-md border-l-4 border-emerald-500">
          <Clock className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Daily Collection</h1>
          <p className="text-sm text-slate-500">Real-time transaction logs for {today}</p>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Collected Today</p>
              <p className="text-4xl font-bold mt-2">₹{totalCollected.toLocaleString()}</p>
            </div>
            <IndianRupee className="h-10 w-10 text-emerald-300" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Transactions</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{transactionCount}</p>
            </div>
            <CreditCard className="h-5 w-5 text-blue-500" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Avg. Transaction</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                ₹{transactionCount > 0 ? Math.round(totalCollected / transactionCount).toLocaleString() : 0}
              </p>
            </div>
            <Calendar className="h-5 w-5 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Collection by Mode */}
        <div className="lg:col-span-1">
          <ERPCard title="By Payment Mode" description="Collection breakdown" color="emerald">
            <div className="space-y-3">
              {Object.entries(modeData).map(([mode, amount]) => {
                const percentage = totalCollected > 0 ? (amount / totalCollected) * 100 : 0;
                return (
                  <div key={mode} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-24 capitalize">{mode.replace('_', ' ')}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-xs font-medium text-slate-900 w-20 text-right">₹{amount.toLocaleString()}</span>
                  </div>
                );
              })}
              {Object.keys(modeData).length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No collections today</p>
              )}
            </div>
          </ERPCard>
        </div>

        {/* Transaction Log */}
        <div className="lg:col-span-2">
          <ERPCard title="Transaction Log" description="All payments today" color="blue" icon={<CheckCircle className="h-5 w-5" />}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Time</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Student</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Class</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Mode</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayPayments?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-slate-400">
                        No transactions recorded today
                      </td>
                    </tr>
                  ) : (
                    todayPayments?.map((payment: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-500 font-mono text-xs">
                          {payment.payment_date?.substring(11, 16) || "--:--"}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-900">
                          {payment.student?.profile?.full_name || "N/A"}
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {payment.student?.class?.name || "N/A"}
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {payment.payment_mode?.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-emerald-600">
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