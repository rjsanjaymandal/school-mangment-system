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

const stats = [
  {
    title: "Total Students",
    value: "1,234",
    icon: GraduationCap,
    trend: "+12.5%",
    description: "Enrollment growth",
    color: "text-blue-500",
  },
  {
    title: "Faculty Members",
    value: "84",
    icon: UserSquare2,
    trend: "+2.1%",
    description: "Active staff",
    color: "text-purple-500",
  },
  {
    title: "Current Attendance",
    value: "94.2%",
    icon: Activity,
    trend: "+0.8%",
    description: "Daily average",
    color: "text-green-500",
  },
  {
    title: "Monthly Revenue",
    value: "$45.2K",
    icon: CreditCard,
    trend: "+18%",
    description: "Fee collection",
    color: "text-orange-500",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-x-2 mb-1">
            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-tighter border-blue-200 text-blue-600 bg-blue-50 font-bold"
            >
              System Live
            </Badge>
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            Command Center
          </h2>
          <p className="text-slate-500 font-medium">
            Intelligence overview for{" "}
            <span className="text-slate-900 font-bold">
              EduSmart Enterprise
            </span>
          </p>
        </div>
        <div className="flex items-center gap-x-3">
          <button className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <Bell className="h-5 w-5 text-slate-400 group-hover:text-slate-900" />
          </button>
          <Link href="/analytics">
            <button className="flex items-center gap-x-2 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl hover:bg-slate-800 transition-all font-bold text-sm neon-blue">
              <BrainCircuit className="h-4 w-4 text-blue-400" />
              Neural Engine
            </button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className={`border-none glass futuristic-card group p-1`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">
                {stat.title}
              </CardTitle>
              <div className={stat.color}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-x-2">
                <div className="text-3xl font-black text-slate-900 tracking-tighter">
                  {stat.value}
                </div>
                <div className="flex items-center text-xs font-bold text-green-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.trend}
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Neural Analysis Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 border-none glass futuristic-card p-6 bg-white/40 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-900 flex items-center gap-x-2 text-sm uppercase tracking-widest">
              <Zap className="h-4 w-4 text-blue-500" />
              Live Stream
            </h3>
            <Badge
              variant="outline"
              className="text-[10px] font-bold border-green-100 text-green-600 bg-green-50"
            >
              SYNCED
            </Badge>
          </div>
          <div className="space-y-4">
            {[
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
            ].map((event, i) => (
              <div
                key={i}
                className="flex gap-x-4 items-start p-4 rounded-2xl bg-white/60 border border-slate-100/50 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 neon-blue transition-transform group-hover:scale-105">
                  <event.icon className="h-4 w-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900">{event.title}</p>
                  <p className="text-slate-500 mt-1">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/reports" className="w-full block">
            <button className="w-full mt-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-dashed rounded-xl hover:bg-white hover:text-slate-900 transition-all">
              Launch Observer
            </button>
          </Link>
        </div>

        <div className="lg:col-span-2">
          <PerformancePredictor />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none glass futuristic-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">
                Operational Pulse
              </CardTitle>
              <p className="text-xs text-slate-500">
                Real-time attendance & activity metrics
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200/50 group hover:bg-slate-50 transition-colors">
              <Activity className="h-10 w-10 mb-4 opacity-20 group-hover:scale-110 transition-transform duration-500" />
              <p className="font-bold text-sm uppercase tracking-widest opacity-40">
                Initializing Analytics Engine...
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none glass futuristic-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Neural Schedule</CardTitle>
            <p className="text-xs text-slate-500">
              Upcoming critical examinations
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-x-4 p-4 rounded-2xl bg-white border border-slate-50 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                >
                  <div className="h-12 w-12 rounded-xl bg-slate-900 flex flex-col items-center justify-center text-white neon-blue">
                    <span className="text-[10px] font-bold uppercase opacity-60">
                      Oct
                    </span>
                    <span className="text-lg font-black leading-none">
                      {15 + i}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                      Advanced Physics
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Block A-102 • 14:00 GST
                    </p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
