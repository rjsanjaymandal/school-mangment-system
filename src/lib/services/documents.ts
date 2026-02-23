import { createClient } from "@/lib/supabase/client";
import { documentArchiveSchema } from "../validations";
import { handleServiceError } from "../error-handler";

/**
 * Document Service
 * Manages institutional archives, legal compliance, and encrypted document metadata.
 */
export const DocumentService = {
  async uploadDocumentMetadata(doc: {
    title: string;
    category: 'Legal' | 'Academic' | 'HR' | 'Financial';
    file_path: string;
    uploaded_by?: string;
    expiry_date?: string;
    is_encrypted?: boolean;
  }) {
    try {
      const supabase = createClient();
      
      // Validate metadata
      const validated = documentArchiveSchema.parse(doc);

      const { data, error } = await supabase
        .from("document_archives")
        .insert([validated])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getComplianceArchives(category?: string) {
    try {
      const supabase = createClient();
      let query = supabase
        .from("document_archives")
        .select(`
          *,
          author:profiles!uploaded_by(first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (category) query = query.eq("category", category);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async checkExpiringDocuments() {
    try {
      const supabase = createClient();
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from("document_archives")
        .select("*")
        .gte("expiry_date", today)
        .lte("expiry_date", thirtyDaysFromNow);

      if (error) throw error;
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  }
};
