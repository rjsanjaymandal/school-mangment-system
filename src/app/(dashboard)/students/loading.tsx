export default function Loading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-md bg-slate-200 animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-32 bg-slate-200 rounded" />
          <div className="h-4 w-48 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-100 rounded-3xl">
        <p className="text-sm font-bold text-slate-400 animate-pulse">Synchronizing Directory...</p>
      </div>
    </div>
  );
}