export const dynamic = "force-dynamic";

import { BarChart3, GraduationCap, UserSquare2, Library, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDashboardMetrics } from "@/app/actions/dashboard-metrics";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default async function DashboardPage() {
  // Single, unified data fetch for the entire dashboard
  const metrics = await getDashboardMetrics();

  return (
    <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-white/50 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl futuristic-card">
            <BarChart3 className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              School <span className="text-emerald-600 font-light">Dashboard</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
              Daily Overview of Students & Staff
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Hydrated from Unified Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          title="Students"
          value={metrics.counts.students}
          icon={GraduationCap}
          color="emerald"
        />
        <StatCard
          title="Teachers"
          value={metrics.counts.teachers}
          icon={UserSquare2}
          color="blue"
        />
        <StatCard
          title="Books"
          value={metrics.counts.books}
          icon={Library}
          color="purple"
        />
        <StatCard
          title="Loans"
          value={metrics.counts.loans}
          icon={BookOpen}
          color="amber"
        />
      </div>

      {/* Modern Dashboard Sections */}
      <ErrorBoundary>
        <DashboardOverview initialData={metrics} />
      </ErrorBoundary>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: number; 
  icon: any; 
  color: string 
}) {
  const accentColorClasses: Record<string, string> = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
  };
  
  const borderColors: Record<string, string> = {
    emerald: "border-l-emerald-500",
    blue: "border-l-blue-500",
    purple: "border-l-purple-500",
    amber: "border-l-amber-500",
  };

  return (
    <div className={cn(
      "glass futuristic-card rounded-2xl p-5 border-l-4 shadow-sm",
      borderColors[color]
    )}>
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-xl border flex items-center justify-center", accentColorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
