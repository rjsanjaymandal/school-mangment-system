"use client";

import { ERPCard } from "@/components/ui/erp-card";
import { IndianRupee, ArrowUpRight, ArrowDownRight, Wallet, History, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FinancialDashboardProps {
  metrics: {
    todayCollection: number;
    todayExpenses: number;
    payroll: {
      generated: number;
      paid: number;
      pending: number;
    };
  };
}

export function FinancialDashboard({ metrics }: FinancialDashboardProps) {
  const collectionVsExpenseRatio = metrics.todayCollection > 0 
    ? (metrics.todayExpenses / metrics.todayCollection) * 100 
    : (metrics.todayExpenses > 0 ? 100 : 0);

  const payrollPaidPercentage = metrics.payroll.generated > 0 
    ? (metrics.payroll.paid / metrics.payroll.generated) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Dual-Metric Cash Flow */}
      <ERPCard 
        title="Daily Cash Flow" 
        description="Today's collections vs operational costs" 
        icon={<IndianRupee className="h-4 w-4" />}
        color="emerald"
        className="lg:col-span-1"
      >
        <div className="space-y-6 p-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collections</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-emerald-600">₹{metrics.todayCollection.toLocaleString()}</span>
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expenses</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-rose-600">₹{metrics.todayExpenses.toLocaleString()}</span>
                <ArrowDownRight className="h-3 w-3 text-rose-500" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight text-slate-500">
              <span>Expense Ratio</span>
              <span className={cn(
                collectionVsExpenseRatio > 80 ? "text-rose-600" : "text-emerald-600"
              )}>
                {collectionVsExpenseRatio.toFixed(1)}%
              </span>
            </div>
            <Progress value={collectionVsExpenseRatio} className="h-1.5 bg-slate-100" />
          </div>
        </div>
      </ERPCard>

      {/* Staff Payroll Tracker */}
      <ERPCard 
        title="Institutional Payroll" 
        description="Salary generated vs paid liabilities" 
        icon={<Wallet className="h-4 w-4" />}
        color="blue"
        className="lg:col-span-2"
      >
        <div className="p-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Salary Generated</p>
              <p className="text-lg font-black text-slate-900">₹{metrics.payroll.generated.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount Paid</p>
              <p className="text-lg font-black text-emerald-600">₹{metrics.payroll.paid.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Liability</p>
              <p className="text-lg font-black text-rose-600">₹{metrics.payroll.pending.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Disbursement Progress</span>
              </div>
              <span className="text-xs font-black text-blue-600">{payrollPaidPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={payrollPaidPercentage} className="h-2 bg-white" />
            
            {metrics.payroll.pending > 0 && (
              <div className="mt-4 flex items-center gap-2 text-rose-600">
                <AlertCircle className="h-3.5 w-3.5" />
                <p className="text-[10px] font-bold uppercase tracking-tight">Requires attention: pending salaries</p>
              </div>
            )}
          </div>
        </div>
      </ERPCard>
    </div>
  );
}
