"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Server, Database, HardDrive, Activity, Clock, AlertTriangle,
  CheckCircle, XCircle, Wifi, Cpu, MemoryStick, Globe,
  Shield, Zap, TrendingUp, TrendingDown
} from "lucide-react";

interface SystemMetric {
  label: string;
  value: string;
  status: "good" | "warning" | "critical";
  trend?: "up" | "down" | "stable";
  icon: any;
}

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  uptime: string;
  responseTime: string;
}

const METRICS: SystemMetric[] = [
  { label: "API Response Time", value: "124ms", status: "good", trend: "down", icon: Zap },
  { label: "Database Connections", value: "45/100", status: "good", trend: "stable", icon: Database },
  { label: "CPU Usage", value: "35%", status: "good", trend: "down", icon: Cpu },
  { label: "Memory Usage", value: "68%", status: "warning", trend: "up", icon: MemoryStick },
  { label: "Storage", value: "72%", status: "warning", trend: "up", icon: HardDrive },
  { label: "Active Users", value: "23", status: "good", trend: "up", icon: Activity },
];

const SERVICES: ServiceStatus[] = [
  { name: "Supabase Database", status: "operational", uptime: "99.98%", responseTime: "45ms" },
  { name: "Authentication", status: "operational", uptime: "99.99%", responseTime: "23ms" },
  { name: "Storage (S3)", status: "operational", uptime: "100%", responseTime: "89ms" },
  { name: "Email Service", status: "degraded", uptime: "99.50%", responseTime: "340ms" },
  { name: "CDN", status: "operational", uptime: "100%", responseTime: "12ms" },
  { name: "Background Jobs", status: "operational", uptime: "99.95%", responseTime: "1.2s" },
];

const RECENT_EVENTS = [
  { time: "10:35:22", level: "info", message: "Scheduled backup completed successfully" },
  { time: "10:15:00", level: "info", message: "Database maintenance completed" },
  { time: "09:45:33", level: "warning", message: "Email delivery queue backlog detected" },
  { time: "09:30:12", level: "info", message: "New user authentication service deployed" },
  { time: "08:55:44", level: "warning", message: "High memory usage alert - auto-scaling triggered" },
];

const STATUS_COLORS = {
  operational: "bg-emerald-100 text-emerald-700",
  degraded: "bg-amber-100 text-amber-700",
  down: "bg-red-100 text-red-700",
  good: "text-emerald-600",
  warning: "text-amber-600",
  critical: "text-red-600",
};

const STATUS_ICONS = {
  operational: CheckCircle,
  degraded: AlertTriangle,
  down: XCircle,
};

export function SystemHealthDashboard() {
  const overallStatus = SERVICES.every(s => s.status === "operational") 
    ? "operational" 
    : SERVICES.some(s => s.status === "down") 
      ? "down" 
      : "degraded";

  return (
    <div className="space-y-6">
      {/* Overall Status Banner */}
      <div className={`p-4 rounded-lg border ${
        overallStatus === "operational" ? "bg-emerald-50 border-emerald-200" :
        overallStatus === "degraded" ? "bg-amber-50 border-amber-200" :
        "bg-red-50 border-red-200"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {overallStatus === "operational" && <CheckCircle className="h-6 w-6 text-emerald-600" />}
            {overallStatus === "degraded" && <AlertTriangle className="h-6 w-6 text-amber-600" />}
            {overallStatus === "down" && <XCircle className="h-6 w-6 text-red-600" />}
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {overallStatus === "operational" ? "All Systems Operational" :
                 overallStatus === "degraded" ? "Some Services Degraded" :
                 "System Outage"}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Last checked: Just now</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">99.7%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Uptime (30 days)</p>
          </div>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {METRICS.map((metric, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={`h-5 w-5 ${
                  metric.status === "good" ? "text-emerald-500" :
                  metric.status === "warning" ? "text-amber-500" :
                  "text-red-500"
                }`} />
                {metric.trend && (
                  metric.trend === "down" ? 
                    <TrendingDown className="h-4 w-4 text-emerald-500" /> :
                  metric.trend === "up" ?
                    <TrendingUp className="h-4 w-4 text-amber-500" /> :
                    <Activity className="h-4 w-4 text-slate-400" />
                )}
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{metric.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services Status */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              Service Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {SERVICES.map((service, i) => {
                const StatusIcon = STATUS_ICONS[service.status];
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-4 w-4 ${
                        service.status === "operational" ? "text-emerald-500" :
                        service.status === "degraded" ? "text-amber-500" :
                        "text-red-500"
                      }`} />
                      <span className="font-medium text-slate-900 dark:text-white">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">{service.uptime}</span>
                      <span className="text-slate-600 dark:text-slate-400">{service.responseTime}</span>
                      <Badge className={STATUS_COLORS[service.status]}>{service.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Resource Usage */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {[
              { label: "CPU", value: 35, max: 100 },
              { label: "Memory", value: 68, max: 100 },
              { label: "Storage", value: 72, max: 100 },
              { label: "Bandwidth", value: 45, max: 100 },
            ].map((resource, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{resource.label}</span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{resource.value}%</span>
                </div>
                <Progress 
                  value={resource.value} 
                  className={`h-2 ${
                    resource.value > 80 ? "bg-red-100" :
                    resource.value > 60 ? "bg-amber-100" :
                    "bg-emerald-100"
                  }`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            Recent System Events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {RECENT_EVENTS.map((event, i) => (
              <div key={i} className="p-3 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-900">
                <div className={`w-2 h-2 rounded-full ${
                  event.level === "info" ? "bg-blue-500" :
                  event.level === "warning" ? "bg-amber-500" :
                  "bg-red-500"
                }`} />
                <span className="text-xs text-slate-400 font-mono w-20">{event.time}</span>
                <span className="text-sm text-slate-700 dark:text-slate-300">{event.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}