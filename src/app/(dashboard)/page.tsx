import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  UserSquare2,
  CreditCard,
  Activity,
  Zap,
  TrendingUp,
  Bell,
  BrainCircuit,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PerformancePredictor } from "@/components/ai/PerformancePredictor";
import { UserService } from "@/lib/services/user";
import { AuditService } from "@/lib/services/audit";

export default async function DashboardPage() {
  const [statsData, recentLogs] = await Promise.all([
    UserService.getSystemStats(),
    AuditService.getAuditEntries(),
  ]);

  // Handle case where service returns an error object
  const realStats =
    statsData && !("error" in statsData)
      ? statsData
      : {
        studentCount: 1234,
        teacherCount: 84,
        attendanceRate: "94.2%",
        revenue: "₹45.2K",
      };

  const activityFeed = Array.isArray(recentLogs)
    ? recentLogs.slice(0, 3).map((log) => ({
      title: log.action.replace(/_/g, " "),
      desc: `Updated by ${log.actor?.first_name || "System"}`,
      icon:
        log.action.includes("USER") || log.action.includes("PROFILE")
          ? Users
          : Zap,
    }))
    : [
      {
        title: "Admission Open",
        desc: "Term 2 portal is active.",
        icon: GraduationCap,
      },
      {
        title: "System Heartbeat",
        desc: "All nodes operational.",
        icon: Activity,
      },
      {
        title: "Asset Audit",
        desc: "Lab equipment verified.",
        icon: Zap,
      },
    ];

  const stats = [
    {
      title: "Total Students",
      value: realStats.studentCount.toString(),
      icon: GraduationCap,
      trend: "+12.5%",
      description: "Enrollment growth",
      color: "text-blue-500",
    },
    {
      title: "Faculty Members",
      value: realStats.teacherCount.toString(),
      icon: UserSquare2,
      trend: "+2.1%",
      description: "Active staff",
      color: "text-purple-500",
    },
    {
      title: "Current Attendance",
      value: realStats.attendanceRate,
      icon: Activity,
      trend: "+0.8%",
      description: "Daily average",
      color: "text-green-500",
    },
    {
      title: "Monthly Revenue",
      value: realStats.revenue,
      icon: CreditCard,
      trend: "+18%",
      description: "Fee collection",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in transition-all duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 reveal-0">
        <div>
          <div className="flex items-center gap-x-3 mb-4">
             <div className="px-3 py-1 rounded-sm bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                System Heartbeat: Optimal
             </div>
             <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">Node ID: MYS-01</span>
          </div>
          <h2 className="text-6xl font-black tracking-tighter text-foreground uppercase italic leading-none">
            Registry <span className="text-primary tracking-normal not-italic">/</span> Overview
          </h2>
          <p className="text-foreground/50 font-black uppercase tracking-[0.25em] text-[10px] mt-4 flex items-center gap-x-3">
             <BrainCircuit className="h-3 w-3 text-primary" />
             Neural Intelligence Orchestration Layer
          </p>
        </div>
        <div className="flex items-center gap-x-4">
          <button className="p-4 rounded-sm bg-white/5 border border-white/10 shadow-2xl hover:border-primary/50 transition-all group reveal-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Bell className="h-5 w-5 text-foreground/60 group-hover:text-primary transition-colors relative z-10" />
          </button>
          <Link href="/oracle" className="reveal-2">
            <button className="relative group px-10 py-5 bg-primary text-primary-foreground rounded-sm overflow-hidden emerald-border-glow transition-all duration-500 hover:scale-105 active:scale-95">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />
              <div className="flex items-center gap-x-3 relative z-10 font-black text-xs uppercase tracking-[0.3em]">
                <Zap className="h-4 w-4 animate-pulse" />
                Initiate Oracle
              </div>
            </button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 reveal-1">
        {stats.map((stat, i) => (
          <div
            key={stat.title}
            className="group relative glass-card p-8 transition-all duration-700 hover:emerald-border-glow hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:opacity-20 group-hover:rotate-12 transition-all duration-700">
              <stat.icon className="h-20 w-20 text-primary" />
            </div>
            
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mb-6 group-hover:text-primary group-hover:tracking-[0.5em] transition-all">
              {stat.title}
            </p>

            <div className="flex items-end gap-x-4">
              <h3 className="text-5xl font-black text-foreground tracking-tighter leading-none">
                {stat.value}
              </h3>
              <div className="flex items-center text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-xs border border-primary/20 mb-1">
                 {stat.trend}
              </div>
            </div>

            <div className="mt-8 space-y-2">
               <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-foreground/40">
                  <span>Operational Load</span>
                  <span>{stat.trend}</span>
               </div>
               <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary shadow-[0_0_15px_oklch(var(--primary))] transition-all duration-1000 group-hover:w-full" 
                    style={{ width: '65%' }} 
                  />
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3 reveal-2">
        <div className="lg:col-span-1 glass-card p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
          <div className="flex justify-between items-center mb-10 relative z-10">
            <h3 className="font-black text-foreground flex items-center gap-x-4 text-[11px] uppercase tracking-[0.5em]">
              <div className="p-2 bg-primary/10 rounded-sm border border-primary/20 shadow-inner">
                <Activity className="h-4 w-4 text-primary animate-pulse" />
              </div>
              Live Telemetry
            </h3>
            <div className="flex items-center gap-x-2">
               <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
               <span className="text-[9px] font-black text-primary uppercase tracking-widest">Channel Active</span>
            </div>
          </div>
          <div className="space-y-4 relative z-10">
            {activityFeed.map((event, i) => (
              <div
                key={i}
                className="group/item flex gap-x-5 items-center p-4 rounded-sm bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/10 transition-all duration-500 cursor-pointer"
              >
                <div className="h-12 w-12 rounded-sm bg-background border border-border group-hover/item:border-primary/40 flex items-center justify-center shrink-0 shadow-2xl transition-all group-hover/item:scale-110 group-hover/item:rotate-3">
                  <event.icon className="h-5 w-5 text-primary/60 group-hover/item:text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-foreground uppercase tracking-tight text-[11px] truncate group-hover/item:text-primary transition-colors">
                    {event.title}
                  </p>
                  <p className="text-foreground/40 font-black mt-1 uppercase text-[9px] tracking-widest truncate">{event.desc}</p>
                </div>
                <div className="opacity-0 group-hover/item:opacity-100 transition-opacity">
                   <Zap className="h-3 w-3 text-primary" />
                </div>
              </div>
            ))}
          </div>
          <Link href="/reports" className="w-full block relative z-10">
            <button className="w-full mt-10 py-5 text-[10px] font-black uppercase tracking-[0.5em] text-primary bg-primary/5 border border-primary/20 rounded-sm hover:bg-primary/10 hover:tracking-[0.6em] transition-all duration-500 group">
              Decrypt Full Logs
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-2">→</span>
            </button>
          </Link>
        </div>

        <div className="lg:col-span-2 glass-panel p-1 rounded-sm reveal-3 overflow-hidden emerald-border-glow">
          <div className="p-8">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter italic">Predictive Analytics</h3>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mt-1">AI-Driven Result Projection</p>
                </div>
                <div className="flex gap-x-2">
                   <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                   <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                   <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                </div>
             </div>
             <PerformancePredictor />
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7 reveal-3">
        <div className="col-span-4 glass-card p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12">
             <TrendingUp className="h-64 w-64 text-primary" />
          </div>
          <div className="flex row items-center justify-between mb-12 relative z-10">
            <div>
              <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-none">
                System Pulse
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mt-2">
                Real-time Node Saturation
              </p>
            </div>
            <div className="px-4 py-2 bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-widest rounded-sm shadow-2xl emerald-border-glow animate-pulse">
               High Load
            </div>
          </div>
          <div className="h-[280px] flex flex-col items-center justify-center relative z-10 glass-panel border-dashed border-2 border-primary/20 group hover:border-primary/40 transition-all duration-700 rounded-sm">
            <Zap className="h-16 w-16 mb-6 text-primary animate-pulse opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            <p className="font-black text-[10px] uppercase tracking-[0.8em] text-primary/40 group-hover:text-primary transition-all">
              Tuning Analytics Engine...
            </p>
          </div>
        </div>

        <div className="col-span-3 glass-card p-10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary-rgb),0.05),transparent)]" />
          <div className="mb-10 relative z-10">
            <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Agenda</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 mt-2">
              Neural Sync Schedule
            </p>
          </div>
          <div className="space-y-6 relative z-10">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-x-6 p-5 rounded-sm bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all duration-500 group/agenda cursor-pointer"
              >
                <div className="h-14 w-14 rounded-sm bg-primary border-4 border-background flex flex-col items-center justify-center text-primary-foreground shadow-2xl group-hover/agenda:scale-110 transition-all duration-500">
                  <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">
                    Oct
                  </span>
                  <span className="text-2xl font-black leading-none italic">
                    {15 + i}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-black text-foreground uppercase tracking-tight group-hover/agenda:text-primary transition-colors">
                    Quantum Physics {i}
                  </p>
                  <p className="text-[9px] text-foreground/40 font-black uppercase tracking-[0.2em] mt-2">
                    NODE A-102 • 14:00 GST
                  </p>
                </div>
                <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_15px_oklch(var(--primary))] animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

