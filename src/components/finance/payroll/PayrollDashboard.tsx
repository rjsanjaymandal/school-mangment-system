"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  Search,
  Filter,
  UserCheck,
  CalendarDays,
  Zap,
  ChevronRight,
  Activity,
  ShieldCheck,
  ReceiptText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { processPayroll, updateLeaveStatus } from "@/app/actions/payroll";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Shared UI Framework
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { ERPCard } from "@/components/ui/erp-card";

interface PayrollDashboardProps {
  initialPayrolls: any[];
  pendingLeaveRequests: any[];
  yearlyStats: any;
  staffMembers: any[];
  currentUserId: string;
}

export function PayrollDashboard({ 
  initialPayrolls, 
  pendingLeaveRequests, 
  yearlyStats,
  staffMembers,
  currentUserId
}: PayrollDashboardProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const filteredPayrolls = initialPayrolls.filter(p => 
    p.staff?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProcessPayroll = async (id: string) => {
    setProcessing(id);
    const result = await processPayroll(id);
    setProcessing(null);
    if (result.success) {
      toast.success("Payment processed");
      router.refresh();
    } else {
      toast.error(result.error || "Payment failed");
    }
  };

  const handleLeaveAction = async (id: string, status: 'approved' | 'rejected') => {
    const result = await updateLeaveStatus(id, status, currentUserId);
    if (result.success) {
      toast.success(`Leave request ${status}`);
      router.refresh();
    } else {
      toast.error(result.error || "Action failed");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      {/* Unified Page Header */}
      <UnifiedPageHeader 
        title="Payroll"
        subtitle="Manage staff salaries, bonuses, and leave requests"
        icon={CreditCard}
        color="blue"
        actions={
          <button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50">
            <Plus className="h-4 w-4 inline mr-2" /> Pay Salaries
          </button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStatCard 
          title="Total Salaries" 
          value={formatCurrency(yearlyStats.total_net_pay || 0)} 
          icon={IndianRupee} 
          color="emerald" 
          description="Net disbursed"
        />
        <DashboardStatCard 
          title="Total Bonuses" 
          value={formatCurrency(yearlyStats.total_bonuses || 0)} 
          icon={Zap} 
          color="blue" 
          description="Extra payments"
        />
        <DashboardStatCard 
          title="Needs Review" 
          value={yearlyStats.pending_count || 0} 
          icon={Clock} 
          color="amber" 
          description="Pending payrolls"
        />
        <DashboardStatCard 
          title="Total Staff" 
          value={staffMembers.length} 
          icon={Users} 
          color="purple" 
          description="Active employees"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payroll Ledger */}
        <div className="lg:col-span-2">
          <ERPCard 
            title="Salary Log" 
            description="Log of monthly salary disbursals" 
            color="blue" 
            icon={<ReceiptText className="h-5 w-5" />}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="relative flex-1 w-full max-w-xs">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search staff..." 
                    className="pl-11 h-11 rounded-xl border-slate-200 dark:border-slate-800 text-sm font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <button className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center">
                  <Filter className="h-4 w-4 mr-2" /> Filter
               </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="py-4 px-4">Staff Member</th>
                    <th className="py-4 px-4">Net Pay</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPayrolls.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 px-4 text-center py-20 text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    filteredPayrolls.map((payroll) => (
                      <tr key={payroll.id} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-100 dark:border-slate-800">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-blue-500/20 group-hover:rotate-3 transition-transform">
                              {payroll.staff?.full_name?.[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white tracking-tight text-sm group-hover:text-blue-600 transition-colors">
                                {payroll.staff?.full_name}
                              </p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{payroll.staff?.role?.replace('_', ' ')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-black text-slate-900 dark:text-white text-sm tracking-tighter">
                            {formatCurrency(payroll.net_pay)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                            payroll.status === "paid" 
                              ? "bg-emerald-50 text-emerald-600" 
                              : "bg-amber-50 text-amber-600"
                          )}>
                            {payroll.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          {payroll.status === "pending" ? (
                            <button 
                              onClick={() => handleProcessPayroll(payroll.id)}
                              disabled={processing === payroll.id}
                              className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all disabled:opacity-50"
                            >
                              {processing === payroll.id ? "..." : "Pay"}
                            </button>
                          ) : (
                            <button className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all gap-2 flex items-center">
                               <FileText className="h-4 w-4" /> Receipt
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </ERPCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Leave Requests */}
          <ERPCard 
            title="Leave" 
            description="Pending staff requests" 
            color="amber" 
            icon={<CalendarDays className="h-5 w-5" />}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
          >
            <div className="max-h-[450px] overflow-y-auto">
              <div className="p-5 space-y-4">
                {pendingLeaveRequests.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500/20 mb-4" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                      All caught up!<br />No pending requests.
                    </p>
                  </div>
                ) : (
                  pendingLeaveRequests.map((req) => (
                    <div key={req.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 group hover:border-blue-500/30 transition-all duration-300 shadow-sm hover:shadow-md">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 dark:text-slate-400 text-[10px]">
                             {req.staff?.full_name?.[0]}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-slate-900 dark:text-white block group-hover:text-blue-600 transition-colors">{req.staff?.full_name}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block">{req.staff?.role?.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100 bg-blue-50 text-blue-600">{req.leave_type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-slate-50">
                        <button 
                          onClick={() => handleLeaveAction(req.id, "approved")}
                          className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-600/10 transition-all"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleLeaveAction(req.id, "rejected")}
                          className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[9px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                        >
                          Deny
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </ERPCard>

          {/* Shortcuts */}
          <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                <ShieldCheck className="h-24 w-24 text-white" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-3">
                <Activity className="h-4 w-4 text-emerald-500" />
                Shortcuts
            </h3>
            <div className="space-y-3 relative z-10">
              <button className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-between px-6 rounded-2xl transition-all group/btn">
                <span>Generate Form-16</span>
                <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform opacity-30" />
              </button>
              <button className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-between px-6 rounded-2xl transition-all group/btn">
                <span>Export Tax Report</span>
                <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform opacity-30" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}