"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useCallback, useEffect } from "react";

function getCacheKey(table: string, id?: string) {
  return id ? [`${table}`, id] : [table];
}

export function useOptimizedQuery<T>(
  table: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    select?: (data: any) => T;
  }
) {
  const { enabled = true, staleTime = 30 * 1000, select } = options || {};

  return useQuery({
    queryKey: getCacheKey(table),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from(table).select("*").limit(100);
      if (error) throw error;
      return data;
    },
    enabled,
    staleTime,
    select,
    placeholderData: (previousData) => previousData,
  });
}

export function useOptimizedEntity<T>(
  table: string,
  id: string | null,
  selectFn?: (data: any) => T
) {
  return useQuery({
    queryKey: getCacheKey(table, id || undefined),
    queryFn: async () => {
      if (!id) return null;
      const supabase = createClient();
      const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute for single entities
    select: selectFn,
  });
}

export function useOptimizedMutation<T>(
  table: string,
  action: "insert" | "update" | "delete"
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const supabase = createClient();
      let result;

      switch (action) {
        case "insert":
          result = await supabase.from(table).insert(payload).select().single();
          break;
        case "update":
          result = await supabase.from(table).update(payload).eq("id", payload.id).select().single();
          break;
        case "delete":
          result = await supabase.from(table).delete().eq("id", payload.id);
          break;
      }

      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    },
  });
}

// Predefined hooks for common queries
export function useStudents(staleTime = 30000) {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("students")
        .select("*, profile:profiles(*), class:classes(name)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
    staleTime,
    enabled: true,
  });
}

export function useClasses(staleTime = 60000) {
  return useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("classes").select("*").order("name");
      if (error) throw error;
      return data;
    },
    staleTime,
    enabled: true,
  });
}

export function useAttendance(date?: string, staleTime = 10000) {
  return useQuery({
    queryKey: ["attendance", date],
    queryFn: async () => {
      const supabase = createClient();
      const targetDate = date || new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("attendance")
        .select("*, student:students(id, roll_number, profile:profiles(full_name))")
        .eq("date", targetDate);
      if (error) throw error;
      return data;
    },
    staleTime,
    enabled: true,
    refetchOnWindowFocus: false,
  });
}

export function useFees(staleTime = 30000) {
  return useQuery({
    queryKey: ["fees"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("fee_structures")
        .select("*, class:classes(name)")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime,
    enabled: true,
  });
}

export function usePayments(staleTime = 15000) {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("payments")
        .select("*, student:students(id, admission_number, profile:profiles(full_name))")
        .order("payment_date", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    staleTime,
    enabled: true,
  });
}

// Optimized hook for real-time subscriptions
export function useRealtimeSubscription(
  table: string,
  callback: (payload: any) => void
) {
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on("postgres_changes", { event: "*", schema: "public", table }, callback)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, callback]);
}