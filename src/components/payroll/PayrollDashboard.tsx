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
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { processPayroll, updateLeaveStatus } from "@/app/actions/payroll";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
      toast.success("Payroll processed successfully");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to process payroll");
    }
  };

  const handleLeaveAction = async (id: string, status: 'approved' | 'rejected') => {
    const result = await updateLeaveStatus(id, status, 'admin'); // Should use real user ID
    if (result.success) {
      toast.success(`Leave request ${status}`);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update leave status");
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
    <div className="space-y-12 animate-in fade-in duration-1000 relative reveal-1">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6 relative z-10">
        <div>
          <div className="flex items-center gap-x-2 mb-4">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs font-semibold uppercase gap-1.5 px-3 py-1">
              <CreditCard className="h-3.5 w-3.5" />
              Active System
            </Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Staff Payroll
          </h2>
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mt-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            Manage compensation and resource alignment
          </p>
        </div>
        <div className="flex gap-x-4">
           <Button className="h-10 px-4 font-medium transition-all gap-2">
            <Plus className="h-4 w-4" />
            Generate Payroll
          </Button>
        </div>
      </div>

      {/* Stats Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 reveal-2">
        <div className="border border-border bg-card p-6 rounded-xl shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="h-24 w-24 -rotate-12 text-primary" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground mb-2">Total Payroll</p>
          <h3 className="text-3xl font-bold text-foreground">
            {formatCurrency(yearlyStats.total_net_pay || 0)}
          </h3>
          <div className="flex items-center gap-x-2 mt-4 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>+12.4% vs last month</span>
          </div>
        </div>

        <div className="border border-border bg-card p-6 rounded-xl shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CheckCircle2 className="h-24 w-24 text-primary" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground mb-2">Bonuses Paid</p>
          <h3 className="text-3xl font-bold text-foreground">
            {formatCurrency(yearlyStats.total_bonuses || 0)}
          </h3>
          <div className="flex items-center gap-x-2 mt-4 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" />
            <span>Processed</span>
          </div>
        </div>

        <div className="border border-border bg-card p-6 rounded-xl shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="h-24 w-24 text-amber-500" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground mb-2">Pending Approvals</p>
          <h3 className="text-3xl font-bold text-foreground">
            {yearlyStats.pending_count || 0}
          </h3>
          <div className="flex items-center gap-x-2 mt-4 text-xs font-semibold text-amber-500">
            <Clock className="h-3.5 w-3.5" />
            <span>Requires review</span>
          </div>
        </div>

        <div className="border border-border bg-card p-6 rounded-xl shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <UserCheck className="h-24 w-24 text-emerald-500" />
          </div>
          <p className="text-sm font-semibold text-muted-foreground mb-2">Staff Registered</p>
          <h3 className="text-3xl font-bold text-foreground">
            {staffMembers.length}
          </h3>
          <div className="flex items-center gap-x-2 mt-4 text-xs font-semibold text-emerald-600">
            <UserCheck className="h-3.5 w-3.5" />
            <span>Active records found</span>
          </div>
        </div>
      </div>


      {/* Main Grid: Management Controls */}
      {/* Main Grid: Management Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 reveal-3">
        {/* Payroll Table */}
        <div className="lg:col-span-2 border border-border bg-card/40 rounded-sm overflow-hidden flex flex-col">
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border bg-card/50">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Recent Payroll Runs</h3>
              <p className="text-sm font-medium text-muted-foreground mt-1">
                  Monthly disbursal records
              </p>
            </div>
            <div className="flex gap-x-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search staff..." 
                  className="pl-9 h-10 w-64 rounded-sm bg-background border-border text-sm focus:ring-1 focus:ring-primary/20 transition-all" 
                />
              </div>
              <Button variant="outline" className="h-10 px-4 font-medium transition-all gap-2">
                <Filter className="h-4 w-4" /> Filter
              </Button>
            </div>
          </div>
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="py-3 px-6 text-sm font-semibold text-muted-foreground">Staff Member</th>
                    <th className="py-3 px-6 text-sm font-semibold text-muted-foreground">Net Pay</th>
                    <th className="py-3 px-6 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="py-3 px-6 text-sm font-semibold text-muted-foreground text-right">Operation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPayrolls.map((payroll) => (
                    <tr key={payroll.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-x-4">
                          <div className="h-10 w-10 border border-primary/20 bg-primary/10 text-primary flex items-center justify-center font-bold rounded-full">
                            {payroll.staff?.full_name?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                              {payroll.staff?.full_name}
                            </p>
                            <p className="text-xs font-medium text-muted-foreground mt-0.5 capitalize">{payroll.staff?.role?.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-foreground text-sm">
                          {formatCurrency(payroll.net_pay)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant="outline" className={cn(
                          "rounded-full px-2.5 py-0.5 font-semibold text-xs capitalize",
                          payroll.status === "paid" 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                            : "bg-amber-50 text-amber-600 border-amber-200"
                        )}>
                          {payroll.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {payroll.status === "pending" ? (
                          <Button 
                            onClick={() => handleProcessPayroll(payroll.id)}
                            disabled={processing === payroll.id}
                            className="h-9 px-4 font-medium transition-all"
                          >
                            {processing === payroll.id ? "Processing..." : "Disburse"}
                          </Button>
                        ) : (
                          <Button variant="outline" className="h-9 px-4 font-medium transition-all gap-2 text-muted-foreground">
                             <FileText className="h-4 w-4" />
                             Receipt
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredPayrolls.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-24 text-center">
                        <AlertCircle className="h-10 w-10 text-muted-foreground opacity-20 mx-auto mb-4" />
                        <p className="text-sm font-medium text-muted-foreground">No matching records found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>


        {/* Sidebar: Requests & History */}
        <div className="space-y-6 reveal-4">
          {/* Pending Leave */}
          <div className="border border-border bg-card/40 rounded-sm overflow-hidden flex flex-col">
            <div className="p-6 pb-4 border-b border-border bg-card/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Leave Requests</h3>
                <p className="text-xs font-medium text-muted-foreground mt-1">Pending Approval</p>
              </div>
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none font-bold text-xs px-2.5 py-0.5 rounded-full shadow-sm transition-all">
                {pendingLeaveRequests.length}
              </Badge>
            </div>
            <ScrollArea className="h-[434px]">
              <div className="p-6 space-y-4">
                {pendingLeaveRequests.length === 0 ? (
                  <div className="py-24 text-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500/50 mx-auto mb-4" />
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                      All caught up!<br />No pending requests.
                    </p>
                  </div>
                ) : (
                  pendingLeaveRequests.map((req) => (
                    <div key={req.id} className="p-4 rounded-sm border border-border bg-background group hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-x-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                             {req.staff?.full_name?.[0]}
                          </div>
                          <div>
                            <span className="font-semibold text-sm text-foreground block group-hover:text-primary transition-colors">{req.staff?.full_name}</span>
                            <span className="text-xs font-medium text-muted-foreground capitalize block">{req.staff?.role?.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs font-semibold uppercase text-primary border-primary/20 bg-primary/5">{req.leave_type}</Badge>
                      </div>
                      <div className="flex items-center gap-x-2 text-xs font-medium text-muted-foreground mb-4">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-x-2">
                        <Button 
                          onClick={() => handleLeaveAction(req.id, "approved")}
                          className="flex-1 h-8 font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs"
                        >
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleLeaveAction(req.id, "rejected")}
                          variant="outline" 
                          className="flex-1 h-8 font-medium text-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-xs"
                        >
                          Deny
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Quick Actions */}
          <div className="border border-border bg-slate-900/40 text-white rounded-xl overflow-hidden relative group p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-6 border-l-2 border-primary pl-3">Shortcuts</h3>
            <div className="space-y-3">
              <Button className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold flex items-center justify-between px-6 transition-all group/btn text-sm">
                <span>Generate Form-16</span>
                <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform text-white/50" />
              </Button>
              <Button className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold flex items-center justify-between px-6 transition-all group/btn text-sm">
                <span>Export Tax Ledger</span>
                <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform text-white/50" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
