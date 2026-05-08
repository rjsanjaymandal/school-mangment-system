"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

  // Fetch salary settings
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

  // Update setting mutation
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-md border-l-4 border-emerald-500">
            <Settings className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Salary Settings</h1>
            <p className="text-sm text-slate-500">Configure payroll calculation rules</p>
          </div>
        </div>
      </div>

      {/* Settings Groups */}
      {categoryGroups.map((group) => (
        <Card key={group.title} className="shadow-sm">
          <CardHeader className="pb-4 border-b bg-slate-50/50">
            <CardTitle className="text-base flex items-center gap-2">
              <group.icon className={`h-4 w-4 ${group.color}`} />
              {group.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {settings
                ?.filter((s) => group.keys.includes(s.key))
                .map((setting) => (
                  <div
                    key={setting.key}
                    className="p-4 border rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-slate-900 capitalize">
                          {setting.key.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-slate-500">{setting.description}</p>
                      </div>
                      <Badge variant={setting.is_active ? "default" : "secondary"}>
                        {setting.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    {editingKey === setting.key ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-24"
                        />
                        <Button
                          size="sm"
                          onClick={() => saveEdit(setting.key)}
                          disabled={updateSetting.isPending}
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-2xl font-bold text-slate-900">
                          {setting.key.includes("rate") || setting.key.includes("percentage")
                            ? `${setting.value}%`
                            : `₹${setting.value.toLocaleString()}`}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(setting)}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Info Card */}
      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Calculator className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900">How calculations work</p>
              <ul className="text-sm text-slate-600 mt-2 space-y-1">
                <li>• <strong>Per Day Salary</strong> = Base Salary ÷ Working Days</li>
                <li>• <strong>Absence Deduction</strong> = Days Absent × Per Day Salary</li>
                <li>• <strong>Late Coming</strong> = Number of incidents × Late Deduction</li>
                <li>• <strong>Net Pay</strong> = Base Salary + Bonus - Deductions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}