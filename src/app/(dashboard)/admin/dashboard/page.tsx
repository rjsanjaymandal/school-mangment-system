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
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 page-fade-in">
      <PageHeader
        title="Admin Mission Control"
        description="Institutional Governance & Strategic System Management"
        icon={GraduationCap}
        badge={activeYearName}
      >
        <Button variant="outline" className="rounded-xl font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 gap-x-2">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </PageHeader>

      <div className="grid gap-8 md:grid-cols-4">
        {[
          { label: "Parental Network", value: realStats.parentCount, sub: "Verified Guardians", icon: Users, color: "blue" },
          { label: "Global Enrollment", value: realStats.studentCount, sub: "Verified Identities", icon: GraduationCap, color: "emerald" },
          { label: "Faculty Pool", value: realStats.teacherCount, sub: "Academic Staff", icon: Layout, color: "indigo" },
          { label: "Active Classes", value: realStats.classCount, sub: "Live Sections", icon: BookOpen, color: "slate" },
        ].map((stat, i) => (
          <Card key={i} className="card-premium rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className={`h-12 w-12 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400 flex items-center justify-center`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {stat.label}
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold text-slate-900 dark:text-white leading-none">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                {stat.sub}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="card-premium rounded-[2.5rem] p-10 space-y-8">
          <div className="flex items-center gap-x-5">
            <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shadow-sm">
              <BookOpen className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Academic Integrity</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Curriculum and syllabus sync status
              </p>
            </div>
          </div>
          <div className="space-y-4 pt-2">
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[85%] rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              85% Syllabus Completion • Batch 2024
            </p>
          </div>
        </Card>

        <Card className="card-premium rounded-[2.5rem] p-10 bg-slate-950 dark:bg-slate-900 text-white space-y-8 border-none overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] pointer-events-none" />
          <div className="flex items-center gap-x-5">
            <div className="h-14 w-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center shadow-sm">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Security Oversight</h3>
              <p className="text-sm font-medium text-slate-400">
                Threat detection & access monitoring
              </p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative z-10">
            <p className="text-sm font-medium italic opacity-80 leading-relaxed">
              "Autonomous kernels are monitoring all gateway entries. No
              breaches detected in the last 24h cycle."
            </p>
          </div>
        </Card>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-x-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Layout className="h-4 w-4" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">
            System Analytics
          </h3>
        </div>
        <Card className="card-premium rounded-[2.5rem] p-10 overflow-hidden">
          <AdminCharts />
        </Card>
      </div>
    </div>
  );
}
  );
}

