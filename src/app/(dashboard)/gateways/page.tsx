"use client";

import { useState } from "react";
import {
  Globe,
  CreditCard,
  RefreshCw,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  Activity,
  Cloud,
  Key,
  Lock,
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const gateways = [
  {
    id: "1",
    name: "Stripe Production",
    type: "Financial",
    status: "Operational",
    latency: "42ms",
    encryption: "TLS 1.3",
  },
  {
    id: "2",
    name: "PayPal Global",
    type: "Financial",
    status: "Operational",
    latency: "88ms",
    encryption: "TLS 1.3",
  },
  {
    id: "3",
    name: "Google Classroom",
    type: "LMS",
    status: "Syncing",
    latency: "112ms",
    encryption: "OAuth 2.0",
  },
  {
    id: "4",
    name: "Canvas LMS",
    type: "LMS",
    status: "Operational",
    latency: "95ms",
    encryption: "OAuth 2.0",
  },
];

export default function GatewayHub() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-600 border border-white/10 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Globe className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              Ecosystem Gateways
            </h2>
            <p className="text-slate-500 font-medium tracking-tight">
              Managing Institutional Connectivity & Global Financial/LMS
              Synchronisation
            </p>
          </div>
        </div>
        <div className="flex gap-x-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white font-bold gap-x-2"
          >
            <Key className="h-4 w-4" />
            API Keys
          </Button>
          <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
            <RefreshCw className="h-4 w-4" />
            Sync All
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none glass futuristic-card p-6 bg-slate-900 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Activity className="h-24 w-24 text-blue-400" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Gateway Health
          </p>
          <h3 className="text-3xl font-black mt-2 text-white">Optimal</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-blue-300">
            Uptime: 99.998%
          </div>
        </Card>

        <Card className="border-none glass futuristic-card p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Total Sync Volume
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900">42.5K</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            Records/Month
          </div>
        </Card>

        <Card className="border-none glass futuristic-card p-6 border-blue-100 bg-blue-50/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">
            Active Bridges
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900">08</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-blue-500">
            <Layers className="h-4 w-4" />
            Multi-Tenant Ready
          </div>
        </Card>

        <Card className="border-none glass futuristic-card p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Security Layer
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900">V3.0</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-green-500 uppercase tracking-widest leading-none">
            <ShieldCheck className="h-4 w-4" />
            Encrypted Transit
          </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Gateway Directory */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-x-2">
              <Cloud className="h-4 w-4" />
              External Bridges
            </h3>
          </div>

          <Card className="border-none glass futuristic-card overflow-hidden">
            <div className="divide-y divide-slate-100">
              {gateways.map((gate) => (
                <div
                  key={gate.id}
                  className="p-6 flex items-center gap-x-6 hover:bg-slate-50 transition-all group"
                >
                  <div
                    className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center transition-all group-hover:bg-slate-900 group-hover:text-white",
                      gate.type === "Financial"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-purple-50 text-purple-600",
                    )}
                  >
                    {gate.type === "Financial" ? (
                      <CreditCard className="h-7 w-7" />
                    ) : (
                      <Layers className="h-7 w-7" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-x-3 mb-1">
                      <h4 className="font-black text-slate-900 text-lg">
                        {gate.name}
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-black border-slate-200"
                      >
                        {gate.type.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-x-4 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-x-1">
                        <Activity className="h-3 w-3" />
                        Latency: {gate.latency}
                      </span>
                      <span className="flex items-center gap-x-1">
                        <Lock className="h-3 w-3" />
                        {gate.encryption}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-x-3">
                    <Badge
                      className={cn(
                        "text-[10px] font-black border-none",
                        gate.status === "Operational"
                          ? "bg-green-50 text-green-600"
                          : "bg-blue-50 text-blue-600",
                      )}
                    >
                      {gate.status.toUpperCase()}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-300 hover:text-slate-900 rounded-xl"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <CardFooter className="bg-slate-50 p-4 flex justify-center border-t border-slate-100">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                Institutional Hub for Cross-Platform Integrity
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Sync Controls */}
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
            Ecosystem Orchestration
          </h3>

          <Card className="border-none glass futuristic-card bg-slate-900 text-white p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
              <RefreshCw className="h-24 w-24 text-blue-400" />
            </div>
            <h4 className="text-xl font-black tracking-tight mb-2">
              Omni-Sync Oracle
            </h4>
            <p className="text-xs opacity-60 font-medium leading-relaxed">
              Automated synchronization with all connected LMS and Financial
              platforms. Last sync: 12 mins ago.
            </p>
            <Button className="mt-6 w-full bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 border-none shadow-xl shadow-blue-900/40 py-6">
              MIGRATE RECORDS NOW
            </Button>
          </Card>

          <Card className="border-none glass futuristic-card p-6">
            <CardHeader className="p-0 mb-4 flex items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">
                Gateway Traffic
              </CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <div className="space-y-6 mt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-slate-400">Financial Transit</span>
                  <span className="text-slate-900">82%</span>
                </div>
                <Progress
                  value={82}
                  className="h-1.5"
                  indicatorClassName="bg-blue-500"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-slate-400">LMS Data Stream</span>
                  <span className="text-slate-900">45%</span>
                </div>
                <Progress
                  value={45}
                  className="h-1.5"
                  indicatorClassName="bg-purple-500"
                />
              </div>
            </div>
          </Card>

          <Card className="border-none glass futuristic-card bg-linear-to-br from-blue-600 to-blue-500 text-white p-6 relative group overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-tr from-black/10 to-transparent" />
            <div className="relative z-10 space-y-4">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <ArrowRight className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-black text-lg">Connect New Bridge</h4>
                <p className="text-xs opacity-80 font-medium">
                  Extend your ecosystem with the **EduSmart SDK**.
                </p>
              </div>
              <Button
                variant="ghost"
                className="w-full h-10 border border-white/20 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/20"
              >
                OPEN SDK DOCUMENTATION
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
