"use client";
import { useDashboardMetrics } from "@/lib/hooks/useDashboardMetrics";
import { OperationsRollup } from "./OperationsRollup";
import { FinancialDashboard } from "./FinancialDashboard";
import { InstitutionalBanner } from "./InstitutionalBanner";
import { DemographicsAnalytics } from "./DemographicsAnalytics";
import { PredictiveAnalytics } from "./PredictiveAnalytics";
import { Loader2, LayoutDashboard, GraduationCap, IndianRupee, BrainCircuit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportCardDownloadButton } from "@/components/reporting/ReportCardDownloadButton";

const defaultMetrics = {
  attendance: { today: { present: 0, absent: 0, late: 0 }, weekly: [] },
  finance: { collected: 0, pending: 0, expenses: 0 },
  footprint: { classes: 0, departments: 0, transport: { vehicles: 0, routes: 0, students: 0 } },
  demographics: { total: 0, byGender: {}, byClass: {} },
  insights: {}
};

export function DashboardOverview({ initialData }: { initialData?: any }) {
  const { data, isLoading } = useDashboardMetrics();

  const metrics = { ...defaultMetrics, ...(data || initialData || {}) };

  if (!metrics && isLoading && !initialData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <Tabs defaultValue="ops" className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <TabsList className="bg-muted/80 backdrop-blur-sm p-1 h-auto border border-border/50 rounded-xl">
            <TabsTrigger value="ops" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2 gap-2 text-xs font-semibold">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="academic" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2 gap-2 text-xs font-semibold">
              <GraduationCap className="w-4 h-4" />
              <span className="hidden sm:inline">Academic</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2 gap-2 text-xs font-semibold">
              <IndianRupee className="w-4 h-4" />
              <span className="hidden sm:inline">Finance</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2 gap-2 text-xs font-semibold">
              <BrainCircuit className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ops" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-4 bg-emerald-500 rounded-full" />
              Attendance
            </h3>
            <OperationsRollup metrics={metrics} />
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-500 rounded-full" />
              Students
            </h3>
            <DemographicsAnalytics metrics={metrics.demographics} />
          </section>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full" />
              School Info
            </h3>
            <InstitutionalBanner metrics={metrics.footprint} />
          </section>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass futuristic-card rounded-2xl p-8 border border-slate-200/60 flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <ReportCardDownloadButton />
              </div>
              <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Academic Report Engine</p>
              <p className="text-[10px] text-slate-500 mt-2 max-w-xs">Generate instant, professional PDF report cards for any student with academic summary and grading.</p>
            </div>
            <div className="glass futuristic-card rounded-2xl p-6 border border-slate-200/60 h-auto flex flex-col items-center justify-center text-center">
              <LayoutDashboard className="h-12 w-12 text-emerald-500 mb-4 opacity-20" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Exam Center</p>
              <p className="text-[10px] text-slate-500 mt-2">Upcoming: Real-time Proctoring & Result Entry</p>
            </div>
          </div>
        </TabsContent>

<TabsContent value="financial" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-4 bg-purple-500 rounded-full" />
              Finance
            </h3>
            <FinancialDashboard metrics={metrics.finance} />
          </section>
        </TabsContent>

<TabsContent value="insights" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="w-1 h-4 bg-indigo-500 rounded-full" />
              Analytics
            </h3>
            <PredictiveAnalytics />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
