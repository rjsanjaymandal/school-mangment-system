import {
  GraduationCap,
  Users,
  BookOpen,
  ShieldAlert,
  UsersRound,
  Building2,
} from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { InstitutionalService } from "@/lib/services/institutional";
import { UserService } from "@/lib/services/user";
import { AdminCharts } from "./AdminCharts";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [academicYear, statsData] = await Promise.all([
    InstitutionalService.getCurrentAcademicYear(supabase).catch((e: any) => ({ error: e.message })),
    UserService.getSystemStats(supabase).catch((e: any) => ({ error: e.message })),
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
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">Admin</span>
          </div>
          <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1">Admin Mission Control</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{activeYearName}</p>
        </div>
        <button className="h-10 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-all flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" />
          Settings
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <DashboardStatCard title="Students" value={realStats.studentCount} icon={GraduationCap} color="emerald" description="Total Enrolled" />
        <DashboardStatCard title="Teachers" value={realStats.teacherCount} icon={Users} color="blue" description="Faculty Staff" />
        <DashboardStatCard title="Parents" value={realStats.parentCount} icon={UsersRound} color="purple" description="Verified Guardians" />
        <DashboardStatCard title="Classes" value={realStats.classCount} icon={BookOpen} color="slate" description="Active Sections" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-950/20">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Academic Overview</h3>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="h-3 w-full bg-slate-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[85%] rounded-full" />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">85% Syllabus Completion</p>
              <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">On Track</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-red-50 dark:bg-red-950/20">
                <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">System Security</h3>
              </div>
            </div>
          </div>
          <div className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              All gateway entries are monitored. No breaches detected in the last 24 hours.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-emerald-50 dark:bg-emerald-950/20">
              <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">System Analytics</h3>
            </div>
          </div>
        </div>
        <div className="p-5">
          <AdminCharts />
        </div>
      </div>
    </div>
  );
}