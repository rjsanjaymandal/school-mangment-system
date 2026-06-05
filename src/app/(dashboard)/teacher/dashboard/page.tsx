import {
  Users,
  Calendar,
  CheckCircle,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { InstitutionalService } from "@/lib/services/institutional";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function TeacherDashboard() {
  const supabase = await createClient();
  const academicYear = await InstitutionalService.getCurrentAcademicYear(supabase).catch((err: any) => ({ error: err.message }));
  const activeYearName =
    academicYear && !("error" in academicYear)
      ? academicYear.name
      : "Active Academic Cycle";

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">Teacher</span>
          </div>
          <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1">Educator Workspace</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{activeYearName}</p>
        </div>
        <Link href="/exams">
          <button className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 shadow-lg transition-all flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Grading Center
          </button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard title="Active Groups" value="4" icon={Users} color="blue" />
        <DashboardStatCard title="Pending Grading" value="12" icon={Calendar} color="amber" />
        <DashboardStatCard title="Attendance Rate" value="96%" icon={CheckCircle} color="emerald" />
        <DashboardStatCard title="Curriculum Progress" value="72%" icon={BookOpen} color="purple" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-950/20">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Classroom Overview</h3>
            </div>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition-all">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Advanced Physics (A-102)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition-all">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Quantum Theory (B-204)</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded bg-amber-50 dark:bg-amber-950/20">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Upcoming Events</h3>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30">
              <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Mid-Term Assessment</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Starts in 3 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}