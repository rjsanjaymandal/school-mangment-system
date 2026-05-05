"use client";

import dynamic from "next/dynamic";

function Loader() {
  return (
    <div className="h-64 flex items-center justify-center">
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
}

export const AnalyticsDashboard = dynamic(
  () => import("@/components/analytics/AnalyticsDashboard"),
  { loading: Loader, ssr: false }
);

export const PerformancePredictor = dynamic(
  () => import("@/components/ai/PerformancePredictor"),
  { loading: Loader, ssr: false }
);

export const AdminCharts = dynamic(
  () => import("@/app/(dashboard)/admin/dashboard/AdminCharts"),
  { loading: Loader, ssr: false }
);

export const TransportDashboard = dynamic(
  () => import("@/components/transport/TransportDashboard"),
  { loading: Loader, ssr: false }
);

export const AttendanceDashboard = dynamic(
  () => import("@/components/attendance/AttendanceDashboard"),
  { loading: Loader, ssr: false }
);