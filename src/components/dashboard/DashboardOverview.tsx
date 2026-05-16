"use client";
import { useDashboardMetrics } from "@/lib/hooks/useDashboardMetrics";
import { OperationsRollup } from "./OperationsRollup";
import { FinancialDashboard } from "./FinancialDashboard";
import { InstitutionalBanner } from "./InstitutionalBanner";
import { DemographicsAnalytics } from "./DemographicsAnalytics";
import { PredictiveAnalytics } from "./PredictiveAnalytics";
import { Loader2, AlertCircle, RefreshCw, LayoutDashboard, GraduationCap, IndianRupee, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DashboardOverview({ initialData }: { initialData?: any }) {
  const { data, isLoading, error, refetch, isFetching } = useDashboardMetrics();

  const metrics = data || initialData;

  if (isLoading && !initialData) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">
          Initializing Institutional Engine...<br/>
          <span className="text-[10px] font-normal lowercase tracking-normal">Syncing global telemetry with Supabase nodes</span>
        </p>
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <Tabs defaultValue="ops" className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <TabsList className="glass p-1 h-auto bg-slate-100/50 backdrop-blur-xl border border-slate-200/60 rounded-xl">
            <TabsTrigger value="ops" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Operations</span>
            </TabsTrigger>
            <TabsTrigger value="academic" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Academic</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 gap-2">
              <IndianRupee className="h-4 w-4" />
              <span className="hidden sm:inline">Financials</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4 py-2 gap-2">
              <BrainCircuit className="h-4 w-4" />
              <span className="hidden sm:inline">AI Insights</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200/50">
            {isFetching && <Loader2 className="h-3 w-3 text-emerald-600 animate-spin" />}
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {isFetching ? "Synchronizing Telemetry..." : "Live Institutional Snapshot"}
            </span>
          </div>
        </div>

        <TabsContent value="ops" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-emerald-500 pl-3">
                Daily Operations Rollup
              </h3>
            </div>
            <OperationsRollup metrics={metrics} />
          </section>

          <section className="space-y-4 pb-12">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-amber-500 pl-3">
              Institutional Demographics
            </h3>
            <DemographicsAnalytics metrics={metrics.demographics} />
          </section>
        </TabsContent>

        <TabsContent value="academic" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-blue-500 pl-3">
              Academic Footprint Index
            </h3>
            <InstitutionalBanner metrics={metrics.footprint} />
          </section>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass futuristic-card rounded-2xl p-6 border border-slate-200/60 h-64 flex flex-col items-center justify-center text-center">
              <GraduationCap className="h-12 w-12 text-blue-500 mb-4 opacity-20" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Curriculum Performance Module</p>
              <p className="text-[10px] text-slate-500 mt-2">Expansion Pack Incoming: Grade Distribution & Teacher Efficacy</p>
            </div>
            <div className="glass futuristic-card rounded-2xl p-6 border border-slate-200/60 h-64 flex flex-col items-center justify-center text-center">
              <LayoutDashboard className="h-12 w-12 text-emerald-500 mb-4 opacity-20" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Exam Command Center</p>
              <p className="text-[10px] text-slate-500 mt-2">Expansion Pack Incoming: Real-time Proctoring & Result Analytics</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-purple-500 pl-3">
              Financial Command Overview
            </h3>
            <FinancialDashboard metrics={metrics.finance} />
          </section>
        </TabsContent>

        <TabsContent value="insights" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] border-l-4 border-rose-500 pl-3">
              AI Predictive Engine
            </h3>
            <PredictiveAnalytics />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
