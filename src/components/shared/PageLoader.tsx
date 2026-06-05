export function PageLoader() {
  return (
    <div className="p-6 space-y-6">
      <div className="animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-32"></div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
        ))}
      </div>
      <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
    </div>
  );
}