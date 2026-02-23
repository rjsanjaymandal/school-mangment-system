"use client";

import { useState } from "react";
import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Search,
  Plus,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  LineChart,
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const projections = [
  {
    id: "1",
    title: "Attrition Risk (Q2)",
    value: "1.2%",
    status: "Stable",
    trend: "down",
    confidence: "94%",
  },
  {
    id: "2",
    title: "Projected Revenue",
    value: "$4.2M",
    status: "Bullish",
    trend: "up",
    confidence: "88%",
  },
  {
    id: "3",
    title: "Faculty Load Balance",
    value: "92%",
    status: "Optimal",
    trend: "stable",
    confidence: "91%",
  },
];

export default function OracleHub() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-white neon-blue">
            <BrainCircuit className="h-7 w-7 text-blue-400" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              Predictive Oracle
            </h2>
            <p className="text-slate-500 font-medium tracking-tight">
              Advanced Machine Learning Telemetry & Institutional Forecasting
            </p>
          </div>
        </div>
        <div className="flex gap-x-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white font-bold gap-x-2"
          >
            <LineChart className="h-4 w-4" />
            Model Logs
          </Button>
          <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
            <Zap className="h-4 w-4" />
            Run Forecast
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {projections.map((p) => (
          <Card
            key={p.id}
            className="border-none glass futuristic-card p-6 overflow-hidden relative group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <Activity className="h-20 w-20" />
            </div>
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {p.title}
              </p>
              <Badge
                className={cn(
                  "text-[8px] font-black border-none",
                  p.status === "Bullish"
                    ? "bg-green-50 text-green-600"
                    : p.status === "Stable"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-yellow-50 text-yellow-600",
                )}
              >
                {p.status.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-baseline gap-x-3">
              <h3 className="text-3xl font-black text-slate-900">{p.value}</h3>
              <div
                className={cn(
                  "flex items-center text-[10px] font-bold",
                  p.trend === "up" ? "text-green-500" : "text-blue-500",
                )}
              >
                {p.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {p.trend.toUpperCase()}
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
              <span>Confidence Score</span>
              <span className="text-slate-900 font-black">{p.confidence}</span>
            </div>
            <Progress
              value={parseInt(p.confidence)}
              className="h-1 mt-2"
              indicatorClassName="bg-slate-900"
            />
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Deep Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-x-2">
              <TrendingUp className="h-4 w-4" />
              Neural Attrition Matrix
            </h3>
            <div className="flex gap-x-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl h-9 border-slate-100 font-black text-[10px] uppercase"
              >
                Refine Model
              </Button>
            </div>
          </div>

          <Card className="border-none glass futuristic-card p-8">
            <div className="h-[300px] flex items-end gap-x-4">
              {[65, 42, 88, 35, 76, 54, 95, 62].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-y-3 group/p"
                >
                  <div className="relative w-full h-[250px] flex items-end">
                    <div className="absolute inset-0 bg-slate-50/50 rounded-t-xl group-hover/p:bg-slate-100 transition-colors" />
                    <div
                      className="relative w-full bg-slate-900 rounded-t-xl neon-blue transition-all duration-700"
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg opacity-0 group-hover/p:opacity-100 transition-all shadow-xl">
                        {h}% YIELD
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400">
                    DPT 0{i + 1}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[10px] font-black text-slate-400">
              <p className="uppercase tracking-[0.2em]">
                Based on 5-year longitudinal historical data correlation
              </p>
              <div className="flex gap-x-4">
                <span className="flex items-center gap-x-1">
                  <div className="h-2 w-2 rounded-full bg-slate-900" />{" "}
                  PREDICTED
                </span>
                <span className="flex items-center gap-x-1">
                  <div className="h-2 w-2 rounded-full bg-slate-200" />{" "}
                  HISTORICAL
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Oracle Recommendations */}
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
            Oracle Directives
          </h3>

          <Card className="border-none glass futuristic-card bg-slate-900 text-white p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-20 w-20 text-blue-400" />
            </div>
            <h4 className="text-xl font-black tracking-tight mb-2">
              Stability Check
            </h4>
            <p className="text-xs opacity-60 font-medium leading-relaxed">
              ML identifies a **high probability** of capacity bottleneck in the
              Science department by next semester ($P=0.88$).
            </p>
            <div className="mt-6 space-y-3">
              <Button className="w-full bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 border-none shadow-xl shadow-blue-900/40">
                HIRE FACULTY RL
              </Button>
              <Button
                variant="ghost"
                className="w-full text-blue-400 font-black text-[10px] uppercase tracking-widest"
              >
                View Stress Test →
              </Button>
            </div>
          </Card>

          <Card className="border-none glass futuristic-card p-6 border-yellow-100 bg-yellow-50/5">
            <div className="flex items-center gap-x-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h5 className="text-[10px] font-black text-yellow-600 uppercase tracking-widest leading-none">
                  Yield Warning
                </h5>
                <p className="text-sm font-black text-slate-900">
                  Projected Fee Variance
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
              Potential 2.4% deficit forecasted in elective fees due to regional
              inflation telemetry.
            </p>
            <div className="p-4 rounded-xl bg-white border border-yellow-100">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">
                Recommended Offset
              </p>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900">
                  Adjust Elective Surcharge
                </span>
                <Badge className="bg-yellow-500 text-white border-none text-[8px] font-black">
                  +4.2%
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
