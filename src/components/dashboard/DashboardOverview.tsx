"use client";

import { useDashboardMetrics } from "@/lib/hooks/useDashboardMetrics";
import { OperationsRollup } from "./OperationsRollup";
import { FinancialDashboard } from "./FinancialDashboard";
import { InstitutionalBanner } from "./InstitutionalBanner";
import { DemographicsAnalytics } from "./DemographicsAnalytics";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardOverview({ initialData }: { initialData?: any }) {
  const { data, isLoading, error, refetch, isFetching } = useDashboardMetrics();

  const metrics = data || initialData;

  if (isLoading && !initialData) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Hydrating Institutional Metrics...</p>
      </div>
    );
  }

  if (error && !initialData) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <AlertCircle className="h-8 w-8 text-rose-600" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Failed to fetch dashboard data</p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {isFetching && <Loader2 className="h-3 w-3 text-emerald-600 animate-spin" />}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {isFetching ? "Syncing with Supabase..." : "Live Snapshot"}
          </span>
        </div>
      </div>

      {/* Section 1: Operations Rollup */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-emerald-500 pl-3">
          Daily Operations
        </h3>
        <OperationsRollup metrics={metrics} />
      </section>

      {/* Section 2: Institutional Banner */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-blue-500 pl-3">
          Academic Footprint
        </h3>
        <InstitutionalBanner metrics={metrics.footprint} />
      </section>

      {/* Section 3: Financial Command Center */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-purple-500 pl-3">
          Financial Command Center
        </h3>
        <FinancialDashboard metrics={metrics.finance} />
      </section>

      {/* Section 4: Advanced Demographics */}
      <section className="space-y-4 pb-12">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-amber-500 pl-3">
          Advanced Analytics
        </h3>
        <DemographicsAnalytics metrics={metrics.demographics} />
      </section>
    </div>
  );
}
