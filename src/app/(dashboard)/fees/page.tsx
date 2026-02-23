"use client";

import { useState } from "react";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FiscalEngine } from "@/lib/utils/fiscal";
import { cn } from "@/lib/utils";

const feeStatistics = [
  {
    title: "Total Revenue",
    value: "$124,500",
    change: "+14%",
    trend: "up",
    color: "blue",
  },
  {
    title: "Outstanding",
    value: "$12,400",
    change: "-2%",
    trend: "down",
    color: "purple",
  },
  {
    title: "Staff Payroll",
    value: "$45,200",
    change: "+5%",
    trend: "up",
    color: "indigo",
  },
];

export default function FinanceHub() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            Finance & Payroll
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">
            Enterprise Treasury and HR Finance Management
          </p>
        </div>
        <div className="flex gap-x-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white font-bold gap-x-2"
          >
            <Download className="h-4 w-4" />
            Statements
          </Button>
          <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
            <Plus className="h-4 w-4" />
            Process Payroll
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {feeStatistics.map((stat) => (
          <Card
            key={stat.title}
            className="border-none glass futuristic-card group"
          >
            <CardContent className="p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                {stat.title}
              </p>
              <div className="flex items-baseline justify-between">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                  {stat.value}
                </h3>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${stat.trend === "up" ? "text-green-500 bg-green-50" : "text-blue-500 bg-blue-50"} border-none`}
                >
                  {stat.change}
                </Badge>
              </div>
              <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-slate-900 neon-${stat.color}`}
                  style={{ width: "70%" }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="fees" className="space-y-6">
        <TabsList className="bg-white/40 backdrop-blur-md border border-white/20 p-1.5 rounded-2xl h-14">
          <TabsTrigger
            value="fees"
            className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all gap-x-2"
          >
            <DollarSign className="h-4 w-4" />
            Fee Management
          </TabsTrigger>
          <TabsTrigger
            value="payroll"
            className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all gap-x-2"
          >
            <Briefcase className="h-4 w-4" />
            Staff Payroll
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-xl px-8 py-3 data-[state=active]:bg-slate-900 data-[state=active]:text-white font-bold transition-all gap-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            Fiscal Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fees" className="space-y-6">
          <div className="flex gap-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search students for fee clearance..."
                className="pl-9 bg-white border-slate-100 rounded-2xl h-12 shadow-sm"
              />
            </div>
            <Button className="h-12 rounded-2xl px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold border-none transition-all">
              Filter
            </Button>
          </div>

          <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50">
                <tr className="border-b">
                  <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                    Student Identity
                  </th>
                  <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                    Structure
                  </th>
                  <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                    Total Due
                  </th>
                  <th className="text-left py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                    Status
                  </th>
                  <th className="text-right py-5 px-8 font-black uppercase tracking-widest text-[10px] text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  {
                    name: "Alexander Pierce",
                    type: "Annual Tuition",
                    amount: "$8,500",
                    status: "Paid",
                  },
                  {
                    name: "Sophia Martinez",
                    type: "Quarterly Batch",
                    amount: "$2,100",
                    status: "Partial",
                  },
                  {
                    name: "Liam O'Connor",
                    type: "Annual Tuition",
                    amount: "$8,500",
                    status: "Overdue",
                  },
                ].map((fee, i) => (
                  <tr
                    key={i}
                    className="hover:bg-white/60 transition-colors group"
                  >
                    <td className="py-6 px-8 flex items-center gap-x-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold neon-blue">
                        {fee.name[0]}
                      </div>
                      <span className="font-bold text-slate-900">
                        {fee.name}
                      </span>
                    </td>
                    <td className="py-6 px-8 text-slate-500 font-medium">
                      {fee.type}
                    </td>
                    <td className="py-6 px-8 font-black text-slate-900">
                      {fee.amount}
                    </td>
                    <td className="py-6 px-8">
                      <Badge
                        variant="outline"
                        className={
                          fee.status === "Paid"
                            ? "bg-green-50 text-green-600 border-green-100 font-bold"
                            : fee.status === "Partial"
                              ? "bg-blue-50 text-blue-600 border-blue-100 font-bold"
                              : "bg-red-50 text-red-600 border-red-100 font-bold"
                        }
                      >
                        {fee.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex justify-end gap-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl font-bold text-xs text-slate-400 hover:text-blue-500 hover:bg-blue-50"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          RESTRUCTURE
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none glass futuristic-card bg-slate-900 text-white p-6">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest opacity-60">
                  Installment Sandbox
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Principal Amount
                    </label>
                    <Input
                      defaultValue="8500"
                      className="bg-white/5 border-white/10 text-white font-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Installment Count
                    </label>
                    <Input
                      defaultValue="4"
                      className="bg-white/5 border-white/10 text-white font-black"
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-4">
                    Calculated Schedule (5% Institutional Interest)
                  </p>
                  <div className="space-y-3">
                    {FiscalEngine.calculateInstallments({
                      total: 8500,
                      count: 4,
                      interestRate: 0.05,
                    }).map((inst) => (
                      <div
                        key={inst.index}
                        className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5"
                      >
                        <span className="text-xs font-bold opacity-60">
                          Installment #{inst.index}
                        </span>
                        <span className="font-black text-blue-400">
                          ${inst.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none glass futuristic-card p-6 border-blue-100">
              <CardHeader>
                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">
                  Yield Projections
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-black text-slate-900">
                  +$12.4k Surplus
                </h4>
                <p className="text-xs text-slate-500 font-medium max-w-[200px] mt-2">
                  Neural projection suggests a 12% increase in fee clearance
                  rate with dynamic installments.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payroll">
          <Card className="border-none glass futuristic-card p-12 flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-2xl neon-blue mb-6">
              <Users className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Staff Payroll Engine
            </h3>
            <p className="text-slate-500 max-w-sm mt-3 font-medium">
              The payroll hub is synchronized with attendance telemetry. Unpaid
              leaves are automatically deducted from the monthly disbursement
              cycle.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-md">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase">
                  Computed Disbursement
                </p>
                <h4 className="text-lg font-black text-slate-900">
                  $
                  {
                    FiscalEngine.computeDisbursement({
                      baseSalary: 4500,
                      unpaidLeaveDays: 2,
                      totalWorkingDays: 22,
                      performanceBonus: 200,
                    }).netPay
                  }
                </h4>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase">
                  Automatic Deductions
                </p>
                <h4 className="text-lg font-black text-red-500">
                  -$
                  {
                    FiscalEngine.computeDisbursement({
                      baseSalary: 4500,
                      unpaidLeaveDays: 2,
                      totalWorkingDays: 22,
                      performanceBonus: 200,
                    }).deductions
                  }
                </h4>
              </div>
            </div>
            <Button className="mt-8 rounded-2xl bg-slate-900 px-10 py-6 font-bold shadow-xl">
              Execute Monthly Payouts
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
