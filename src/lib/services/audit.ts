import { createClient } from "@/lib/supabase/client";
import { auditLogSchema } from "../validations";

/**
 * Audit Service
 * Provides immutable institutional logging for compliance and security auditing.
 */
export const AuditService = {
  async logAction(log: {
    actor_id?: string;
    action: string;
    entity_type: string;
    entity_id: string;
    old_data?: any;
    new_data?: any;
  }) {
    const supabase = createClient();
    
    // Validate log data
    const validated = auditLogSchema.parse(log);

    const { error } = await supabase
      .from("audit_logs")
      .insert([validated]);

    if (error) {
        console.error("Critical: Failed to record audit log", error);
        // In a production scenario, we might want to alert a secondary security system
    }
  },

  async getAuditEntries(entityType?: string, entityId?: string) {
    const supabase = createClient();
    let query = supabase
      .from("audit_logs")
      .select(`
        *,
        actor:profiles!actor_id(first_name, last_name, role)
      `)
      .order("created_at", { ascending: false });

    if (entityType) query = query.eq("entity_type", entityType);
    if (entityId) query = query.eq("entity_id", entityId);

    const { data, error } = await query.limit(50);
    if (error) throw error;
    return data;
  }
};
