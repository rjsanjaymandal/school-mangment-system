export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-32"></div>
      </div>
      <div className="h-96 bg-slate-100 dark:bg-slate-800 rounded-md"></div>
    </div>
  );
}