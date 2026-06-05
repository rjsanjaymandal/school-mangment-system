"use client";

import { Suspense as ReactSuspense } from "react";
import { Loader2, FolderOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

interface LoadingComponentProps {
  message?: string;
  variant?: "spinner" | "skeleton" | "card";
}

// Custom loading fallback
export function LoadingFallback({ 
  message = "Loading...", 
  variant = "spinner" 
}: LoadingComponentProps) {
  if (variant === "spinner") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <Card className="p-4">
        <CardContent className="flex items-center gap-4">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
        </CardContent>
      </Card>
    );
  }

  return <LoadingSkeleton />;
}

// Skeleton loading components
export function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 bg-slate-200 rounded-full animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
        </div>
      </div>
      <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
      </div>
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ columns = 4, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-200 rounded flex-1 animate-pulse" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="h-8 bg-slate-100 dark:bg-slate-800 rounded flex-1 animate-pulse" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Dashboard stats skeleton
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-6 w-12 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse" />
          </div>
        </Card>
      ))}
    </div>
  );
}

// Form skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
      ))}
      <div className="h-10 w-32 bg-slate-200 rounded animate-pulse mt-6" />
    </div>
  );
}

// Empty state component
export function EmptyState({ 
  title = "No data found", 
  description = "There's nothing to display here yet.",
  icon: Icon = FolderOpen,
  action
}: { 
  title?: string;
  description?: string;
  icon?: any;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Error state component
export function ErrorState({ 
  title = "Something went wrong",
  message = "An error occurred while loading this data.",
  onRetry
}: { 
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <Loader2 className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// Lazy loading wrapper
export function LazyLoad({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <ReactSuspense fallback={fallback || <LoadingSkeleton />}>
      {children}
    </ReactSuspense>
  );
}

// Suspense wrapper with error boundary
export function DataSuspense({ 
  children, 
  loadingMessage 
}: { 
  children: React.ReactNode;
  loadingMessage?: string;
}) {
  return (
    <ReactSuspense fallback={<LoadingFallback message={loadingMessage} variant="card" />}>
      {children}
    </ReactSuspense>
  );
}