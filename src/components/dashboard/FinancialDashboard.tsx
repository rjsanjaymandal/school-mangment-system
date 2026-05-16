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
  const collectionVsExpenseRatio = (metrics?.todayCollection || 0) > 0 
    ? ((metrics?.todayExpenses || 0) / metrics.todayCollection) * 100 
    : ((metrics?.todayExpenses || 0) > 0 ? 100 : 0);

  const payrollPaidPercentage = (metrics?.payroll?.generated || 0) > 0 
    ? ((metrics?.payroll?.paid || 0) / metrics.payroll.generated) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Dual-Metric Cash Flow */}
      <ERPCard 
        title="Daily Cash Flow" 
        description="Today's collections vs operational costs" 
        icon={<IndianRupee className="h-4 w-4" />}
        color="emerald"
        className="lg:col-span-1 glass futuristic-card border-none shadow-xl rounded-2xl"
      >
        <div className="space-y-8 p-2">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Collections</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-600 tracking-tighter">₹{(metrics?.todayCollection || 0).toLocaleString()}</span>
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Expenses</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-rose-600 tracking-tighter">₹{(metrics?.todayExpenses || 0).toLocaleString()}</span>
                <ArrowDownRight className="h-4 w-4 text-rose-500" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
              <span>Operational Efficiency</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[9px]",
                collectionVsExpenseRatio > 80 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
              )}>
                {collectionVsExpenseRatio.toFixed(1)}% Ratio
              </span>
            </div>
            <Progress value={collectionVsExpenseRatio} className="h-2 bg-slate-100/50" />
          </div>
        </div>
      </ERPCard>

      {/* Staff Payroll Tracker */}
      <ERPCard 
        title="Institutional Payroll" 
        description="Salary generated vs paid liabilities" 
        icon={<Wallet className="h-4 w-4" />}
        color="blue"
        className="lg:col-span-2 glass futuristic-card border-none shadow-xl rounded-2xl"
      >
        <div className="p-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Salary Generated</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{(metrics?.payroll?.generated || 0).toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Amount Paid</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-black text-emerald-600 tracking-tighter">₹{(metrics?.payroll?.paid || 0).toLocaleString()}</p>
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Pending Liability</p>
              <p className="text-2xl font-black text-rose-600 tracking-tighter">₹{(metrics?.payroll?.pending || 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-slate-50/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-100/50 shadow-inner">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-blue-600" />
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.1em]">Disbursement Progress</span>
              </div>
              <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{payrollPaidPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={payrollPaidPercentage} className="h-3 bg-white shadow-sm" />
            
            {(metrics?.payroll?.pending || 0) > 0 && (
              <div className="mt-5 flex items-center gap-2.5 text-rose-600 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100/50">
                <AlertCircle className="h-4 w-4" />
                <p className="text-[10px] font-black uppercase tracking-wider">Critical Action Required: Unpaid Staff Liabilities Detected</p>
              </div>
            )}
          </div>
        </div>
      </ERPCard>
    </div>
  );
}
