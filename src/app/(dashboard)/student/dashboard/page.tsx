import { GraduationCap, Star, Book, Clock, TrendingUp, ClipboardCheck, Timer } from "lucide-react";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { InstitutionalService } from "@/lib/services/institutional";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function StudentDashboard() {
  const supabase = await createClient();
  const academicYear = await InstitutionalService.getCurrentAcademicYear(supabase).catch((err: any) => ({ error: err.message }));
  const activeYearName =
    academicYear && !("error" in academicYear)
      ? academicYear.name
      : "Academic Journey 2024";

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
            Student Portal
          </h2>
          <div className="flex items-center gap-x-2 mt-1">
            <p className="text-sm text-slate-500">
              Learning Journey & Academic Achievement Tracking
            </p>
            <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-green-50 text-green-600">
              {activeYearName}
            </span>
          </div>
        </div>
        <div className="h-12 w-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
          <GraduationCap className="h-6 w-6" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <DashboardStatCard title="GPA Index" value="3.88" icon={Star} color="amber" />
        <DashboardStatCard title="Course Load" value="6 Units" icon={Book} color="blue" />
        <DashboardStatCard title="Active Hours" value="142h" icon={Clock} color="purple" />
        <DashboardStatCard title="Trend" value="+0.2" icon={TrendingUp} color="indigo" />
        <DashboardStatCard title="Attendance" value="94%" icon={ClipboardCheck} color="emerald" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Academic Milestones
          </h3>
          <div className="space-y-3">
            {[
              { name: "Mathematics Mid-Term", grade: "A+", date: "2 days ago" },
              { name: "Advanced Physics Project", grade: "A", date: "Last week" },
              { name: "Library Research Paper", grade: "Pending", date: "Due Tomorrow" },
            ].map((m, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 hover:shadow-md transition-all"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">{m.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    {m.date}
                  </p>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                  m.grade === "Pending"
                    ? "bg-slate-100 text-slate-500"
                    : "bg-green-50 text-green-600"
                )}>
                  {m.grade}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden p-6 relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <GraduationCap className="h-32 w-32 -mr-8 -mt-8" />
          </div>
          <h3 className="text-lg font-black tracking-tight text-white mb-2">Next Milestone</h3>
          <p className="text-xs text-blue-300 opacity-70 mb-8">
            Calculus Final Entrance Exam
          </p>
          <div className="text-4xl font-black text-white mb-2">72:00:00</div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Time to Engagement
          </p>

          <button className="w-full mt-8 py-4 rounded-xl bg-blue-600 font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 text-white">
            Launch Preparation
          </button>
        </div>
      </div>
    </div>
  );
}