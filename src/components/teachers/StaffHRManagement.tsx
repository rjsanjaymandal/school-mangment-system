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
        <div className="h-32 w-32 rounded-sm bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500 shadow-[0_0_50px_oklch(var(--red-500)/0.2)] skew-x-[-12deg]">
          <XCircle className="h-16 w-16 not-skew-x" />
        </div>
        <div>
            <h2 className="text-4xl font-black italic uppercase italic underline decoration-red-500/30 underline-offset-8">Terminal Blocked</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30 mt-6 max-w-sm mx-auto leading-loose">
                Faculty Logistics & Financial Telemetry are restricted to administrative nodes only.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in transition-all duration-1000">
      <div className="grid gap-12 lg:grid-cols-3">
        {/* Metric Node 1 */}
        <div className="relative group glass-card p-10 transition-all duration-700 hover:emerald-border-glow overflow-hidden">
            <div className="absolute -right-6 -bottom-6 h-48 w-48 text-primary opacity-[0.03] rotate-12 group-hover:rotate-0 transition-all duration-1000">
                <Briefcase className="h-full w-full" />
            </div>
            
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-8 group-hover:tracking-[0.6em] transition-all">
                Staff Vitality Index
            </p>

            <div className="flex items-baseline gap-x-6 mb-10 relative z-10">
                <h3 className="text-8xl font-black tracking-tighter text-foreground italic leading-none group-hover:text-primary transition-colors">
                    {staffCount.toString().padStart(2, '0')}
                </h3>
                <div className={cn(
                    "px-4 py-2 text-primary-foreground text-sm font-black italic rounded-sm shadow-2xl skew-x-[-12deg]",
                    pendingLeaves.length === 0 ? "bg-emerald-500 emerald-border-glow" : "bg-orange-500 shadow-[0_0_30px_oklch(var(--orange-500)/0.4)]"
                )}>
                    {pendingLeaves.length === 0 ? "OPTIMAL" : "WARNING"}
                </div>
            </div>

            <div className="space-y-3 relative z-10">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40 italic">
                    <span>Pending Leave Requests</span>
                    <span className="text-primary">{pendingLeaves.length} Critical Interrupts</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-primary shadow-[0_0_20px_oklch(var(--primary))] transition-all duration-1000"
                        style={{ width: `${Math.max(10, (1 - pendingLeaves.length / (staffCount || 1)) * 100)}%` }}
                    />
                </div>
            </div>
        </div>

        {/* Metric Node 2 */}
        <div className="relative group glass-card p-10 transition-all duration-700 hover:emerald-border-glow overflow-hidden">
            <div className="absolute -right-6 -bottom-6 h-48 w-48 text-primary opacity-[0.03] rotate-12 group-hover:rotate-0 transition-all duration-1000">
                <Calendar className="h-full w-full" />
            </div>
            
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-8 group-hover:tracking-[0.6em] transition-all">
                Temporal Availability
            </p>

            <div className="flex items-center gap-x-8 mb-10 relative z-10">
                <div className="h-20 w-20 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center shadow-xl group-hover:emerald-border-glow transition-all skew-x-[-8deg]">
                    <Clock className="h-10 w-10 text-primary not-skew-x animate-pulse" />
                </div>
                <div>
                    <h4 className="text-5xl font-black text-foreground tracking-tighter italic leading-none">
                        {pendingLeaves.length.toString().padStart(2, '0')}
                    </h4>
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mt-2 leading-none">Global Permission Requests</p>
                </div>
            </div>

            <div className="pt-8 border-t border-white/5">
                <Button className="w-full bg-white/5 border border-white/10 hover:border-primary/40 text-foreground font-black rounded-sm h-14 transition-all uppercase tracking-[0.3em] text-[9px] skew-x-[-12deg]">
                    <span className="not-skew-x">Initialize Review Cycle</span>
                </Button>
            </div>
        </div>

        {/* Metric Node 3 */}
        <div className="relative group glass-card p-10 transition-all duration-700 hove:emerald-border-glow overflow-hidden">
            <div className="absolute -right-6 -bottom-6 h-48 w-48 text-primary opacity-[0.03] rotate-12 group-hover:rotate-0 transition-all duration-1000">
                <DollarSign className="h-full w-full" />
            </div>
            
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-8 group-hover:tracking-[0.6em] transition-all">
                Financial Telemetry
            </p>

            <div className="flex items-center gap-x-8 mb-10 relative z-10">
                <div className="h-20 w-20 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center shadow-xl group-hover:emerald-border-glow transition-all skew-x-[-8deg]">
                    <DollarSign className="h-10 w-10 text-primary not-skew-x" />
                </div>
                <div>
                    <h4 className="text-5xl font-black text-foreground tracking-tighter italic leading-none">
                        {paidCount}<span className="text-primary/30 not-italic tracking-normal">/</span>{payrolls.length || staffCount}
                    </h4>
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest mt-2 leading-none">Liquidity Status: Cycle Zeta</p>
                </div>
            </div>

            <div className="pt-8 border-t border-white/5">
                <Button className="w-full bg-primary text-primary-foreground font-black rounded-sm h-14 emerald-border-glow uppercase tracking-[0.3em] text-[9px] skew-x-[-12deg]">
                    <span className="not-skew-x">Execute Payout Logic</span>
                </Button>
            </div>
        </div>
      </div>

      <Tabs defaultValue="leave" className="space-y-10">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-sm h-14 w-fit">
          <TabsTrigger
            value="leave"
            className="rounded-xs px-10 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-3 emerald-border-glow shadow-2xl skew-x-[-12deg] data-[state=inactive]:hover:bg-white/5"
          >
            <Clock className="h-4 w-4 not-skew-x" />
            Leave Registry
          </TabsTrigger>
          <TabsTrigger
            value="payouts"
            className="rounded-xs px-10 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-3 emerald-border-glow shadow-2xl skew-x-[-12deg] data-[state=inactive]:hover:bg-white/5"
          >
            <DollarSign className="h-4 w-4 not-skew-x" />
            Payroll System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leave" className="animate-in slide-in-from-bottom-4 duration-700 outline-none">
          <div className="relative glass-panel p-2 rounded-sm overflow-hidden border border-white/10">
            <div className="bg-background/40 backdrop-blur-3xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5">
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Faculty Member</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Classification</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Temporal Scope</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Context</th>
                            <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Validation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {leaveRequests.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-24 text-center text-[10px] font-black uppercase tracking-[0.5em] text-foreground/20 italic">No permission fragments detected in memory.</td>
                            </tr>
                        ) : (
                            leaveRequests.map((leave) => (
                                <tr key={leave.id} className="group hover:bg-white/5 transition-all duration-500">
                                    <td className="px-10 py-6 font-black text-foreground uppercase tracking-tight text-[13px] italic group-hover:text-primary transition-colors">
                                        {leave.staff?.full_name || "Unknown Faculty"}
                                    </td>
                                    <td className="px-10 py-6">
                                        <Badge variant="outline" className="text-[8px] font-black tracking-widest uppercase border-primary/20 text-primary bg-primary/5 rounded-none px-3 py-1">
                                            {leave.leave_type}
                                        </Badge>
                                    </td>
                                    <td className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-foreground/40 italic">
                                        {new Date(leave.start_date).toLocaleDateString()} <span className="text-primary/30 mx-2">→</span> {new Date(leave.end_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-foreground/30 truncate max-w-[200px]">
                                        {leave.reason}
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        {leave.status === 'pending' ? (
                                            <div className="flex justify-end gap-x-3">
                                                <Button size="icon" className="h-10 w-10 rounded-sm bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground shadow-xl transition-all skew-x-[-8deg]">
                                                    <CheckCircle2 className="h-4 w-4 not-skew-x" />
                                                </Button>
                                                <Button size="icon" className="h-10 w-10 rounded-sm bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-xl transition-all skew-x-[-8deg]">
                                                    <XCircle className="h-4 w-4 not-skew-x" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className={cn(
                                                "inline-flex items-center gap-x-2 px-4 py-1.5 rounded-sm text-[8px] font-black uppercase tracking-[0.2em] shadow-2xl skew-x-[-12deg]",
                                                leave.status === 'approved' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
                                            )}>
                                                <span className="not-skew-x">{leave.status}</span>
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
          <div className="relative group glass-card p-16 overflow-hidden emerald-border-glow shadow-2xl border-l-4 border-l-primary">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
              <DollarSign className="h-64 w-64 text-primary" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-10">
                <div className="h-24 w-24 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_50px_oklch(var(--primary)/0.3)] skew-x-[-12deg]">
                    <Shovel className="h-10 w-10 not-skew-x" />
                </div>
                
                <div>
                    <h3 className="text-5xl font-black text-foreground uppercase tracking-tight italic leading-none">
                        Faculty Payroll
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mt-6">Protocol: Liquidation Cycle Gamma</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-2xl py-12 border-y border-white/5">
                    <div className="text-center space-y-4">
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">Total Institutional Outflow</p>
                        <p className="text-5xl font-black italic text-foreground tracking-tighter leading-none decoration-primary/30 underline underline-offset-8 transition-all hover:text-primary">₹{totalPayout.toLocaleString()}</p>
                    </div>
                    <div className="text-center space-y-4 border-l border-white/5">
                        <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em]">Active Faculty Nodes</p>
                        <p className="text-5xl font-black italic text-foreground tracking-tighter leading-none">{payrolls.length || staffCount}</p>
                    </div>
                </div>

                <div className="max-w-xl">
                    <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] leading-loose italic">
                        Automated liquidity disbursement protocol initialized. Net pay calculated based on global attendance telemetry, holiday patterns, and institutional deduction schemas.
                    </p>
                </div>

                <Button className="h-20 px-20 bg-primary text-primary-foreground font-black shadow-[0_0_60px_oklch(var(--primary)/0.4)] emerald-border-glow uppercase tracking-[0.4em] text-[11px] skew-x-[-12deg] transition-all hover:scale-105 active:scale-95">
                    <span className="not-skew-x flex items-center gap-x-4">
                        Execute Master Payout Cycle
                        <TrendingUp className="h-5 w-5 animate-pulse" />
                    </span>
                </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


