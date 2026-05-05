"use client";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useCallback } from "react";

// Types for optimistic mutations
interface OptimisticConfig<T> {
  queryKey: string[];
  getPreviousData: () => T[] | undefined;
  getOptimisticData: (newItem: any) => T[];
  onError?: (error: Error, newItem: any, context: any) => void;
}

// Generic optimistic mutation hook
export function useOptimisticMutation<T extends { id: string }>(
  table: string,
  config: OptimisticConfig<T[]>
) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase
        .from(table)
        .upsert(payload, { onConflict: "id" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newItem) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: config.queryKey });

      // Snapshot previous value
      const previousData = config.getPreviousData();

      // Optimistically update
      queryClient.setQueryData(config.queryKey, () => 
        config.getOptimisticData(newItem)
      );

      return { previousData };
    },
    onError: (err, newItem, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(config.queryKey, context.previousData);
      }
      config.onError?.(err, newItem, context);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: config.queryKey });
    },
  });
}

// Pre-built optimistic hooks for common operations

export function useOptimisticStudentCreate() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (student: any) => {
      const { data, error } = await supabase
        .from("students")
        .insert(student)
        .select("*, profile:profiles(*), class:classes(name)")
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async (newStudent) => {
      await queryClient.cancelQueries({ queryKey: ["students"] });
      const previousStudents = queryClient.getQueryData(["students"]);
      
      const optimisticStudent = {
        ...newStudent,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
        profile: { full_name: newStudent.full_name },
        class: { name: newStudent.class_name || "N/A" },
      };

      queryClient.setQueryData(["students"], (old: any[]) => 
        old ? [optimisticStudent, ...old] : [optimisticStudent]
      );

      return { previousStudents };
    },
    onError: (err, newStudent, context) => {
      if (context?.previousStudents) {
        queryClient.setQueryData(["students"], context.previousStudents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useOptimisticFeePayment() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (payment: any) => {
      const { data, error } = await supabase
        .from("payments")
        .insert(payment)
        .select("*, student:students(id, admission_number, profile:profiles(full_name))")
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async (newPayment) => {
      await queryClient.cancelQueries({ queryKey: ["payments"] });
      const previousPayments = queryClient.getQueryData(["payments"]);
      
      const optimisticPayment = {
        ...newPayment,
        id: `temp-${Date.now()}`,
        payment_date: new Date().toISOString(),
        status: "pending",
        student: newPayment.student_name || {},
      };

      queryClient.setQueryData(["payments"], (old: any[]) => 
        old ? [optimisticPayment, ...old] : [optimisticPayment]
      );

      return { previousPayments };
    },
    onError: (err, newPayment, context) => {
      if (context?.previousPayments) {
        queryClient.setQueryData(["payments"], context.previousPayments);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

export function useOptimisticAttendance() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (records: any[]) => {
      const { data, error } = await supabase
        .from("attendance")
        .upsert(records, { onConflict: "student_id,date" })
        .select();
      if (error) throw error;
      return data;
    },
    onMutate: async (newRecords) => {
      await queryClient.cancelQueries({ queryKey: ["attendance"] });
      const previousAttendance = queryClient.getQueryData(["attendance"]);

      // Optimistically update attendance for the date
      const today = new Date().toISOString().split("T")[0];
      
      queryClient.setQueryData(["attendance", today], (old: any[]) => {
        if (!old) return newRecords;
        const recordMap = new Map(old.map((r: any) => [r.student_id, r]));
        newRecords.forEach(r => recordMap.set(r.student_id, r));
        return Array.from(recordMap.values());
      });

      return { previousAttendance };
    },
    onError: (err, newRecords, context) => {
      if (context?.previousAttendance) {
        queryClient.setQueryData(["attendance"], context.previousAttendance);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

// Batch operations with optimistic updates
export function useBatchOperations<T extends { id: string }>(table: string) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const deleteMultiple = useCallback(async (ids: string[]) => {
    const previousData = queryClient.getQueryData([table]);

    // Optimistically remove items
    queryClient.setQueryData([table], (old: T[] | undefined) => 
      old?.filter(item => !ids.includes(item.id)) || []
    );

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .in("id", ids);

      if (error) throw error;
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData([table], previousData);
      throw error;
    }
  }, [queryClient, table, supabase]);

  const updateMultiple = useCallback(async (updates: { id: string; data: any }[]) => {
    const previousData = queryClient.getQueryData([table]);

    // Optimistically update items
    queryClient.setQueryData([table], (old: T[] | undefined) => 
      old?.map(item => {
        const update = updates.find(u => u.id === item.id);
        return update ? { ...item, ...update.data } : item;
      }) || []
    );

    try {
      for (const update of updates) {
        const { error } = await supabase
          .from(table)
          .update(update.data)
          .eq("id", update.id);

        if (error) throw error;
      }
    } catch (error) {
      queryClient.setQueryData([table], previousData);
      throw error;
    }
  }, [queryClient, table, supabase]);

  return { deleteMultiple, updateMultiple };
}