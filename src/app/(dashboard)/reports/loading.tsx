import { SkeletonLoader } from "@/components/shared/SkeletonLoader";

export default function Loading() {
  return (
    <div className="page-container page-fade-in">
      <div className="flex items-start gap-x-5 mb-10">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="space-y-2">
          <div className="h-8 w-56 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-96 bg-slate-50 dark:bg-slate-900 rounded-lg" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-8 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/60 dark:via-slate-800/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" style={{ animationDelay: `${i * 0.15}s` }} />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="h-[500px] rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/40 dark:via-slate-800/20 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
      </div>
    </div>
  );
}
