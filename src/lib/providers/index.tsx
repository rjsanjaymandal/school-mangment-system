"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        {children}
      </QueryProvider>
    </ErrorBoundary>
  );
}