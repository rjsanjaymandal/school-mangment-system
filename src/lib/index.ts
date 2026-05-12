// ==================== SUPABASE ====================
export { createClient } from "./supabase/client";
export { createClient as createServerClient } from "./supabase/server";

// ==================== AUTH ====================
export { getAuthContext } from "./auth-context";
export { getSessionRole } from "./auth-utils";

// ==================== UTILS ====================
export { cn } from "./utils";

// ==================== SERVICES ====================
export { InstitutionalService } from "./services/institutional";
export { FeesService } from "./services/fees";
export { UserService } from "./services/user";
export { AttendanceService } from "./services/attendance";
export { ReportsService } from "./services/reports";
export { LibraryService } from "./services/library";
export { TransportService } from "./services/transport";
export { HealthService } from "./services/health";