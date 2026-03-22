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
  staffCount = 0
}: { 
  leaveRequests?: LeaveRequest[];
  payrolls?: StaffPayroll[];
  staffCount?: number;
}) {
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
  const totalPayout = payrolls.reduce((acc, curr) => acc + (curr.net_pay || 0), 0);
  const paidCount = payrolls.filter(p => p.status === 'paid').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl transition-all hover:bg-primary/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-10 w-10 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shadow-lg emerald-glow">
                <Briefcase className="h-5 w-5" />
              </div>
              <Badge className="bg-primary text-primary-foreground border-none font-black text-[10px] emerald-glow">
                {pendingLeaves.length === 0 ? "ALL CLEAR" : "ACTION REQUIRED"}
              </Badge>
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground">Staff Health</h3>
              <p className="text-sm font-bold text-foreground/50 tracking-tight">
                {staffCount} Active Faculty / {pendingLeaves.length} Pending Leaves
              </p>
            </div>
            <Button className="w-full bg-primary text-primary-foreground font-black rounded-sm h-12 shadow-xl emerald-glow uppercase tracking-widest text-[10px]">
              Generate HR Report
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl transition-all hover:bg-primary/5">
          <CardContent className="p-6 flex items-center gap-x-6">
            <div className="h-14 w-14 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shadow-lg emerald-glow">
              <Calendar className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                Pending Requests
              </p>
              <h4 className="text-3xl font-black text-foreground tracking-tighter">
                {pendingLeaves.length.toString().padStart(2, '0')}
              </h4>
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-tighter">
                Leave & Permissions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl transition-all hover:bg-primary/5">
          <CardContent className="p-6 flex items-center gap-x-6">
            <div className="h-14 w-14 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shadow-lg emerald-glow">
              <DollarSign className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                Payroll Liquidated
              </p>
              <h4 className="text-3xl font-black text-foreground tracking-tighter">
                {paidCount}/{payrolls.length || 0}
              </h4>
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-tighter">
                Monthly Cycle
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leave" className="space-y-6">
        <TabsList className="bg-card/40 backdrop-blur-xl border border-border p-1 rounded-sm h-12">
          <TabsTrigger
            value="leave"
            className="rounded-xs px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-2 emerald-glow-sm"
          >
            <Clock className="h-3 w-3" />
            Leave Management
          </TabsTrigger>
          <TabsTrigger
            value="payouts"
            className="rounded-xs px-8 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all gap-x-2 emerald-glow-sm"
          >
            <DollarSign className="h-3 w-3" />
            Payroll Processing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leave">
          <div className="bg-card/40 backdrop-blur-xl rounded-sm border border-border overflow-hidden shadow-2xl">
            <table className="w-full text-sm">
              <thead className="bg-primary/5">
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-8 font-black uppercase tracking-widest text-[10px] text-primary">
                    Staff Member
                  </th>
                  <th className="text-left py-4 px-8 font-black uppercase tracking-widest text-[10px] text-primary">
                    Type
                  </th>
                  <th className="text-left py-4 px-8 font-black uppercase tracking-widest text-[10px] text-primary">
                    Duration
                  </th>
                  <th className="text-left py-4 px-8 font-black uppercase tracking-widest text-[10px] text-primary">
                    Reason
                  </th>
                  <th className="text-right py-4 px-8 font-black uppercase tracking-widest text-[10px] text-primary">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-foreground/30 font-bold uppercase tracking-widest text-xs">
                      No active leave requests detected.
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((leave) => (
                    <tr key={leave.id} className="hover:bg-primary/5 transition-colors group">
                      <td className="py-4 px-8 font-black text-foreground text-xs uppercase tracking-tight">
                        {leave.staff?.full_name || "Unknown Staff"}
                      </td>
                      <td className="py-4 px-8">
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest"
                        >
                          {leave.leave_type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-4 px-8 text-foreground/50 font-bold text-[10px] uppercase tracking-tighter">
                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-8 text-foreground/40 font-bold text-[10px] uppercase tracking-tighter truncate max-w-[200px]">
                        {leave.reason}
                      </td>
                      <td className="py-4 px-8 text-right">
                        {leave.status === 'pending' ? (
                          <div className="flex justify-end gap-x-2">
                            <button className="p-2 rounded-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all emerald-glow-sm">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button className="p-2 rounded-xs bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <Badge className={cn(
                            "font-black text-[8px] uppercase tracking-widest",
                            leave.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {leave.status}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="payouts">
          <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-12 text-center flex flex-col items-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="h-16 w-16 rounded-sm bg-primary text-primary-foreground flex items-center justify-center shadow-lg emerald-glow mb-6">
              <DollarSign className="h-8 w-8" />
            </div>
            <h3 className="text-3xl font-black text-foreground uppercase tracking-tight">
              Faculty Payroll Engine
            </h3>
            <div className="grid grid-cols-2 gap-8 mt-6 w-full max-w-md">
              <div className="text-left space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Total Payout</p>
                <p className="text-2xl font-black text-foreground">₹{totalPayout.toLocaleString()}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Staff Count</p>
                <p className="text-2xl font-black text-foreground">{payrolls.length}</p>
              </div>
            </div>
            <p className="text-foreground/50 mt-8 max-w-sm font-bold uppercase tracking-widest text-[10px]">
              Automated salary computation based on attendance telemetry and
              holiday deductions.
            </p>
            <Button className="mt-10 rounded-sm bg-primary text-primary-foreground px-12 py-7 font-black shadow-2xl emerald-glow uppercase tracking-[0.2em] text-xs">
              Execute Monthly Payouts
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


