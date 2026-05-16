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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
}

export function PayrollDashboard({ 
  initialPayrolls, 
  pendingLeaveRequests, 
  yearlyStats,
  staffMembers 
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
    const result = await updateLeaveStatus(id, status, 'admin');
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
          <Button className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95 gap-2">
            <Plus className="h-4 w-4" /> Pay Salaries
          </Button>
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
            className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
               <div className="relative flex-1 w-full max-w-xs">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search staff..." 
                    className="pl-11 h-10 rounded-xl bg-white border-slate-200 text-xs font-bold shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">
                  <Filter className="h-4 w-4 mr-2" /> Filter
               </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-6 py-4">Staff Member</th>
                    <th className="px-6 py-4">Net Pay</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayrolls.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                        No records found
                      </td>
                    </tr>
                  ) : (
                    filteredPayrolls.map((payroll) => (
                      <tr key={payroll.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-blue-500/20 group-hover:rotate-3 transition-transform">
                              {payroll.staff?.full_name?.[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 tracking-tight text-sm group-hover:text-blue-600 transition-colors">
                                {payroll.staff?.full_name}
                              </p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{payroll.staff?.role?.replace('_', ' ')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-black text-slate-900 text-sm tracking-tighter">
                            {formatCurrency(payroll.net_pay)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border shadow-sm",
                            payroll.status === "paid" 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                              : "bg-amber-50 text-amber-600 border-amber-100"
                          )}>
                            {payroll.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          {payroll.status === "pending" ? (
                            <Button 
                              onClick={() => handleProcessPayroll(payroll.id)}
                              disabled={processing === payroll.id}
                              className="h-9 px-4 rounded-xl bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                            >
                              {processing === payroll.id ? "..." : "Pay"}
                            </Button>
                          ) : (
                            <Button variant="ghost" className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 gap-2">
                               <FileText className="h-4 w-4" /> Receipt
                            </Button>
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
            className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
          >
            <ScrollArea className="h-[450px]">
              <div className="p-4 space-y-4">
                {pendingLeaveRequests.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500/20 mb-4" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                      All caught up!<br />No pending requests.
                    </p>
                  </div>
                ) : (
                  pendingLeaveRequests.map((req) => (
                    <div key={req.id} className="p-5 rounded-2xl border border-slate-100 bg-white group hover:border-blue-500/30 transition-all duration-300 shadow-sm hover:shadow-md">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-[10px]">
                             {req.staff?.full_name?.[0]}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-slate-900 block group-hover:text-blue-600 transition-colors">{req.staff?.full_name}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block">{req.staff?.role?.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-blue-100 bg-blue-50 text-blue-600">{req.leave_type}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2 pt-4 border-t border-slate-50">
                        <Button 
                          onClick={() => handleLeaveAction(req.id, "approved")}
                          className="flex-1 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-600/10 transition-all"
                        >
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleLeaveAction(req.id, "rejected")}
                          variant="ghost" 
                          className="flex-1 h-9 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-black text-[9px] uppercase tracking-widest transition-all"
                        >
                          Deny
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </ERPCard>

          {/* Shortcuts */}
          <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                <ShieldCheck className="h-24 w-24 text-white" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-3">
                <Activity className="h-4 w-4 text-emerald-500" />
                Shortcuts
            </h3>
            <div className="space-y-3 relative z-10">
              <Button className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-between px-6 rounded-2xl transition-all group/btn">
                <span>Generate Form-16</span>
                <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform opacity-30" />
              </Button>
              <Button className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-between px-6 rounded-2xl transition-all group/btn">
                <span>Export Tax Ledger</span>
                <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform opacity-30" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
