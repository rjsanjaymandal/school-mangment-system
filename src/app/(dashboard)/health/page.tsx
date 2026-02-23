"use client";

import { useState } from "react";
import {
  Stethoscope,
  Activity,
  AlertCircle,
  Heart,
  Thermometer,
  Pill,
  Clock,
  Plus,
  Search,
  ChevronRight,
  ClipboardPlus,
  History,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const mockAlerts = [
  {
    id: "1",
    student: "Alexander Pierce",
    grade: "10-A",
    alert: "Severe Peanuts Allergy",
    type: "Critical",
  },
  {
    id: "2",
    student: "Sophia Martinez",
    grade: "10-B",
    alert: "Type 1 Diabetes",
    type: "Chronic",
  },
];

const recentVisits = [
  {
    id: "101",
    student: "Liam O'Connor",
    reason: "Seasonal Allergy",
    treatment: "Antihistamine administered",
    status: "Discharged",
    time: "10 mins ago",
  },
  {
    id: "102",
    student: "Emma Wilson",
    reason: "Sports Injury (Ankle)",
    treatment: "Ice pack applied, under observation",
    status: "Under Observation",
    time: "45 mins ago",
  },
  {
    id: "103",
    student: "Noah Brown",
    reason: "Persistent Headache",
    treatment: "Rest, pending parental contact",
    status: "Under Observation",
    time: "1 hour ago",
  },
];

export default function HealthVault() {
  const [activeAlert, setActiveAlert] = useState(mockAlerts[0]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <div className="h-14 w-14 rounded-2xl bg-red-500 border border-white/10 flex items-center justify-center text-white shadow-lg shadow-red-200">
            <Stethoscope className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              Health Vault
            </h2>
            <p className="text-slate-500 font-medium tracking-tight">
              Institutional Wellness Monitoring & Infirmary Intelligence
            </p>
          </div>
        </div>
        <div className="flex gap-x-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white font-bold gap-x-2"
          >
            <History className="h-4 w-4" />
            Vitals History
          </Button>
          <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
            <Plus className="h-4 w-4" />
            Record Visit
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Health Statistics */}
        <Card className="border-none glass futuristic-card p-6 bg-slate-900 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Activity className="h-24 w-24 text-blue-400" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Total Visits Today
          </p>
          <h3 className="text-3xl font-black mt-2 text-white">14</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-blue-300">
            Avg. Recovery Time: 15m
          </div>
        </Card>

        <Card className="border-none glass futuristic-card p-6 border-red-100 bg-red-50/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
            Critical Alerts
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900">02</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-red-400 animate-pulse">
            <AlertCircle className="h-4 w-4" />
            Active Observations
          </div>
        </Card>

        <Card className="border-none glass futuristic-card p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Vaccination Rate
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900">98.2%</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-green-500">
            Institutional Compliance
          </div>
        </Card>

        <Card className="border-none glass futuristic-card p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Medical Inventory
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900">Optimal</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-slate-400">
            Stock Inspected Today
          </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Infirmary Stream */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-x-2">
              <Clock className="h-4 w-4" />
              Real-time Intake Feed
            </h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search medical logs..."
                className="pl-9 rounded-xl h-10 text-xs"
              />
            </div>
          </div>

          <Card className="border-none glass futuristic-card overflow-hidden">
            <ScrollArea className="h-[450px]">
              <div className="divide-y divide-slate-100">
                {recentVisits.map((visit) => (
                  <div
                    key={visit.id}
                    className="p-6 flex items-start gap-x-4 hover:bg-slate-50 transition-all group"
                  >
                    <div
                      className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110",
                        visit.status === "Discharged"
                          ? "bg-green-50 text-green-600"
                          : "bg-yellow-50 text-yellow-600",
                      )}
                    >
                      <ClipboardPlus className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-slate-900 text-base">
                          {visit.student}
                        </h4>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {visit.time}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 font-bold leading-tight line-clamp-1">
                        {visit.reason}
                      </p>
                      <p className="text-xs text-slate-500 italic">
                        {visit.treatment}
                      </p>
                      <div className="flex items-center gap-x-2 pt-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-black border-none",
                            visit.status === "Discharged"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700",
                          )}
                        >
                          {visit.status.toUpperCase()}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-black border-slate-100 text-slate-400"
                        >
                          #LOG-{visit.id}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-300 hover:text-slate-900 rounded-xl"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <CardFooter className="bg-slate-50 p-4 border-t border-slate-100 flex justify-center">
              <Button
                variant="ghost"
                className="text-xs font-black text-slate-400 uppercase tracking-widest"
              >
                View Full Archive
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Tactical Health Insights */}
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-x-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            Critical Telemetry
          </h3>

          <Card className="border-none glass futuristic-card bg-linear-to-br from-red-600 to-red-500 text-white p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Heart className="h-20 w-20 fill-white" />
            </div>
            <h4 className="text-xl font-black tracking-tight mb-2">
              Emergency Hub
            </h4>
            <p className="text-xs opacity-80 font-medium leading-relaxed">
              Student Alexander Pierce (10-A) has a listed severe peanut
              allergy. Avoid proximity to nuts in cafeteria during lunch shift.
            </p>
            <div className="mt-6 flex items-center gap-x-4">
              <Button className="flex-1 bg-white text-red-600 font-black rounded-xl hover:bg-white/90 shadow-lg text-xs">
                VIEW PROFILE
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 text-white border-white/20 font-black rounded-xl text-xs flex-shrink-0"
              >
                CALL E.C.
              </Button>
            </div>
          </Card>

          <Card className="border-none glass futuristic-card p-6">
            <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">
                Vitals Telemetry
              </CardTitle>
              <Thermometer className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-slate-400">Clinic Utilization</span>
                  <span className="text-slate-900">74%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[74%] neon-blue" />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-x-3">
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                  <Pill className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Stock Alert
                  </h5>
                  <p className="text-xs font-bold text-slate-900 leading-none">
                    Antihistamine (Low Stock)
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-none glass futuristic-card bg-slate-900 text-white p-6 overflow-hidden relative">
            <div className="flex flex-col gap-y-4">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-black text-lg">Wellness Pulse</h4>
                <p className="text-xs opacity-60 font-medium">
                  No behavioral health flags raised in the last 24 hours.
                </p>
              </div>
              <Button
                variant="ghost"
                className="w-full text-blue-400 font-black text-[10px] uppercase tracking-widest justify-start p-0 h-auto hover:text-blue-300 hover:bg-transparent"
              >
                Run Diagnostic →
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
