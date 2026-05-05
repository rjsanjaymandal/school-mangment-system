import { createClient } from "@/lib/supabase/server";
import SettingsDashboardClient from "@/components/settings/SettingsDashboardClient";
import { getSettings } from "@/app/actions/settings";
import { Settings as SettingsIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-md">
            <SettingsIcon className="h-6 w-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-sm text-slate-500">Configure system preferences</p>
          </div>
        </div>
      </div>

      <ERPCard
        title="System Settings"
        description="School configuration and preferences"
        icon={<SettingsIcon className="h-5 w-5" />}
        color="slate"
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

