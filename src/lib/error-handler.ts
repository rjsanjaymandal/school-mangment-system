import { PostgrestError } from "@supabase/supabase-js";
import { z } from "zod";

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = "INTERNAL_ERROR",
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Service Error Handler
 * Standardizes errors across all services for consistent UI feedback and logging.
 */
export const handleServiceError = (error: any): never => {
  // Handle Supabase/Postgrest Errors
  if (isPostgrestError(error)) {
    console.error(`[DB_ERROR] ${error.code}: ${error.message}`, error.details);
    throw new AppError(
      error.message,
      `DB_${error.code}`,
      getHttpStatus(error.code),
      error.details
    );
  }

  // Handle Zod Validation Errors
  if (error instanceof z.ZodError) {
    console.warn(`[VALIDATION_ERROR]`, error.issues);
    throw new AppError(
      "Data validation failed. Please check your input.",
      "VALIDATION_ERROR",
      400,
      error.issues
    );
  }

  // Handle existing AppErrors
  if (error instanceof AppError) {
    throw error;
  }

  // Generic Fallback
  console.error(`[UNEXPECTED_ERROR]`, error);
  throw new AppError(
    error?.message || "An unexpected error occurred.",
    "INTERNAL_ERROR",
    500
  );
};

function isPostgrestError(error: any): error is PostgrestError {
  return error && typeof error.code === "string" && typeof error.message === "string";
}

function getHttpStatus(supabaseCode: string): number {
  const map: Record<string, number> = {
    "PGRST116": 404, // Not found
    "23505": 409,    // Unique violation
    "23503": 400,    // Foreign key violation
    "42703": 500,    // Undefined column
  };
  return map[supabaseCode] || 500;
}
