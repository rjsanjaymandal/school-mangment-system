"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { GlobalErrorHandler } from "@/components/error/GlobalErrorHandler";

const defaultOptions = {
  queries: {
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  mutations: {
    retry: 1,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
};

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions,
      })
  );

  return (
    <ErrorBoundary>
      <GlobalErrorHandler>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </GlobalErrorHandler>
    </ErrorBoundary>
  );
}