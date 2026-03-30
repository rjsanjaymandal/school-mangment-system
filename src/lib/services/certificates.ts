import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleServiceError } from "../error-handler";

export const CertificatesService = {
  async getAllCertificates(filters?: { student_id?: string; type?: string; status?: string }) {
    try {
      const supabase = createClient();
      let query = supabase
        .from("certificates")
        .select(`
          *,
          student:students(id, admission_number, profile:profiles(full_name)),
          issuer:profiles(full_name)
        `)
        .order("issued_date", { ascending: false });

      if (filters?.student_id) query = query.eq("student_id", filters.student_id);
      if (filters?.type) query = query.eq("type", filters.type);
      if (filters?.status) query = query.eq("status", filters.status);

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getCertificateById(id: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("certificates")
        .select(`
          *,
          student:students(id, admission_number, profile:profiles(full_name, phone, email)),
          issuer:profiles(full_name)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async createCertificate(certData: {
    student_id: string;
    type: string;
    issued_by?: string;
    remarks?: string;
  }) {
    try {
      const supabase = createAdminClient();
      
      const referenceNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from("certificates")
        .insert({
          ...certData,
          reference_number: referenceNumber,
          issued_date: new Date().toISOString().split('T')[0],
          status: 'issued'
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async revokeCertificate(id: string, remarks?: string) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("certificates")
        .update({
          status: 'revoked',
          remarks: remarks || 'Certificate revoked'
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getCertificateTypes() {
    return {
      data: [
        { value: 'transfer', label: 'Transfer Certificate (TC)' },
        { value: 'bonafide', label: 'Bonafide Certificate' },
        { value: 'character', label: 'Character Certificate' },
        { value: 'completion', label: 'Course Completion Certificate' },
        { value: 'attendance', label: 'Attendance Certificate' },
        { value: 'grade', label: 'Grade Certificate' },
        { value: 'other', label: 'Other' }
      ],
      error: null
    };
  },

  async getStudentCertificates(studentId: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("student_id", studentId)
        .order("issued_date", { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async verifyCertificate(referenceNumber: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("certificates")
        .select(`
          *,
          student:students(id, admission_number, profile:profiles(full_name)),
          issuer:profiles(full_name)
        `)
        .eq("reference_number", referenceNumber)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async generateCertificateNumber(type: string) {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${type.toUpperCase()}-${year}-${random}`;
  }
};
