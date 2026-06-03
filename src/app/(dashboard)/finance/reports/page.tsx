import { createClient } from "@/lib/supabase/server";
import { IndianRupee, Calendar, TrendingUp, BarChart3 } from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";

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
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
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

  const { data: todayPayments } = await supabase
    .from("payments")
    .select("*")
    .eq("status", "completed")
    .eq("payment_date", today);

  const todayTotal = todayPayments?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;

  const dailyData: Record<string, number> = {};
  payments?.forEach((p: any) => {
    const date = p.payment_date;
    dailyData[date] = (dailyData[date] || 0) + (p.amount_paid || 0);
  });

  const monthlyData: Record<string, number> = {};
  payments?.forEach((p: any) => {
    const month = p.payment_date.substring(0, 7);
    monthlyData[month] = (monthlyData[month] || 0) + (p.amount_paid || 0);
  });

  const modeData: Record<string, number> = {};
  payments?.forEach((p: any) => {
    modeData[p.payment_mode] = (modeData[p.payment_mode] || 0) + (p.amount_paid || 0);
  });

  const last7Days: { date: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dayPayments = payments?.filter((p: any) => p.payment_date === date) || [];
    last7Days.push({
      date,
      amount: dayPayments.reduce((sum, p) => sum + (p.amount_paid || 0), 0),
    });
  }

  const maxDaily = Math.max(...Object.values(dailyData), 0);

  return (
    <div className="animate-in fade-in duration-700 pb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight text-slate-900">Finance Reports</h1>
          <p className="text-sm text-slate-500">Collection analytics and daily logs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Today</p>
              <p className="text-2xl font-black text-slate-900 mt-1">₹{todayTotal.toLocaleString()}</p>
            </div>
            <Calendar className="h-5 w-5 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">This Month</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                ₹{Object.values(monthlyData).reduce((s, v) => s + v, 0).toLocaleString()}
              </p>
            </div>
            <IndianRupee className="h-5 w-5 text-blue-500" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Last 30 Days</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                ₹{Object.values(dailyData).reduce((s, v) => s + v, 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-5 w-5 text-amber-500" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Transactions</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{payments?.length || 0}</p>
            </div>
            <BarChart3 className="h-5 w-5 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ERPCard title="Daily Collection" description="Last 7 days" color="emerald">
          <div className="space-y-3">
            {last7Days.map((day, i) => {
              const height = maxDaily > 0 ? (day.amount / maxDaily) * 100 : 0;
              const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 w-8">{dayName}</span>
                  <div className="flex-1 h-6 bg-slate-100 rounded-xl overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-xl transition-all"
                      style={{ width: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-900 w-20 text-right">
                    ₹{day.amount.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </ERPCard>

        <ERPCard title="Collection by Mode" description="Payment methods used" color="blue">
          <div className="space-y-3">
            {Object.entries(modeData).map(([mode, amount]) => {
              const total = Object.values(modeData).reduce((s, v) => s + v, 0);
              const percentage = total > 0 ? (amount / total) * 100 : 0;
              
              return (
                <div key={mode} className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 w-24 capitalize">{mode.replace('_', ' ')}</span>
                  <div className="flex-1 h-4 bg-slate-100 rounded-xl overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-xl"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-900 w-16 text-right">
                    ₹{amount.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </ERPCard>
      </div>

      <ERPCard title="Daily Collection Log" description="Recent transactions" color="emerald" icon={<Calendar className="h-5 w-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-left py-4 px-4">Date</th>
                <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-left py-4 px-4">Student</th>
                <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-left py-4 px-4">Class</th>
                <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-left py-4 px-4">Mode</th>
                <th className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-right py-4 px-4">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments?.slice(0, 20).map((payment: any, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 text-sm text-slate-500">{payment.payment_date}</td>
                  <td className="py-4 px-4 text-sm font-bold text-slate-900">
                    {payment.student?.profile?.full_name || "N/A"}
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-500">
                    {payment.student?.class?.name || "N/A"}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 capitalize">
                      {payment.payment_mode?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm font-bold text-emerald-600 text-right">
                    ₹{payment.amount_paid?.toLocaleString()}
                  </td>
                </tr>
              ))}
              {(!payments || payments.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-10 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No transactions recorded yet</p>
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