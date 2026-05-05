export const revalidate = 15;

import { BookOpen } from "lucide-react";
import { DayBook } from "@/components/finance/DayBook";

export default function DayBookPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-50 rounded-md border-l-4 border-emerald-500">
          <BookOpen className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Day Book & Ledger</h1>
          <p className="text-sm text-slate-500">Real-time transaction ledger with cash/bank tracking</p>
        </div>
      </div>

      <DayBook />
    </div>
  );
}