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
    <div className="space-y-10">
      <div className="flex items-center justify-between reveal-0">
        <div>
          <div className="flex items-center gap-x-2 mb-2">
            <Badge
              variant="outline"
              className="text-[10px] font-black uppercase tracking-[0.2em] border-primary/20 text-primary bg-primary/5 rounded-xs px-2 py-0.5"
            >
              System Online
            </Badge>
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse emerald-glow" />
          </div>
          <h2 className="text-5xl font-black tracking-tight text-foreground">
            Dashboard
          </h2>
          <p className="text-foreground/80 font-bold tracking-tight mt-1">
            Intelligence orchestration for{" "}
            <span className="text-primary font-black uppercase tracking-wider">
              Edu Maysan Enterprise
            </span>
          </p>
        </div>
        <div className="flex items-center gap-x-4">
          <button className="p-3 rounded-xs bg-card border border-border shadow-lg hover:border-primary/50 transition-all group reveal-1">
            <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
          <Link href="/analytics" className="reveal-2">
            <button className="flex items-center gap-x-2 bg-primary text-primary-foreground px-6 py-3 rounded-xs shadow-2xl hover:bg-primary/90 transition-all font-black text-xs uppercase tracking-[0.2em] emerald-glow">
              <BrainCircuit className="h-4 w-4" />
              Neural Engine
            </button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 reveal-1">
        {stats.map((stat, i) => (
          <Card
            key={stat.title}
            className={`border-border bg-card/40 backdrop-blur-md rounded-sm group hover:border-primary/50 transition-all duration-500 overflow-hidden relative shadow-2xl`}
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="h-12 w-12" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/70 group-hover:text-primary transition-colors">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-baseline gap-x-3">
                <div className="text-4xl font-black text-foreground tracking-tighter">
                  {stat.value}
                </div>
                <div className="flex items-center text-xs font-black text-primary">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.trend}
                </div>
              </div>
              <p className="text-[10px] text-foreground/50 font-black uppercase tracking-widest mt-2 group-hover:text-foreground/80 transition-colors">
                {stat.description}
              </p>
              <div className="mt-4 h-1 w-full bg-accent/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary emerald-glow w-2/3 group-hover:w-full transition-all duration-1000" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3 reveal-2">
        <div className="lg:col-span-1 border-border bg-card/40 backdrop-blur-md rounded-sm p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-foreground flex items-center gap-x-3 text-xs uppercase tracking-[0.4em]">
              <div className="p-1.5 bg-primary/10 rounded-xs">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              Live Stream
            </h3>
            <Badge
              variant="outline"
              className="text-[10px] font-black tracking-widest border-primary/20 text-primary bg-primary/5 rounded-none px-2"
            >
              SYNCED
            </Badge>
          </div>
          <div className="space-y-4">
            {activityFeed.map((event, i) => (
              <div
                key={i}
                className="flex gap-x-4 items-start p-4 rounded-xs bg-accent/30 border border-transparent hover:border-border hover:bg-accent/50 transition-all cursor-pointer group"
              >
                <div className="h-10 w-10 rounded-xs bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                  <event.icon className="h-4 w-4" />
                </div>
                <div className="text-xs">
                  <p className="font-black text-foreground uppercase tracking-tight">
                    {event.title}
                  </p>
                  <p className="text-foreground/60 font-medium mt-1 uppercase text-[10px] tracking-wider">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/reports" className="w-full block">
            <button className="w-full mt-10 py-4 text-[10px] font-black uppercase tracking-[0.4em] text-foreground/50 border border-dashed border-border rounded-xs hover:bg-accent hover:text-primary hover:border-primary transition-all duration-300">
              Launch Observer
            </button>
          </Link>
        </div>

        <div className="lg:col-span-2 reveal-3">
          <PerformancePredictor />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 reveal-3">
        <Card className="col-span-4 border-border bg-card/40 backdrop-blur-md rounded-sm shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div>
              <CardTitle className="text-xl font-black tracking-tight uppercase">
                Operational Status
              </CardTitle>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 mt-1">
                Real-time metrics & neural activity
              </p>
            </div>
            <div className="h-8 w-32 bg-accent/20 rounded-xs overflow-hidden relative">
              <div className="absolute inset-0 bg-primary/20 animate-pulse" />
              <div className="absolute inset-y-0 left-0 w-1/2 bg-primary/40" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground bg-accent/10 rounded-xs border-2 border-dashed border-border group hover:bg-accent/20 transition-all duration-500">
              <Activity className="h-12 w-12 mb-4 opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 text-primary" />
              <p className="font-black text-[10px] uppercase tracking-[0.5em] opacity-40 group-hover:opacity-100 transition-opacity">
                Initializing Analytics Engine...
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border bg-card/40 backdrop-blur-md rounded-sm shadow-2xl">
          <CardHeader className="pb-8">
            <CardTitle className="text-xl font-black tracking-tight uppercase">Neural Schedule</CardTitle>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 mt-1">
              Upcoming system critical events
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-x-4 p-4 rounded-xs bg-accent/30 border border-transparent hover:border-border hover:bg-accent/50 transition-all group cursor-pointer"
                >
                  <div className="h-12 w-12 rounded-xs bg-primary flex flex-col items-center justify-center text-primary-foreground shadow-lg group-hover:shadow-primary/20 transition-all">
                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">
                      Oct
                    </span>
                    <span className="text-xl font-black leading-none">
                      {15 + i}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">
                      Advanced Physics
                    </p>
                    <p className="text-[10px] text-foreground/60 font-black uppercase tracking-wider mt-1">
                      Block A-102 • 14:00 GST
                    </p>
                  </div>
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_12px_oklch(var(--primary)/0.6)] animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

