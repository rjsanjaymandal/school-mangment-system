export const revalidate = 30;

import { Calculator } from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";
import { ProcessSalaryClient } from "./ProcessSalaryClient";

export default function ProcessSalaryPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-50 rounded-md border-l-4 border-emerald-500">
          <Calculator className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Process Salary</h1>
          <p className="text-sm text-slate-500">Automated monthly salary generation with attendance-based deductions</p>
        </div>
      </div>

      <ProcessSalaryClient />
    </div>
  );
}