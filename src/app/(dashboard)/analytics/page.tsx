"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BrainCircuit,
  TrendingUp,
  Users,
  GraduationCap,
  Zap,
  Activity,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const metrics = [
  { title: "Engagement Index", value: "92.4%", change: "+2.1%", trend: "up" },
  {
    title: "Knowledge Retention",
    value: "88.1%",
    change: "+0.8%",
    trend: "up",
  },
  { title: "Risk of Attrition", value: "1.2%", change: "-0.4%", trend: "down" },
  {
    title: "Resource Efficiency",
    value: "95.0%",
    change: "+1.5%",
    trend: "up",
  },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            Neural Insights
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">
            Advanced behavioral & academic telemetry analytics
          </p>
        </div>
        <div className="flex gap-x-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 font-bold bg-white shadow-sm"
          >
            <Filter className="h-4 w-4 mr-2" />
            Time Filter: Q1
          </Button>
          <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
            <Download className="h-4 w-4" />
            Export Intelligence
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card
            key={m.title}
            className="border-none glass futuristic-card group"
          >
            <CardContent className="p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                {m.title}
              </p>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">
                  {m.value}
                </h3>
                <div
                  className={`flex items-center text-[10px] font-bold ${m.trend === "up" ? "text-green-500" : "text-blue-500"}`}
                >
                  {m.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                  )}
                  {m.change}
                </div>
              </div>
              <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-slate-900 transition-all duration-1000 ${m.trend === "up" ? "neon-blue" : "neon-purple"}`}
                  style={{ width: m.value }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none glass futuristic-card min-h-[400px]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black">
                Performance Trajectory
              </CardTitle>
              <p className="text-xs text-slate-500">
                Predicted vs Actual academic growth
              </p>
            </div>
            <div className="flex items-center gap-x-4">
              <div className="flex items-center gap-x-1.5">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Actual
                </span>
              </div>
              <div className="flex items-center gap-x-1.5">
                <div className="h-2 w-2 rounded-full bg-slate-200 border border-slate-300" />
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Goal
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col justify-end h-[300px] mt-4 px-8">
            <div className="flex items-end justify-between h-full gap-x-2">
              {[40, 65, 55, 80, 75, 95, 88].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-y-2 group/bar"
                >
                  <div className="relative w-full">
                    <div
                      className="w-full bg-slate-50 border border-slate-100 rounded-t-xl transition-all duration-1000 group-hover/bar:bg-slate-100"
                      style={{ height: "200px", opacity: 0.3 }}
                    />
                    <div
                      className="absolute bottom-0 w-full bg-slate-900 rounded-t-xl neon-blue transition-all duration-1000 group-hover/bar:scale-x-105"
                      style={{ height: `${h}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all shadow-xl">
                      {h}%
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    M0{i + 1}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-none glass futuristic-card bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center gap-x-2">
              <BrainCircuit className="h-5 w-5 text-blue-400" />
              Neural Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <p className="text-xs font-medium leading-relaxed opacity-80">
                System has detected a **12% increase** in inter-departmental
                collaboration following the last assessment cycle.
              </p>
              <div className="flex items-center gap-x-2">
                <Badge className="bg-blue-500/20 text-blue-400 border-none text-[10px]">
                  CORRELATION: HIGH
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Departmental Health
              </h4>
              {[
                { name: "Science", val: 94 },
                { name: "Mathematics", val: 82 },
                { name: "Languages", val: 78 },
              ].map((d) => (
                <div key={d.name} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>{d.name.toUpperCase()}</span>
                    <span>{d.val}%</span>
                  </div>
                  <Progress
                    value={d.val}
                    className="h-1 bg-white/10"
                    indicatorClassName="bg-blue-500"
                  />
                </div>
              ))}
            </div>

            <Button className="w-full mt-4 rounded-xl py-6 bg-white text-slate-900 font-bold text-xs uppercase tracking-widest hover:bg-white/90 transition-all group">
              Full Diagnostic Report
              <Zap className="ml-2 h-4 w-4 group-hover:fill-current" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none glass futuristic-card">
          <CardHeader>
            <CardTitle className="text-lg font-black">
              Student Engagement Map
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200/50 flex items-center justify-center p-8">
            <div className="flex flex-wrap gap-4 justify-center">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-900 shadow-sm animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {Math.floor(Math.random() * 20) + 80}%
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none glass futuristic-card">
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center gap-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              System Latency Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-500">
                  API Response Time
                </span>
                <span className="font-black text-slate-900">
                  12ms (Target: &lt;50ms)
                </span>
              </div>
              <div className="h-12 w-full bg-slate-50 rounded-xl overflow-hidden flex items-end gap-x-1 px-1">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-green-400/30 rounded-t-sm"
                    style={{ height: `${Math.random() * 40 + 20}%` }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-center">
                  <p className="text-[10px] font-black text-green-600 uppercase">
                    Uptime
                  </p>
                  <p className="text-lg font-black text-green-700">99.99%</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-center">
                  <p className="text-[10px] font-black text-blue-600 uppercase">
                    Throughput
                  </p>
                  <p className="text-lg font-black text-blue-700">4.2k rps</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
