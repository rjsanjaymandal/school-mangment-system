"use client";

import { useState } from "react";
import {
  Users,
  Calendar,
  Briefcase,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Filter,
  Search,
  DollarSign,
  Shovel,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface LeaveRequest {
  id: string;
  staff_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  staff?: {
    full_name: string;
  };
}

interface StaffPayroll {
  id: string;
  staff_id: string;
  base_salary: number;
  bonuses: number;
  deductions: number;
  net_pay: number;
  month: number;
  year: number;
  status: string;
}

export function StaffHRManagement({ 
  leaveRequests = [], 
  payrolls = [],
  staffCount = 0,
  userRole
}: { 
  leaveRequests?: LeaveRequest[];
  payrolls?: StaffPayroll[];
  staffCount?: number;
  userRole?: string | null;
}) {
  const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
  const totalPayout = payrolls.reduce((acc, curr) => acc + (curr.net_pay || 0), 0);
  const paidCount = payrolls.filter(p => p.status === 'paid').length;

  if (!isAdminOrTeacher) {
    return (
      <div className="p-32 text-center space-y-8 animate-in fade-in duration-1000">
        <div className="h-32 w-32 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500 shadow-sm transition-all hover:scale-105">
          <XCircle className="h-16 w-16" />
        </div>
        <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-foreground decoration-red-500/30 underline-offset-8">Access Denied</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-6 max-w-sm mx-auto leading-loose italic">
                Personnel & Payroll data are restricted to administrative accounts.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in transition-all duration-1000">
      <div className="grid gap-12 lg:grid-cols-3">
        {/* Metric Card 1 */}
        <div className="relative group bg-card border border-border p-10 rounded-xl transition-all duration-700 shadow-sm hover:border-primary/40 overflow-hidden">
            <div className="absolute -right-4 -bottom-4 h-32 w-32 text-primary opacity-[0.03] rotate-12 group-hover:rotate-0 transition-all duration-1000">
                <Briefcase className="h-full w-full" />
            </div>
            
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-8 transition-all italic">
                Staff Population
            </p>
            <div className="flex items-baseline gap-x-6 mb-10 relative z-10">
                <h3 className="text-8xl font-black tracking-tighter text-foreground italic leading-none group-hover:text-primary transition-colors">
                    {staffCount.toString().padStart(2, '0')}
                </h3>
                <div className={cn(
                    "px-4 py-2 text-primary-foreground text-sm font-bold italic rounded-lg shadow-sm",
                    pendingLeaves.length === 0 ? "bg-primary" : "bg-orange-500"
                )}>
                    {pendingLeaves.length === 0 ? "STABLE" : "ATTENTION"}
                </div>
            </div>
            <div className="space-y-3 relative z-10">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground italic">
                    <span>Pending Leave Requests</span>
                    <span className="text-primary italic">{pendingLeaves.length} Pending</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary transition-all duration-1000"
                        style={{ width: `${Math.max(10, (1 - pendingLeaves.length / (staffCount || 1)) * 100)}%` }}
                    />
                </div>
            </div>
        </div>

        {/* Metric Card 2 */}
        <div className="relative group bg-card border border-border p-10 rounded-xl transition-all duration-700 shadow-sm hover:border-primary/40 overflow-hidden">
            <div className="absolute -right-4 -bottom-4 h-32 w-32 text-primary opacity-[0.03] rotate-12 group-hover:rotate-0 transition-all duration-1000">
                <Calendar className="h-full w-full" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-8 italic">
                Attendance Trends
            </p>
            <div className="flex items-center gap-x-8 mb-10 relative z-10">
                <div className="h-20 w-20 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm transition-all group-hover:scale-110">
                    <Clock className="h-10 w-10 text-primary" />
                </div>
                <div>
                    <h4 className="text-5xl font-black text-foreground tracking-tighter italic leading-none">
                        {pendingLeaves.length.toString().padStart(2, '0')}
                    </h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 leading-none italic">Open Requests</p>
                </div>
            </div>
            <div className="pt-8 border-t border-border">
                <Button className="w-full bg-secondary border border-border hover:bg-primary hover:text-white text-foreground font-bold rounded-lg h-14 transition-all uppercase tracking-widest text-[9px]">
                    Initialize Review
                </Button>
            </div>
        </div>

        {/* Metric Card 3 */}
        <div className="relative group bg-card border border-border p-10 rounded-xl transition-all duration-700 shadow-sm hover:border-primary/40 overflow-hidden">
            <div className="absolute -right-4 -bottom-4 h-32 w-32 text-primary opacity-[0.03] rotate-12 group-hover:rotate-0 transition-all duration-1000">
                <DollarSign className="h-full w-full" />
            </div>
            
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-8 italic">
                Financial Overview
            </p>

            <div className="flex items-center gap-x-8 mb-10 relative z-10">
                <div className="h-20 w-20 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm transition-all group-hover:scale-110">
                    <DollarSign className="h-10 w-10 text-primary" />
                </div>
                <div>
                    <h4 className="text-5xl font-black text-foreground tracking-tighter italic leading-none">
                        {paidCount}<span className="text-primary/30 not-italic tracking-normal">/</span>{payrolls.length || staffCount}
                    </h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 leading-none italic">Payroll Status</p>
                </div>
            </div>

            <div className="pt-8 border-t border-border">
                <Button className="w-full bg-primary text-primary-foreground font-bold rounded-lg h-14 shadow-sm uppercase tracking-widest text-[9px] hover:scale-[1.02] transition-all">
                    Process Payouts
                </Button>
            </div>
        </div>
      </div>

      <Tabs defaultValue="leave" className="space-y-10">
        <TabsList className="bg-secondary/50 border border-border p-1 rounded-xl h-14 w-fit">
          <TabsTrigger
            value="leave"
            className="rounded-lg px-10 py-3 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm font-bold uppercase tracking-widest text-[10px] transition-all gap-x-3 italic"
          >
            <Clock className="h-4 w-4" />
            Leave Registry
          </TabsTrigger>
          <TabsTrigger
            value="payouts"
            className="rounded-lg px-10 py-3 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm font-bold uppercase tracking-widest text-[10px] transition-all gap-x-3 italic"
          >
            <DollarSign className="h-4 w-4" />
            Payroll System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leave" className="animate-in slide-in-from-bottom-4 duration-700 outline-none">
          <div className="relative bg-card rounded-xl overflow-hidden border border-border shadow-sm">
            <div className="overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-secondary/30">
                        <tr>
                            <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-primary italic">Employee Name</th>
                            <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-primary italic">Leave Category</th>
                            <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-primary italic">Duration Scope</th>
                            <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-primary italic">Reason/Context</th>
                            <th className="px-10 py-6 text-right text-[10px] font-bold uppercase tracking-widest text-primary italic">Status / Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {leaveRequests.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-24 text-center text-[10px] font-black uppercase tracking-[0.5em] text-foreground/20 italic">No permission fragments detected in memory.</td>
                            </tr>
                        ) : (
                            leaveRequests.map((leave) => (
                                <tr key={leave.id} className="group hover:bg-secondary/10 transition-all duration-500">
                                    <td className="px-10 py-6 font-bold text-foreground uppercase tracking-tight text-[13px] italic group-hover:text-primary transition-colors">
                                        {leave.staff?.full_name || "Unknown Staff"}
                                    </td>
                                    <td className="px-10 py-6">
                                        <Badge variant="outline" className="text-[8px] font-bold tracking-widest uppercase border-primary/20 text-primary bg-primary/5 rounded-lg px-3 py-1 italic">
                                            {leave.leave_type}
                                        </Badge>
                                    </td>
                                    <td className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground italic">
                                        {new Date(leave.start_date).toLocaleDateString()} <span className="text-primary/30 mx-2">→</span> {new Date(leave.end_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-10 py-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 truncate max-w-[200px] italic">
                                        {leave.reason}
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        {leave.status === 'pending' ? (
                                            <div className="flex justify-end gap-x-3">
                                                <Button size="icon" className="h-9 w-9 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white shadow-sm transition-all">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" className="h-9 w-9 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-sm transition-all">
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className={cn(
                                                "inline-flex items-center gap-x-2 px-4 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest shadow-sm italic",
                                                leave.status === 'approved' ? "bg-primary/10 text-primary border border-primary/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                                            )}>
                                                <span>{leave.status}</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payouts" className="animate-in slide-in-from-bottom-4 duration-700 outline-none">
          <div className="relative group bg-card border border-border p-16 overflow-hidden shadow-2xl border-l-4 border-l-primary rounded-xl">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
              <DollarSign className="h-64 w-64 text-primary" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-10">
                <div className="h-24 w-24 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_50px_oklch(var(--primary)/0.3)]">
                    <Shovel className="h-10 w-10" />
                </div>
                
                <div>
                    <h3 className="text-5xl font-black text-foreground uppercase tracking-tight italic leading-none">
                        Employee Payroll
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-6 italic">Fiscal Management & Disbursement</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-2xl py-12 border-y border-border">
                    <div className="text-center space-y-4">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">Monthly Total Payout</p>
                        <p className="text-5xl font-black italic text-foreground tracking-tighter leading-none decoration-primary/30 underline underline-offset-8 transition-all hover:text-primary decoration-2">₹{totalPayout.toLocaleString()}</p>
                    </div>
                    <div className="text-center space-y-4 border-l border-border">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">Active Employee Records</p>
                        <p className="text-5xl font-black italic text-foreground tracking-tighter leading-none">{payrolls.length || staffCount}</p>
                    </div>
                </div>

                <div className="max-w-xl">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-loose italic">
                        Automated payroll processing enabled. Compensation is calculated based on attendance records, holiday policies, and institutional tax schemas.
                    </p>
                </div>

                <Button className="h-16 px-16 bg-primary text-primary-foreground font-black shadow-sm uppercase tracking-widest text-[11px] transition-all hover:scale-105 active:scale-95 rounded-xl">
                    <span className="flex items-center gap-x-4">
                        Process All Payments
                        <TrendingUp className="h-5 w-5" />
                    </span>
                </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


