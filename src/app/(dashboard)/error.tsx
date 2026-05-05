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
    <div className="p-6">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-16 w-16 rounded-md bg-red-50 border border-red-100 flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-slate-500 max-w-md mb-4">
          An unexpected error occurred. Please try again.
        </p>

        {process.env.NODE_ENV === "development" && error?.message && (
          <div className="mt-4 mb-6 max-w-lg w-full">
            <div className="p-4 rounded-md bg-slate-50 border border-slate-200 text-left">
              <p className="text-xs font-medium text-red-500 mb-2">Error Details</p>
              <code className="text-xs text-slate-600 break-all font-mono">
                {error.message}
              </code>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:opacity-90"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-md text-sm font-medium hover:bg-slate-50"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}