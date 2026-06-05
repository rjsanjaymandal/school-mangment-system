"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  Settings, IndianRupee, Clock, Percent, Save, 
  RotateCcw, Calculator
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface SalarySetting {
  id: string;
  key: string;
  value: number;
  description: string;
  is_active: boolean;
}

export function SalarySettingsClient() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["salary-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("salary_settings")
        .select("*")
        .order("key");
      return data || [];
    },
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: number }) => {
      const { error } = await supabase
        .from("salary_settings")
        .update({ value, updated_at: new Date().toISOString() })
        .eq("key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-settings"] });
      setEditingKey(null);
    },
  });

  const startEdit = (setting: SalarySetting) => {
    setEditingKey(setting.key);
    setEditValue(setting.value.toString());
  };

  const saveEdit = (key: string) => {
    updateSetting.mutate({ key, value: parseFloat(editValue) });
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue("");
  };

  const categoryGroups = [
    {
      title: "Deductions",
      icon: IndianRupee,
      color: "text-red-500",
      keys: ["per_day_salary", "per_day_leave_deduction", "per_day_absence_deduction", "late_coming_deduction"],
    },
    {
      title: "Statutory",
      icon: Percent,
      color: "text-amber-500",
      keys: ["provident_fund_rate", "professional_tax"],
    },
    {
      title: "Working Days",
      icon: Clock,
      color: "text-blue-500",
      keys: ["working_days_per_month"],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30">
          <Settings className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Salary Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure payroll calculation rules</p>
        </div>
      </div>

      {categoryGroups.map((group) => (
        <div key={group.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <group.icon className={`h-4 w-4 ${group.color}`} />
              {group.title}
            </h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {settings
                ?.filter((s) => group.keys.includes(s.key))
                .map((setting) => (
                  <div key={setting.key} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white capitalize">
                          {setting.key.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{setting.description}</p>
                      </div>
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                        setting.is_active ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450" : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-400"
                      )}>
                        {setting.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {editingKey === setting.key ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-24 rounded-xl border-slate-200 dark:border-slate-800"
                        />
                        <button
                          onClick={() => saveEdit(setting.key)}
                          disabled={updateSetting.isPending}
                          className="h-9 w-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all disabled:opacity-50"
                        >
                          <Save className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={cancelEdit} className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center">
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                          {setting.key.includes("rate") || setting.key.includes("percentage")
                            ? `${setting.value}%`
                            : `₹${setting.value.toLocaleString()}`}
                        </p>
                        <button
                          onClick={() => startEdit(setting)}
                          className="h-8 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-black text-[9px] uppercase tracking-widest px-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden border-l-4 border-l-blue-500">
        <div className="p-5">
          <div className="flex items-start gap-3">
            <Calculator className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">How calculations work</p>
              <ul className="text-sm text-slate-600 dark:text-slate-400 mt-2 space-y-1">
                <li>• <strong>Per Day Salary</strong> = Base Salary / Working Days</li>
                <li>• <strong>Absence Deduction</strong> = Days Absent x Per Day Salary</li>
                <li>• <strong>Late Coming</strong> = Number of incidents &times; Late Deduction</li>
                <li>• <strong>Net Pay</strong> = Base Salary + Bonus - Deductions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}