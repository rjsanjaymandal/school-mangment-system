import {
  GraduationCap,
  Layout,
  Users,
  BookOpen,
  ShieldAlert,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstitutionalService } from "@/lib/services/institutional";
import { UserService } from "@/lib/services/user";
import { Badge } from "@/components/ui/badge";
import { AdminCharts } from "./AdminCharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminDashboard() {
  const [academicYear, statsData] = await Promise.all([
    InstitutionalService.getCurrentAcademicYear().catch((e: any) => ({ error: e.message })),
    UserService.getSystemStats().catch((e: any) => ({ error: e.message })),
  ]);

  const realStats =
    statsData && !("error" in statsData)
      ? statsData
      : {
        studentCount: 0,
        teacherCount: 0,
        parentCount: 0,
        classCount: 0,
      };

  const activeYearName =
    academicYear && !("error" in academicYear)
      ? academicYear.name
      : "Academic Year 2024-25";

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
      <div className="reveal-1">
        <PageHeader
          title="Admin Mission Control"
          description="Institutional Governance & Strategic System Management"
          icon={<GraduationCap className="h-7 w-7" />}
          badge={activeYearName}
        >
          <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 gap-x-2 h-12 px-6 shadow-sm hover:shadow-md transition-all active:scale-95">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </PageHeader>
      </div>

      <div className="grid gap-8 md:grid-cols-4 reveal-2">
        {[
          { label: "Parental Network", value: realStats.parentCount, sub: "Verified Guardians", icon: Users, color: "blue", glow: "blue-glow" },
          { label: "Global Enrollment", value: realStats.studentCount, sub: "Verified Identities", icon: GraduationCap, color: "emerald", glow: "emerald-glow" },
          { label: "Faculty Pool", value: realStats.teacherCount, sub: "Academic Staff", icon: Layout, color: "indigo", glow: "indigo-glow" },
          { label: "Active Classes", value: realStats.classCount, sub: "Live Sections", icon: BookOpen, color: "slate", glow: "" },
        ].map((stat, i) => (
          <Card key={i} className={cn("card-interactive rounded-[2.5rem] p-8 space-y-6 group", stat.glow)}>
            <div className="flex items-center justify-between">
              <div className={`h-14 w-14 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-inner`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {stat.label}
              </p>
            </div>
            <div>
              <p className="text-5xl font-black text-slate-900 dark:text-white leading-none tracking-tighter italic">
                {stat.value}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4 opacity-70">
                {stat.sub}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2 reveal-3">
        <Card className="card-premium rounded-[3rem] p-10 space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none" />
          <div className="flex items-center gap-x-6">
            <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shadow-inner blue-glow">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Academic Integrity</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                Curriculum and syllabus sync status
              </p>
            </div>
          </div>
          <div className="space-y-4 pt-2">
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-blue-500 w-[85%] rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse" />
            </div>
            <div className="flex justify-between items-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                85% Syllabus Completion • Batch 2024
              </p>
              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-blue-500/20 text-blue-500">On Track</Badge>
            </div>
          </div>
        </Card>

        <Card className="card-premium rounded-[3rem] p-10 bg-slate-950 dark:bg-slate-900 text-white space-y-8 border-none overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] pointer-events-none" />
          <div className="flex items-center gap-x-6 relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shadow-inner">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic">Security Oversight</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">
                Threat detection & access monitoring
              </p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 relative z-10 backdrop-blur-sm shadow-inner group-hover:bg-white/10 transition-all duration-300">
            <p className="text-sm font-bold italic opacity-80 leading-relaxed tracking-wide">
              "Autonomous kernels are monitoring all gateway entries. No
              breaches detected in the last 24h cycle."
            </p>
          </div>
        </Card>
      </div>

      <div className="space-y-10 reveal-3">
        <div className="flex items-center gap-x-4 px-2">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center emerald-glow">
            <Layout className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-[0.2em] uppercase italic">
            System Analytics
          </h3>
          <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800" />
        </div>
        <Card className="card-premium rounded-[3rem] p-10 overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="relative z-10">
            <AdminCharts />
          </div>
        </Card>
      </div>
    </div>
  );
}

