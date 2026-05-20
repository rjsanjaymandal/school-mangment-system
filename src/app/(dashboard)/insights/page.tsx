import InsightsDashboard from "@/components/insights/InsightsDashboard";
import { InsightsService } from "@/lib/services/insights";
import { BrainCircuit } from "lucide-react";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const metrics = await InsightsService.getSystemMetrics();
  const atRiskStudents = await InsightsService.getAtRiskStudents();

  return (
    <div className="p-6 space-y-0 animate-in fade-in duration-700">
      <UnifiedPageHeader
        title="Insights"
        subtitle="Analytics and predictive intelligence"
        icon={BrainCircuit}
        color="emerald"
      />
      <InsightsDashboard systemMetrics={metrics} atRiskStudents={atRiskStudents} />
    </div>
  );
}