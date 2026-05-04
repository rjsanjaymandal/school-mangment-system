"use client";

import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

export function SkeletonLoader({ className, count = 1 }: SkeletonLoaderProps) {
  return (
    <div className="space-y-4 w-full animate-in fade-in duration-500">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-24 w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm",
            className,
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/60 dark:via-slate-800/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          <div className="p-6 flex gap-x-4">
            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-lg" />
              <div className="h-3 w-1/2 bg-slate-50 dark:bg-slate-800/50 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="page-container page-fade-in">
      {/* Header skeleton */}
      <div className="flex items-start gap-x-5 mb-10">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="space-y-2">
          <div className="h-8 w-56 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-80 bg-slate-50 dark:bg-slate-900 rounded-lg" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/60 dark:via-slate-800/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" style={{ animationDelay: `${i * 0.15}s` }} />
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 h-[400px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/40 dark:via-slate-800/20 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
        </div>
        <div className="lg:col-span-2 h-[400px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/40 dark:via-slate-800/20 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    </div>
  );
}
