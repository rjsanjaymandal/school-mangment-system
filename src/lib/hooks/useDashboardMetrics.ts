"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getDashboardMetrics } from "@/app/actions/dashboard-metrics";
import { createClient } from "@/lib/supabase/client";

export function useDashboardMetrics() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const query = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: () => getDashboardMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // Subscribe to key tables to trigger refreshes on changes
    // This makes the dashboard "Live"
    const channel = supabase
      .channel('dashboard-live-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attendance' },
        () => queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  return query;
}
