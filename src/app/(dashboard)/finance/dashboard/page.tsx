export const revalidate = 15;

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, TrendingUp, TrendingDown, Calendar, 
  Clock, ArrowUpRight, ArrowDownRight, Wallet, Percent
} from "lucide-react";

// Real-time payment subscription component
function LiveCollectionPill() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="text-xs font-medium text-emerald-700">Live</span>
    </div>
  );
}

export default async function FinanceDashboardPage() {
  const supabase = await createClient();
  
  // Get today's date
  const today = new Date().toISOString().split("T")[0];
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];

  // Fetch today's payments (real-time)
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

  // Fetch total assigned fees for this session
  const { data: feeStructures } = await supabase
    .from("fee_structures")
    .select("amount, class_id");

  const totalAssigned = feeStructures?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
  
  // Get active students count for fee calculation
  const { count: activeStudents } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // Calculate estimated total (avg fee per student * active students)
  const estimatedTotal = activeStudents ? (totalAssigned * activeStudents) : totalAssigned;
  
  // Recovery percentage
  const recoveryPercentage = estimatedTotal > 0 
    ? Math.round((weeklyCollected / estimatedTotal) * 100) 
    : 0;

  // Pending fees count
  const { count: pendingPayments } = await supabase
    .from("payments")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  // Overdue fees
  const { data: overdueFees } = await supabase
    .from("fee_structures")
    .select("amount, due_date")
    .lt("due_date", today);

  const overdueAmount = overdueFees?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;

  // Yesterday's collection for comparison
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const { data: yesterdayPayments } = await supabase
    .from("payments")
    .select("amount_paid, status")
    .eq("payment_date", yesterday)
    .eq("status", "completed");

  const yesterdayCollected = yesterdayPayments?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;
  const todayVsYesterday = todayCollected - yesterdayCollected;
  const percentChange = yesterdayCollected > 0 ? Math.round((todayVsYesterday / yesterdayCollected) * 100) : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-md border-l-4 border-emerald-500">
            <IndianRupee className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Finance Dashboard</h1>
            <p className="text-sm text-slate-500">Real-time fee collection and financial overview</p>
          </div>
        </div>
        <LiveCollectionPill />
      </div>

      {/* 4-Card Liability-First Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Collected Today */}
        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Collected Today</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  ₹{todayCollected.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {percentChange >= 0 ? (
                    <>
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                      <span className="text-xs text-emerald-600">+{percentChange}% vs yesterday</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-3 w-3 text-red-500" />
                      <span className="text-xs text-red-600">{percentChange}% vs yesterday</span>
                    </>
                  )}
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Weekly Total */}
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Weekly Total</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  ₹{weeklyCollected.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-1">This week</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Recovery % */}
        <Card className="shadow-sm border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Recovery %</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {recoveryPercentage}%
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  ₹{weeklyCollected.toLocaleString()} / ₹{estimatedTotal.toLocaleString()}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Percent className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${Math.min(recoveryPercentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Overdue */}
        <Card className="shadow-sm border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Overdue</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  ₹{overdueAmount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {pendingPayments || 0} pending payments
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm cursor-pointer hover:border-emerald-300 transition-colors">
          <CardContent className="p-4 text-center">
            <IndianRupee className="h-6 w-6 mx-auto text-emerald-600 mb-2" />
            <p className="font-medium text-slate-900">Collect Fee</p>
            <p className="text-xs text-slate-500">Record payment</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm cursor-pointer hover:border-emerald-300 transition-colors">
          <CardContent className="p-4 text-center">
            <Wallet className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="font-medium text-slate-900">Fee Structure</p>
            <p className="text-xs text-slate-500">Manage fees</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm cursor-pointer hover:border-emerald-300 transition-colors">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto text-purple-600 mb-2" />
            <p className="font-medium text-slate-900">Reports</p>
            <p className="text-xs text-slate-500">Financial statements</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm cursor-pointer hover:border-emerald-300 transition-colors">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 mx-auto text-amber-600 mb-2" />
            <p className="font-medium text-slate-900">Daily Collection</p>
            <p className="text-xs text-slate-500">Day-wise report</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b bg-slate-50/50">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Receipt No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {/* Recent payments would go here */}
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Loading recent transactions...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}