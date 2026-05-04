import { SkeletonLoader } from "@/components/shared/SkeletonLoader";

export default function Loading() {
  return (
    <div className="page-container page-fade-in">
      <div className="flex items-start gap-x-5 mb-10">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-72 bg-slate-50 dark:bg-slate-900 rounded-lg" />
        </div>
      </div>
      <SkeletonLoader count={5} />
    </div>
  );
}
