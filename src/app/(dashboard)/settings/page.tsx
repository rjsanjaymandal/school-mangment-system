import { createClient } from "@/lib/supabase/server";
import SettingsDashboardClient from "@/components/settings/SettingsDashboardClient";
import { getSettings } from "@/app/actions/settings";

export default async function SettingsPage() {
  const supabase = await createClient();

  // Fetch settings using the server action to get the mapped object
  const { data: schoolSettings } = await getSettings();

  // Fetch other relevant data for settings tabs
  const [gatewaysResult, academicYearsResult] = await Promise.all([
    supabase.from("payment_gateways").select("*").order("name", { ascending: true }),
    supabase.from("academic_years").select("*").order("start_date", { ascending: false })
  ]);

  const initialSettings = schoolSettings || {
    school_name: "Edu Maysan ERP",
    contact_email: "admin@edumaysan.com",
    currency: "INR",
    timezone: "IST"
  };

  const initialGateways = gatewaysResult.data || [];
  const academicYears = academicYearsResult.data || [];

  return (
    <SettingsDashboardClient
      initialSettings={initialSettings}
      initialGateways={initialGateways}
      academicYears={academicYears}
    />
  );
}

