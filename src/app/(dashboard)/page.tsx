export const dynamic = "force-dynamic";

import { BarChart3, GraduationCap, UserSquare2, Library, BookOpen, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDashboardMetrics } from "@/app/actions/dashboard-metrics";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";

export default async function DashboardPage() {
  // Single, unified data fetch for the entire dashboard
  const metrics = await getDashboardMetrics();

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      {/* Unified Page Header */}
      <UnifiedPageHeader 
        title="Institutional Dashboard"
        subtitle="Daily Overview of Students, Staff & Operations"
        icon={Activity}
        color="emerald"
        actions={
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">System Operational</span>
          </div>
        }
      />

      {/* Unified Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <DashboardStatCard 
          title="Students" 
          value={metrics.counts.students} 
          icon={GraduationCap} 
          color="emerald" 
          description="Enrolled Members"
        />
        <DashboardStatCard 
          title="Teachers" 
          value={metrics.counts.teachers} 
          icon={UserSquare2} 
          color="blue" 
          description="Academic Staff"
        />
        <DashboardStatCard 
          title="Books" 
          value={metrics.counts.books} 
          icon={Library} 
          color="purple" 
          description="Library Assets"
        />
        <DashboardStatCard 
          title="Loans" 
          value={metrics.counts.loans} 
          icon={BookOpen} 
          color="amber" 
          description="Pending Returns"
        />
      </div>

      {/* Modern Dashboard Sections */}
      <div className="animate-in slide-in-from-bottom-4 duration-700 delay-150">
        <ErrorBoundary>
          <DashboardOverview initialData={metrics} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
