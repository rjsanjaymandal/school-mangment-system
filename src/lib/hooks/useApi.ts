import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// Generic fetch helper
async function fetchFromSupabase<T>(
  table: string,
  options?: {
    select?: string;
    eq?: [string, unknown];
    in?: [string, unknown[]];
    order?: [string, { ascending: boolean }];
    limit?: number;
    single?: boolean;
  }
) {
  let query = supabase.from(table).select(options?.select || "*");

  if (options?.eq) {
    query = query.eq(options.eq[0], options.eq[1]);
  }
  if (options?.in) {
    query = query.in(options.in[0], options.in[1]);
  }
  if (options?.order) {
    query = query.order(options.order[0], options.order[1]);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.single) {
    const { data, error } = await query.single();
    if (error) throw error;
    return data as T;
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as T[]) || [];
}

// Hooks for Students
export function useStudents(classId?: string) {
  return useQuery({
    queryKey: ["students", classId],
    queryFn: async () => {
      let query = supabase
        .from("students")
        .select("*, profile:profiles(*), class:classes(*)")
        .order("created_at", { ascending: false });

      if (classId) {
        query = query.eq("class_id", classId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useStudent(studentId: string) {
  return useQuery({
    queryKey: ["student", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*, profile:profiles(*), class:classes(*)")
        .eq("id", studentId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, unknown> }) => {
      const { data, error } = await supabase
        .from("students")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
  });
}

// Hooks for Classes
export function useClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*, teacher:profiles(*)")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });
}

export function useClass(classId: string) {
  return useQuery({
    queryKey: ["class", classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*, teacher:profiles(*), subjects:subjects(*)")
        .eq("id", classId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });
}

// Hooks for Teachers
export function useTeachers() {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("*, profile:profiles(*)")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

// Hooks for Fees
export function useFees(classId?: string) {
  return useQuery({
    queryKey: ["fees", classId],
    queryFn: async () => {
      let query = supabase
        .from("fees")
        .select("*, class:classes(*)")
        .order("created_at", { ascending: false });

      if (classId) {
        query = query.eq("class_id", classId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useFeePayments(feeId: string) {
  return useQuery({
    queryKey: ["fee-payments", feeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, student:students(*, profile:profiles(*))")
        .eq("fee_id", feeId)
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!feeId,
  });
}

// Hooks for Attendance
export function useAttendance(classId: string, date: string) {
  return useQuery({
    queryKey: ["attendance", classId, date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*, student:students(*, profile:profiles(*))")
        .eq("class_id", classId)
        .eq("date", date);
      if (error) throw error;
      return data || [];
    },
    enabled: !!classId && !!date,
  });
}

// Hooks for User Roles
export function useUserRole(userId: string) {
  return useQuery({
    queryKey: ["user-role", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data?.role || "student";
    },
    enabled: !!userId,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data, error } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-role"] });
    },
  });
}