import OracleDashboardClient from "@/components/oracle/OracleDashboardClient";
import { OracleService } from "@/lib/services/oracle";

export default async function OracleHub() {
  const metrics = await OracleService.getSystemMetrics();

  return <OracleDashboardClient systemMetrics={metrics} />;
}

