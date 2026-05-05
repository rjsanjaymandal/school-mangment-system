"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filter?: Record<string, any>;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

// Generic paginated query hook
export function usePaginatedQuery<T>(
  table: string,
  params: PaginationParams,
  options?: {
    select?: string;
    enabled?: boolean;
    staleTime?: number;
  }
) {
  const { page, pageSize, search, sortBy, sortOrder, filter } = params;
  const { enabled = true, staleTime = 30000, select } = options || {};
  const supabase = createClient();

  return useQuery({
    queryKey: [table, params],
    queryFn: async (): Promise<PaginatedResponse<T>> => {
      // Build base query
      let query = supabase
        .from(table)
        .select(select || "*", { count: "exact" });

      // Apply filters
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply search
      if (search) {
        const searchFields = getSearchFields(table);
        if (searchFields.length > 0) {
          query = query.or(searchFields.map(f => `${f}.ilike.%${search}%`).join(","));
        }
      }

      // Apply sorting
      if (sortBy) {
        query = query.order(sortBy, { ascending: sortOrder === "asc" });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      return {
        data: (data as T[]) || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
        hasMore: from + pageSize < (count || 0),
      };
    },
    enabled,
    staleTime,
  });
}

// Get search fields for different tables
function getSearchFields(table: string): string[] {
  const fields: Record<string, string[]> = {
    students: ["profile.full_name", "admission_number", "roll_number"],
    staff: ["profile.full_name", "employee_id", "profile.email"],
    classes: ["name", "section"],
    subjects: ["name", "code"],
    payments: [],
    attendance: [],
    fee_structures: ["name"],
    profiles: ["full_name", "email", "phone"],
  };
  return fields[table] || [];
}

// Pre-built pagination hooks
export function useStudentsPagination(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  classId?: string
) {
  return usePaginatedQuery<any>("students", {
    page,
    pageSize,
    search,
    filter: classId ? { class_id: classId } : undefined,
  }, {
    select: "*, profile:profiles(id, full_name, first_name, last_name, email, phone, avatar_url), class:classes(id, name)",
  });
}

export function useStaffPagination(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  department?: string
) {
  return usePaginatedQuery<any>("staff", {
    page,
    pageSize,
    search,
    filter: department ? { department } : undefined,
  }, {
    select: "*, profile:profiles(id, full_name, first_name, last_name, email, phone, avatar_url), designation:designations(name), department:departments(name)",
  });
}

export function useClassesPagination(page: number = 1, pageSize: number = 20, search?: string) {
  return usePaginatedQuery<any>("classes", {
    page,
    pageSize,
    search,
  }, {
    select: "*, teacher:profiles(full_name)",
  });
}

export function useSubjectsPagination(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  classId?: string
) {
  return usePaginatedQuery<any>("subjects", {
    page,
    pageSize,
    search,
    filter: classId ? { class_id: classId } : undefined,
  }, {
    select: "*, class:classes(name), teacher:profiles(full_name)",
  });
}

export function usePaymentsPagination(
  page: number = 1,
  pageSize: number = 20,
  search?: string,
  status?: string,
  dateFrom?: string,
  dateTo?: string
) {
  return usePaginatedQuery<any>("payments", {
    page,
    pageSize,
    search,
    filter: {
      ...(status ? { status } : {}),
      ...(dateFrom ? { payment_date: { gte: dateFrom } } : {}),
      ...(dateTo ? { payment_date: { lte: dateTo } } : {}),
    },
  }, {
    select: "*, student:students(id, admission_number, profile:profiles(full_name))",
  });
}

// Pagination controls hook
export function usePaginationControls(totalPages: number, currentPage: number) {
  const queryClient = useQueryClient();

  const goToPage = (page: number) => {
    // This would typically use router or setState
    // For use with React Query, you'd update the query key
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      return currentPage + 1;
    }
    return currentPage;
  };

  const prevPage = () => {
    if (currentPage > 1) {
      return currentPage - 1;
    }
    return 1;
  };

  const canGoNext = currentPage < totalPages;
  const canGoPrev = currentPage > 1;

  return {
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
    currentPage,
    totalPages,
  };
}