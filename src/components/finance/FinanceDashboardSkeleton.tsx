"use client";

export function FinanceDashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-slate-200 rounded-md" />
          <div>
            <div className="h-5 w-40 bg-slate-200 rounded" />
            <div className="h-4 w-24 bg-slate-100 rounded mt-2" />
          </div>
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-md" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-md p-4 h-28">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-slate-100 rounded" />
                <div className="h-6 w-20 bg-slate-200 rounded" />
              </div>
              <div className="h-10 w-10 bg-slate-100 rounded-md" />
            </div>
            <div className="h-3 w-16 bg-slate-100 rounded mt-3" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white border border-slate-200 rounded-md p-4 h-64">
          <div className="h-4 w-32 bg-slate-100 rounded mb-4" />
          <div className="flex items-end gap-2 h-40">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex-1 bg-slate-100 rounded-t" style={{ height: `${Math.random() * 80 + 20}%` }} />
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4 h-64">
          <div className="h-4 w-32 bg-slate-100 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-8 w-8 bg-slate-100 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-full bg-slate-100 rounded" />
                  <div className="h-2 w-16 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-md h-64">
          <div className="h-10 border-b border-slate-100 p-3">
            <div className="h-4 w-24 bg-slate-100 rounded" />
          </div>
          <div className="p-3 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-slate-50 rounded" />
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md h-64">
          <div className="h-10 border-b border-slate-100 p-3">
            <div className="h-4 w-32 bg-slate-100 rounded" />
          </div>
          <div className="p-3 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-slate-50 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}