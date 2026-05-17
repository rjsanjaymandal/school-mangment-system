import InsightsDashboard from "@/components/insights/InsightsDashboard";
import { InsightsService } from "@/lib/services/insights";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const metrics = await InsightsService.getSystemMetrics();
  const atRiskStudents = await InsightsService.getAtRiskStudents();

  return <InsightsDashboard systemMetrics={metrics} atRiskStudents={atRiskStudents} />;
}
