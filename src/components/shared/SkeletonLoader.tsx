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
            "h-24 w-full rounded-2xl bg-white/40 backdrop-blur-md border border-white/20 relative overflow-hidden",
            className,
          )}
        >
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          <div className="p-6 flex gap-x-4">
            <div className="h-12 w-12 rounded-xl bg-slate-100/50 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-slate-100/50 rounded-lg" />
              <div className="h-3 w-1/2 bg-slate-100/30 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-1">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-slate-100 rounded-lg" />
        <div className="h-10 w-64 bg-slate-100 rounded-xl" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-3xl bg-white border border-slate-100 shadow-sm"
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 h-[400px] rounded-3xl bg-white border border-slate-100" />
        <div className="lg:col-span-2 h-[400px] rounded-3xl bg-slate-900 overflow-hidden" />
      </div>
    </div>
  );
}
