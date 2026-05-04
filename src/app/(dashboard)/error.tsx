"use client";

import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-container page-fade-in">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-20 w-20 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 flex items-center justify-center mb-8 shadow-lg">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-2">
          An unexpected error occurred while loading this page. You can try again or navigate back to the dashboard.
        </p>

        {process.env.NODE_ENV === "development" && error?.message && (
          <div className="mt-4 mb-6 max-w-lg w-full">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-2">
                Error Details
              </p>
              <code className="text-xs text-slate-600 dark:text-slate-400 break-all font-mono">
                {error.message}
              </code>
              {error.digest && (
                <p className="text-[10px] text-slate-400 mt-2 font-mono">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-x-4 mt-6">
          <button
            onClick={reset}
            className="flex items-center gap-x-2 px-6 h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs tracking-wide transition-all hover:opacity-90 active:scale-95 shadow-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-x-2 px-6 h-11 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs tracking-wide transition-all hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}