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
        <Card className="border-none glass futuristic-card bg-slate-900 text-white">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>
              <Badge className="bg-green-500 text-white border-none font-black text-[10px]">
                ALL CLEAR
              </Badge>
            </div>
            <div>
              <h3 className="text-xl font-black">Staff Health</h3>
              <p className="text-xs text-slate-400">
                94% Attendance / 2 Pending Leaves
              </p>
            </div>
            <Button className="w-full bg-white text-slate-900 font-bold rounded-xl h-12 shadow-xl hover:bg-white/90">
              Generate HR Report
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none glass futuristic-card">
          <CardContent className="p-6 flex items-center gap-x-6">
            <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center neon-blue">
              <Calendar className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Pending Requests
              </p>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                08
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Leave & Permissions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none glass futuristic-card">
          <CardContent className="p-6 flex items-center gap-x-6">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Payroll Disbursement
              </p>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                28th Oct
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                Scheduled Cycle
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="leave" className="space-y-6">
        <TabsList className="bg-white/40 backdrop-blur-md border border-white/20 p-1.5 rounded-2xl h-14">
          <TabsTrigger
            value="leave"
            className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all gap-x-2"
          >
            <Clock className="h-4 w-4" />
            Leave Management
          </TabsTrigger>
          <TabsTrigger
            value="payouts"
            className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all gap-x-2"
          >
            <DollarSign className="h-4 w-4" />
            Payroll Processing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leave">
          <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50">
                <tr className="border-b">
                  <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                    Staff Member
                  </th>
                  <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                    Type
                  </th>
                  <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                    Duration
                  </th>
                  <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                    Reason
                  </th>
                  <th className="text-right py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
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
                  <tr key={i} className="hover:bg-white/60 transition-colors">
                    <td className="py-6 px-8 font-bold text-slate-900">
                      {leave.name}
                    </td>
                    <td className="py-6 px-8">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-600 border-blue-100 font-bold"
                      >
                        {leave.type.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-6 px-8 text-slate-400 font-mono text-xs font-bold">
                      {leave.duration}
                    </td>
                    <td className="py-6 px-8 text-slate-500 font-medium truncate max-w-[200px]">
                      {leave.reason}
                    </td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex justify-end gap-x-2">
                        <button className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all">
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all">
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
          <Card className="border-none glass futuristic-card p-12 text-center flex flex-col items-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center neon-blue mb-6">
              <DollarSign className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              Faculty Payroll Engine
            </h3>
            <p className="text-slate-500 mt-2 max-w-sm font-medium">
              Automated salary computation based on attendance telemetry and
              holiday deductions.
            </p>
            <Button className="mt-8 rounded-2xl bg-slate-900 px-10 py-6 font-bold shadow-2xl">
              Execute Monthly Payouts
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
