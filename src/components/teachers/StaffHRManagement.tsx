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

export function StaffHRManagement() {
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
                ALL CLEAR
              </Badge>
            </div>
            <div>
              <h3 className="text-xl font-black text-foreground">Staff Health</h3>
              <p className="text-sm font-bold text-foreground/50 tracking-tight">
                94% Attendance / 2 Pending Leaves
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
                08
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
                Payroll Disbursement
              </p>
              <h4 className="text-3xl font-black text-foreground tracking-tighter">
                28th Oct
              </h4>
              <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-tighter">
                Scheduled Cycle
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
                {[
                  {
                    name: "Dr. Aris",
                    type: "Sick Leave",
                    duration: "12 Oct - 14 Oct",
                    reason: "Medical Appointment",
                  },
                  {
                    name: "Prof. Sarah",
                    type: "Casual Leave",
                    duration: "16 Oct",
                    reason: "Personal Event",
                  },
                ].map((leave, i) => (
                  <tr key={i} className="hover:bg-primary/5 transition-colors group">
                    <td className="py-4 px-8 font-black text-foreground text-xs uppercase tracking-tight">
                      {leave.name}
                    </td>
                    <td className="py-4 px-8">
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] uppercase tracking-widest"
                      >
                        {leave.type.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-8 text-foreground/50 font-bold text-[10px] uppercase tracking-tighter">
                      {leave.duration}
                    </td>
                    <td className="py-4 px-8 text-foreground/40 font-bold text-[10px] uppercase tracking-tighter truncate max-w-[200px]">
                      {leave.reason}
                    </td>
                    <td className="py-4 px-8 text-right">
                      <div className="flex justify-end gap-x-2">
                        <button className="p-2 rounded-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all emerald-glow-sm">
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-xs bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            <p className="text-foreground/50 mt-4 max-w-sm font-bold uppercase tracking-widest text-[10px]">
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

