import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { IndianRupee, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface Payment {
  payment_date: string;
  amount_paid: number;
  payment_mode: string;
  student: {
    profile: { full_name: string };
    class: { name: string };
  };
}

export default async function FinanceReportsPage() {
  const supabase = await createClient();
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  // Get last 30 days of payments for charts
  const msPerDay = 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = new Date(now.getTime() - 30 * msPerDay).toISOString().split('T')[0];
  
  const { data: payments } = await supabase
    .from("payments")
    .select(`
      *,
      student:students(
        profile:profiles(full_name),
        class:classes(name)
      )
    `)
    .eq("status", "completed")
    .gte("payment_date", thirtyDaysAgo)
    .order("payment_date", { ascending: true });

  // Get today's payments
  const { data: todayPayments } = await supabase
    .from("payments")
    .select("*")
    .eq("status", "completed")
    .eq("payment_date", today);

  const todayTotal = todayPayments?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;

  // Group by date for chart
  const dailyData: Record<string, number> = {};
  payments?.forEach((p: any) => {
    const date = p.payment_date;
    dailyData[date] = (dailyData[date] || 0) + (p.amount_paid || 0);
  });

  // Get monthly summary
  const monthlyData: Record<string, number> = {};
  payments?.forEach((p: any) => {
    const month = p.payment_date.substring(0, 7);
    monthlyData[month] = (monthlyData[month] || 0) + (p.amount_paid || 0);
  });

  // Get mode breakdown
  const modeData: Record<string, number> = {};
  payments?.forEach((p: any) => {
    modeData[p.payment_mode] = (modeData[p.payment_mode] || 0) + (p.amount_paid || 0);
  });

  // Get last 7 days summary
  const last7Days: { date: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * msPerDay).toISOString().split('T')[0];
    const dayPayments = payments?.filter((p: any) => p.payment_date === date) || [];
    last7Days.push({
      date,
      amount: dayPayments.reduce((sum, p) => sum + (p.amount_paid || 0), 0),
    });
  }

  const maxDaily = Math.max(...Object.values(dailyData), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-50 rounded-md border-l-4 border-emerald-500">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Finance Reports</h1>
          <p className="text-sm text-slate-500">Collection analytics and daily logs</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Today</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">₹{todayTotal.toLocaleString()}</p>
            </div>
            <Calendar className="h-5 w-5 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">This Month</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                ₹{Object.values(monthlyData).reduce((s, v) => s + v, 0).toLocaleString()}
              </p>
            </div>
            <IndianRupee className="h-5 w-5 text-blue-500" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Last 30 Days</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                ₹{Object.values(dailyData).reduce((s, v) => s + v, 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-amber-500" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Transactions</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">{payments?.length || 0}</p>
            </div>
            <BarChart3 className="h-5 w-5 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Collection Chart */}
        <ERPCard title="Daily Collection" description="Last 7 days" color="emerald">
          <div className="space-y-3">
            {last7Days.map((day, i) => {
              const height = maxDaily > 0 ? (day.amount / maxDaily) * 100 : 0;
              const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-8">{dayName}</span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-md transition-all"
                      style={{ width: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-900 w-20 text-right">
                    ₹{day.amount.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </ERPCard>

        {/* Payment Mode Breakdown */}
        <ERPCard title="Collection by Mode" description="Payment methods used" color="blue">
          <div className="space-y-3">
            {Object.entries(modeData).map(([mode, amount]) => {
              const total = Object.values(modeData).reduce((s, v) => s + v, 0);
              const percentage = total > 0 ? (amount / total) * 100 : 0;
              
              return (
                <div key={mode} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-24 capitalize">{mode.replace('_', ' ')}</span>
                  <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-900 w-16 text-right">
                    ₹{amount.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </ERPCard>
      </div>

      {/* Daily Collection Log */}
      <ERPCard title="Daily Collection Log" description="Recent transactions" color="emerald" icon={<Calendar className="h-5 w-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mode</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments?.slice(0, 20).map((payment: any, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-500">{payment.payment_date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {payment.student?.profile?.full_name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {payment.student?.class?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs capitalize">
                      {payment.payment_mode?.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-600 text-right">
                    ₹{payment.amount_paid?.toLocaleString()}
                  </td>
                </tr>
              ))}
              {(!payments || payments.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No transactions recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ERPCard>
    </div>
  );
}