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
          <div className="flex items-center gap-x-2 mb-3">
             <div className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-semibold uppercase tracking-wider text-primary flex items-center gap-x-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                System Active
             </div>
             <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">MYS-01</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-foreground leading-none">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground font-medium text-xs mt-3 flex items-center gap-x-2">
             <BrainCircuit className="h-4 w-4 text-primary" />
             AI-Powered Analytics & Management
          </p>
        </div>
        <div className="flex items-center gap-x-3">
          <button className="p-3 rounded-md bg-secondary border border-border hover:bg-secondary/80 transition-all text-muted-foreground">
            <Bell className="h-5 w-5" />
          </button>
          <Link href="/oracle">
            <button className="relative group px-6 h-11 bg-primary text-primary-foreground rounded-md transition-all hover:opacity-90 active:scale-95 shadow-sm">
              <div className="flex items-center gap-x-2 font-semibold text-xs tracking-wide">
                <Zap className="h-4 w-4" />
                Launch Oracle
              </div>
            </button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 reveal-1">
        {stats.map((stat, i) => (
          <div
            key={stat.title}
            className="bg-card p-6 border border-border rounded-lg shadow-sm hover:border-primary/40 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </p>
              <stat.icon className="h-5 w-5 text-primary opacity-40" />
            </div>

            <div className="flex items-end gap-x-2">
              <h3 className="text-3xl font-bold text-foreground tracking-tight leading-none">
                {stat.value}
              </h3>
              <div className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                 {stat.trend}
              </div>
            </div>

            <div className="mt-6 space-y-1.5">
               <div className="flex justify-between text-[9px] font-medium text-muted-foreground">
                  <span>Usage Rate</span>
                  <span>{stat.trend}</span>
               </div>
               <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: '65%' }} 
                  />
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3 reveal-2">
        <div className="lg:col-span-1 bg-card p-6 border border-border rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-muted-foreground flex items-center gap-x-2 text-[10px] uppercase tracking-wider">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Recent Activity
            </h3>
            <div className="flex items-center gap-x-1.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
               <span className="h-1.5 w-1.5 rounded-full bg-primary" />
               Live
            </div>
          </div>
          <div className="space-y-3">
            {activityFeed.map((event, i) => (
              <div
                key={i}
                className="group/item flex gap-x-4 items-center p-3 rounded-md bg-muted/30 border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all cursor-pointer"
              >
                <div className="h-10 w-10 rounded-md bg-card border border-border flex items-center justify-center shrink-0 shadow-sm transition-all group-hover/item:border-primary/20">
                  <event.icon className="h-4 w-4 text-muted-foreground group-hover/item:text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground tracking-tight text-xs group-hover/item:text-primary transition-colors">
                    {event.title}
                  </p>
                  <p className="text-muted-foreground font-medium text-[10px] truncate uppercase tracking-wide mt-0.5">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/reports" className="w-full block">
            <button className="w-full mt-6 py-3 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 rounded-md hover:bg-primary/5 transition-all text-center">
              View Detailed Logs
            </button>
          </Link>
        </div>

        <div className="lg:col-span-2 bg-card p-6 border border-border rounded-lg shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <div>
                 <h3 className="text-xl font-bold text-foreground">Performance Projections</h3>
                 <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mt-1">AI-Driven Result Prediction</p>
              </div>
              <div className="flex gap-x-1">
                 <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                 <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                 <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
           </div>
           <PerformancePredictor />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7 reveal-3">
        <div className="col-span-4 bg-card p-8 border border-border rounded-lg shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-foreground">
                Attendance Trends
              </h3>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-1">
                Real-time System Monitoring
              </p>
            </div>
            <div className="px-3 py-1 bg-primary/10 text-primary font-bold text-[9px] uppercase tracking-wider rounded-full border border-primary/20">
               Active
            </div>
          </div>
          <div className="h-[280px] flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-muted/20">
            <Zap className="h-12 w-12 mb-4 text-muted-foreground opacity-20" />
            <p className="font-semibold text-[10px] uppercase tracking-widest text-muted-foreground/60">
              Initializing Analytics Engine...
            </p>
          </div>
        </div>

        <div className="col-span-3 bg-card p-8 border border-border rounded-lg shadow-sm">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-foreground">Schedule</h3>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-1">
              Upcoming Classes
            </p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-x-4 p-4 rounded-md bg-muted/30 border border-border hover:border-primary/30 hover:bg-muted/50 transition-all cursor-pointer group"
              >
                <div className="h-12 w-12 rounded-md bg-primary flex flex-col items-center justify-center text-primary-foreground shadow-sm">
                  <span className="text-[8px] font-bold uppercase tracking-tighter opacity-70">
                    Oct
                  </span>
                  <span className="text-xl font-bold leading-none">
                    {15 + i}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors">
                    Physics Department {i}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mt-1">
                    Room {102 + i} • 14:00
                  </p>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

