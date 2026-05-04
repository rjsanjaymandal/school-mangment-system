export default function Loading() {
  return (
    <div className="page-container page-fade-in">
      {/* Stats row skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/60 dark:via-slate-800/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" style={{ animationDelay: `${i * 0.15}s` }} />
          </div>
        ))}
      </div>

      {/* Chart area skeleton */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="h-[400px] rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/40 dark:via-slate-800/20 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
        </div>
        <div className="h-[400px] rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/40 dark:via-slate-800/20 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    </div>
  );
}
