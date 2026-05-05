import { Suspense } from "react";
import { PerformancePredictor } from "@/components/ai/PerformancePredictor";

function AIPlaceholder() {
  return (
    <div className="h-48 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-slate-500">Loading AI insights...</p>
      </div>
    </div>
  );
}

export function AIWrapper() {
  return (
    <Suspense fallback={<AIPlaceholder />}>
      <PerformancePredictor />
    </Suspense>
  );
}