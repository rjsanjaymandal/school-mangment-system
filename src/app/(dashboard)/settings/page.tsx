import { createClient } from "@/lib/supabase/server";
import SettingsDashboardClient from "@/components/settings/SettingsDashboardClient";

export default async function SettingsPage() {
  const supabase = await createClient();

  const [settingsResult, gatewaysResult] = await Promise.all([
    supabase.from("school_settings").select("*").single(),
    supabase.from("payment_gateways").select("*").order("name", { ascending: true })
  ]);

  // If settings don't exist yet, we pass a default structure so the UI works
  const initialSettings = settingsResult.data || {
    school_name: "EduFox Demo School",
    contact_email: "admin@edufox.ai",
    currency: "USD",
    timezone: "UTC"
  };

  const initialGateways = gatewaysResult.data || [];

  return (
    <SettingsDashboardClient
      initialSettings={initialSettings}
      initialGateways={initialGateways}
    />
  );
}
