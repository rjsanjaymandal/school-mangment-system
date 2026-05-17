export default function Loading() {
  return (
    <div className="p-6 space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex items-center gap-6 mb-8">
        <div className="flex flex-col">
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse mb-3" />
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
        <div className="h-12 w-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-56 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] animate-pulse" />
        ))}
      </div>
    </div>
  );
}