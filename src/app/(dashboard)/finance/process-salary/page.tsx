export const revalidate = 30;

import { Calculator } from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";
import { ProcessSalaryClient } from "./ProcessSalaryClient";

import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

export default function ProcessSalaryPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 mt-6">
      <UnifiedPageHeader 
        title="Process Salary" 
        subtitle="Automated monthly salary generation with attendance-based deductions" 
        icon={Calculator} 
        color="emerald" 
      />

      <ProcessSalaryClient />
    </div>
  );
}