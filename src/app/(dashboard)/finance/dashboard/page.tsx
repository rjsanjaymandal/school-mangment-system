import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { IndianRupee, TrendingUp, Calendar, Wallet, CreditCard, Receipt, BarChart3, Users } from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FinanceDashboardSkeleton } from "@/components/finance/FinanceDashboardSkeleton";

export const dynamic = "force-dynamic";

interface DashboardStats {
  total_students: number;
  total_assigned: number;
  total_collected: number;
  total_pending: number;
  collected_today: number;
  collected_week: number;
  collected_month: number;
  recovery_percentage: number;
  class_wise_data: any[];
  top_pending_families: any[];
}

async function getFeeStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  
  // Try to use RPC function, fallback to manual queries
  try {
    const { data, error } = await supabase.rpc('get_fee_dashboard_stats', { 
      p_academic_year: '2026-27' 
    });
    
    if (!error && data) {
      return {
        total_students: data[0]?.total_students || 0,
        total_assigned: Number(data[0]?.total_assigned) || 0,
        total_collected: Number(data[0]?.total_collected) || 0,
        total_pending: Number(data[0]?.total_pending) || 0,
        collected_today: Number(data[0]?.collected_today) || 0,
        collected_week: Number(data[0]?.collected_week) || 0,
        collected_month: Number(data[0]?.collected_month) || 0,
        recovery_percentage: Number(data[0]?.recovery_percentage) || 0,
        class_wise_data: data[0]?.class_wise_data || [],
        top_pending_families: data[0]?.top_pending_families || []
      };
    }
  } catch (e) {
    // RPC not available, fall back to manual queries
  }

  // Fallback: Manual queries with parallel execution
  const today = new Date().toISOString().split('T')[0];
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [studentsRes, feeStructuresRes, todayPaymentsRes, weekPaymentsRes, monthPaymentsRes, sessionPaymentsRes, classDataRes, familiesRes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("fees").select("*").eq("academic_year", "2026-27"),
    supabase.from("payments").select("amount_paid").eq("status", "completed").gte("payment_date", today),
    supabase.from("payments").select("amount_paid").eq("status", "completed").gte("payment_date", weekStart),
    supabase.from("payments").select("amount_paid").eq("status", "completed").gte("payment_date", monthStart),
    supabase.from("payments").select("amount_paid").eq("status", "completed"),
    supabase.from("classes").select("id, name").order("name"),
    supabase.from("students").select("id, admission_number, class_id, profile:profiles(full_name), class:classes(name)")
  ]);

  const totalStudents = studentsRes.count || 0;
  const feeStructures = feeStructuresRes.data || [];
  
  const totalAssigned = feeStructures.reduce((sum, f: any) => sum + ((f.amount || 0) * totalStudents), 0);
  
  const collectedToday = (todayPaymentsRes.data || []).reduce((sum, p: any) => sum + (p.amount_paid || 0), 0);
  const collectedWeek = (weekPaymentsRes.data || []).reduce((sum, p: any) => sum + (p.amount_paid || 0), 0);
  const collectedMonth = (monthPaymentsRes.data || []).reduce((sum, p: any) => sum + (p.amount_paid || 0), 0);
  const collectedSession = (sessionPaymentsRes.data || []).reduce((sum, p: any) => sum + (p.amount_paid || 0), 0);
  
  const recoveryPercentage = totalAssigned > 0 ? (collectedSession / totalAssigned) * 100 : 0;

  // Class wise data
  const classes = classDataRes.data || [];
  const classWiseData = classes.map((c: any) => {
    const classFeeAmount = feeStructures.filter((f: any) => f.class_id === c.name).reduce((sum, f) => sum + (f.amount || 0), 0);
    const studentsInClass = (familiesRes.data || []).filter((s: any) => s.class_id === c.id).length;
    return {
      class_name: c.name,
      assigned: classFeeAmount * studentsInClass,
      collected: 0,
      pending: (classFeeAmount * studentsInClass)
    };
  });

  return {
    total_students: totalStudents,
    total_assigned: totalAssigned,
    total_collected: collectedSession,
    total_pending: totalAssigned - collectedSession,
    collected_today: collectedToday,
    collected_week: collectedWeek,
    collected_month: collectedMonth,
    recovery_percentage: recoveryPercentage,
    class_wise_data: classWiseData,
    top_pending_families: []
  };
}

async function DashboardContent() {
  const stats = await getFeeStats();
  
  const { 
    total_students, total_assigned, total_collected, total_pending,
    collected_today, collected_week, collected_month, recovery_percentage,
    class_wise_data, top_pending_families 
  } = stats;
  
  const collected_session = total_collected;

  const maxClassCollection = Math.max(...class_wise_data.map((c: any) => c.assigned), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-md border-l-4 border-emerald-500">
            <IndianRupee className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Fee Collection Dashboard</h1>
            <p className="text-sm text-slate-500">Session: 2026-27</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select className="border border-slate-200 rounded-md px-3 py-2 text-sm">
            <option>2026-27</option>
            <option>2025-26</option>
            <option>2024-25</option>
          </select>
          <Link href="/finance/collect">
            <Button className="bg-emerald-600 hover:bg-emerald-700 rounded-md">
              <CreditCard className="h-4 w-4 mr-2" />
              Collect Fees
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. Header Stats - 4 Card Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Collected Today</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹{collected_today.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-md">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            <span>↑ {((collected_today / (total_assigned || 1)) * 100).toFixed(2)}% of Total</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">This Week</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹{collected_week.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-md">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            <span>↑ {((collected_week / (total_assigned || 1)) * 100).toFixed(2)}% of Total</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">This Month</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹{collected_month.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-md">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            <span>↑ {((collected_month / (total_assigned || 1)) * 100).toFixed(2)}% of Total</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase">Session Total</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">₹{collected_session.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-md">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
            <span>Recovered: {recovery_percentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* 2. Middle Section - Visual Analytics */}
      <div className="grid grid-cols-5 gap-4">
        {/* Class-wise Collection Bar Chart (60%) */}
        <div className="col-span-3 bg-white border border-slate-200 rounded-md shadow-sm">
          <div className="p-4 border-b border-slate-100 border-l-4 border-l-emerald-500">
            <h3 className="text-sm font-semibold text-slate-900">Class-wise Collection Status</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {class_wise_data.slice(0, 8).map((cls: any, i: number) => {
                const collectedPct = cls.assigned > 0 ? (cls.collected / cls.assigned) * 100 : 0;
                const pending = cls.assigned - cls.collected;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{cls.class_name}</span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-emerald-600">₹{cls.collected?.toLocaleString() || 0}</span>
                        <span className="text-rose-600">₹{pending?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-emerald-500"
                        style={{ width: `${collectedPct}%` }}
                      />
                      <div 
                        className="h-full bg-rose-400"
                        style={{ width: `${100 - collectedPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top 10 Pending Families (40%) */}
        <div className="col-span-2 bg-white border border-slate-200 rounded-md shadow-sm">
          <div className="p-4 border-b border-slate-100 border-l-4 border-l-rose-500">
            <h3 className="text-sm font-semibold text-slate-900">Top 10 High Pending Families</h3>
          </div>
          <div className="p-4 space-y-3">
            {top_pending_families.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No pending families found
              </div>
            ) : (
              top_pending_families.slice(0, 10).map((family: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 bg-rose-50 rounded-md border border-rose-100">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-semibold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{family.parent_name}</p>
                      <p className="text-xs text-slate-500">{family.student_count} student(s)</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-rose-600">₹{family.total_pending?.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Class Summary Table */}
        <ERPCard title="Class Summary" description="Fee collection by class" color="emerald" icon={<BarChart3 className="h-5 w-5" />}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase">Class</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase">Assigned</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase">Paid</th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-slate-500 uppercase">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {class_wise_data.map((cls: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-900">{cls.class_name}</td>
                    <td className="px-3 py-2 text-right text-slate-600">₹{cls.assigned?.toLocaleString() || 0}</td>
                    <td className="px-3 py-2 text-right text-emerald-600">₹{cls.collected?.toLocaleString() || 0}</td>
                    <td className="px-3 py-2 text-right text-rose-600">₹{cls.pending?.toLocaleString() || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ERPCard>

        {/* Family Ledger */}
        <ERPCard title="Family Ledger" description="Search families for pending fees" color="blue" icon={<Users className="h-5 w-5" />}>
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Search by parent name or phone..."
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
            />
            <div className="text-center py-8 text-slate-400 text-sm">
              Select a class to view family ledgers
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 rounded-md">
              View All Families
            </Button>
          </div>
        </ERPCard>
      </div>
    </div>
  );
}

export default function FinanceDashboardPage() {
  return (
    <div className="p-6">
      <Suspense fallback={<FinanceDashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}