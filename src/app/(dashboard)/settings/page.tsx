export const revalidate = 30;

import { createClient } from "@/lib/supabase/server";
import SettingsDashboardClient from "@/components/settings/SettingsDashboardClient";
import { getSettings } from "@/app/actions/settings";
import { Settings as SettingsIcon } from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: schoolSettings } = await getSettings();

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
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-50 rounded-md border-l-4 border-emerald-500">
          <SettingsIcon className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure system preferences</p>
        </div>
      </div>

      <ERPCard
        title="System Settings"
        description="School configuration and preferences"
        icon={<SettingsIcon className="h-5 w-5" />}
        color="emerald"
      >
        <SettingsDashboardClient
          initialSettings={initialSettings}
          initialGateways={initialGateways}
          academicYears={academicYears}
        />
      </ERPCard>
    </div>
  );
}

