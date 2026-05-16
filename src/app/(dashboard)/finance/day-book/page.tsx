export const revalidate = 15;

import { BookOpen } from "lucide-react";
import { DayBook } from "@/components/finance/DayBook";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

export default function DayBookPage() {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      {/* Unified Page Header */}
      <UnifiedPageHeader 
        title="Day Book & Ledger"
        subtitle="Real-time chronological verification of institutional liquidity"
        icon={BookOpen}
        color="purple"
      />

      <DayBook />
    </div>
  );
}