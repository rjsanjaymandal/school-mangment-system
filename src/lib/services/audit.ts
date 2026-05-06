import { auditLogSchema } from "../validations";
import { handleServiceError } from "../error-handler";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Audit Service
 * Provides immutable institutional logging for compliance and security auditing.
 */
export const AuditService = {
  async logAction(supabase: SupabaseClient, log: {
    actor_id?: string;
    action: string;
    entity_type: string;
    entity_id: string;
    old_data?: any;
    new_data?: any;
  }) {
    
    // Validate log data
    const validated = auditLogSchema.parse(log);

    const { error } = await supabase
      .from("audit_logs")
      .insert([validated]);

    if (error) {
        console.error("Critical: Failed to record audit log", error);
        // We log it but don't strictly throw as it's a side-effect log
    }
  },

  getAuditEntries: async (supabase: SupabaseClient, entityType?: string, entityId?: string) => {
    try {
      let query = supabase
        .from("audit_logs")
        .select(`
          *,
          actor:profiles!actor_id(full_name, role)
        `)
        .order("created_at", { ascending: false });

      if (entityType) query = query.eq("entity_type", entityType);
      if (entityId) query = query.eq("entity_id", entityId);

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  }
};
