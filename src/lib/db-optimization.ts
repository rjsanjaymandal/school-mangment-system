// Database query optimization utilities
// These are helper functions to ensure optimal Supabase queries

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface QueryOptions {
  select?: string;
  filter?: Record<string, any>;
  sort?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

// Recommended indexes for common queries
export const RECOMMENDED_INDEXES = [
  // Students
  { table: "students", columns: ["class_id", "admission_number"], name: "idx_students_class_admission" },
  { table: "students", columns: ["status", "created_at"], name: "idx_students_status_created" },
  
  // Attendance  
  { table: "attendance", columns: ["date", "student_id"], name: "idx_attendance_date_student" },
  { table: "attendance", columns: ["student_id", "status"], name: "idx_attendance_student_status" },
  
  // Payments
  { table: "payments", columns: ["student_id", "payment_date"], name: "idx_payments_student_date" },
  { table: "payments", columns: ["status", "payment_date"], name: "idx_payments_status_date" },
  
  // Marks
  { table: "marks", columns: ["exam_id", "student_id"], name: "idx_marks_exam_student" },
  { table: "marks", columns: ["student_id", "created_at"], name: "idx_marks_student_created" },
  
  // Profiles
  { table: "profiles", columns: ["role", "email"], name: "idx_profiles_role_email" },
  
  // Fee Structures
  { table: "fee_structures", columns: ["class_id", "due_date"], name: "idx_fee_structure_class_due" },
];

// Optimized query builder
export async function optimizedQuery<T>(
  table: string,
  options: QueryOptions = {}
): Promise<T[]> {
  let query = supabase.from(table).select(options.select || "*");

  // Apply filters
  if (options.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
  }

  // Apply sorting
  if (options.sort) {
    query = query.order(options.sort.column, { 
      ascending: options.sort.ascending ?? true 
    });
  }

  // Apply pagination
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  if (options.offset !== undefined) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error querying ${table}:`, error);
    throw error;
  }

  return (data as T[]) || [];
}

// Optimized count query
export async function optimizedCount(
  table: string,
  filters: Record<string, any> = {}
): Promise<number> {
  let query = supabase.from(table).select("*", { count: "exact", head: true });

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      query = query.in(key, value);
    } else if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });

  const { count, error } = await query;

  if (error) {
    console.error(`Error counting ${table}:`, error);
    throw error;
  }

  return count || 0;
}

// Batch insert with conflict handling
export async function batchInsert(
  table: string,
  records: Record<string, any>[],
  onConflict: string = "id"
): Promise<number> {
  const { data, error } = await supabase
    .from(table)
    .upsert(records, { onConflict })
    .select();

  if (error) {
    console.error(`Error batch inserting to ${table}:`, error);
    throw error;
  }

  return data?.length || 0;
}

// Soft delete (mark as deleted)
export async function softDelete(
  table: string,
  ids: string[]
): Promise<void> {
  const { error } = await supabase
    .from(table)
    .update({ deleted_at: new Date().toISOString() })
    .in("id", ids);

  if (error) {
    console.error(`Error soft deleting from ${table}:`, error);
    throw error;
  }
}

// Pagination helper
export function getPaginationParams(page: number, pageSize: number) {
  return {
    offset: (page - 1) * pageSize,
    limit: pageSize,
  };
}

// Total pages calculator
export function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}