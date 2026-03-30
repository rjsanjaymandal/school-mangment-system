import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleServiceError } from "../error-handler";

export const FeesService = {
  async getAllFees(filters?: { class_id?: string; academic_year_id?: string; fee_type?: string }) {
    try {
      const supabase = createClient();
      let query = supabase
        .from("fees")
        .select(`
          *,
          class:classes(name),
          academic_year:academic_years(year)
        `)
        .order("due_date", { ascending: false });

      if (filters?.class_id) query = query.eq("class_id", filters.class_id);
      if (filters?.academic_year_id) query = query.eq("academic_year_id", filters.academic_year_id);
      if (filters?.fee_type) query = query.eq("fee_type", filters.fee_type);

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getFeeById(id: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("fees")
        .select(`
          *,
          class:classes(name),
          academic_year:academic_years(year)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async createFee(feeData: {
    name: string;
    amount: number;
    due_date?: string;
    class_id?: string;
    academic_year_id?: string;
    description?: string;
    fee_type?: string;
  }) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("fees")
        .insert(feeData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async updateFee(id: string, feeData: Partial<{
    name: string;
    amount: number;
    due_date: string;
    class_id: string;
    academic_year_id: string;
    description: string;
    fee_type: string;
  }>) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("fees")
        .update(feeData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async deleteFee(id: string) {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase.from("fees").delete().eq("id", id);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getStudentFees(studentId: string) {
    try {
      const supabase = createClient();
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("class_id")
        .eq("id", studentId)
        .single();

      if (studentError) throw studentError;

      const { data: fees, error: feesError } = await supabase
        .from("fees")
        .select("*")
        .or("class_id.is.null,class_id.eq." + student.class_id)
        .order("due_date", { ascending: false });

      if (feesError) throw feesError;

      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("student_id", studentId);

      if (paymentsError) throw paymentsError;

      const feesWithPayments = (fees || []).map(fee => {
        const feePayments = (payments || []).filter(p => p.fee_id === fee.id);
        const totalPaid = feePayments.reduce((sum, p) => sum + Number(p.amount_paid), 0);
        return {
          ...fee,
          total_paid: totalPaid,
          balance: Number(fee.amount) - totalPaid,
          payments: feePayments
        };
      });

      return { data: feesWithPayments, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getAllPayments(filters?: { student_id?: string; fee_id?: string; status?: string }) {
    try {
      const supabase = createClient();
      let query = supabase
        .from("payments")
        .select(`
          *,
          student:students(id, admission_number, profile:profiles(full_name)),
          fee:fees(name, amount)
        `)
        .order("payment_date", { ascending: false });

      if (filters?.student_id) query = query.eq("student_id", filters.student_id);
      if (filters?.fee_id) query = query.eq("fee_id", filters.fee_id);
      if (filters?.status) query = query.eq("status", filters.status);

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async createPayment(paymentData: {
    student_id: string;
    fee_id: string;
    amount_paid: number;
    payment_method?: string;
    transaction_id?: string;
    status?: string;
  }) {
    try {
      const supabase = createAdminClient();
      
      const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from("payments")
        .insert({
          ...paymentData,
          payment_method: paymentData.payment_method || 'cash',
          status: paymentData.status || 'completed',
          receipt_number: receiptNumber,
          payment_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getPaymentHistory(studentId: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          fee:fees(name, amount)
        `)
        .eq("student_id", studentId)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getFeeSummary(academicYearId?: string) {
    try {
      const supabase = createClient();
      
      let feesQuery = supabase.from("fees").select("amount, fee_type");
      if (academicYearId) feesQuery = feesQuery.eq("academic_year_id", academicYearId);
      const { data: fees } = await feesQuery;

      const paymentsQuery = supabase.from("payments").select("amount_paid, status");
      const { data: payments } = await paymentsQuery;

      const totalExpected = (fees || []).reduce((sum, f) => sum + Number(f.amount), 0);
      const totalCollected = (payments || [])
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount_paid), 0);
      const totalPending = totalExpected - totalCollected;

      return {
        data: {
          total_expected: totalExpected,
          total_collected: totalCollected,
          total_pending: totalPending,
          collection_rate: totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(2) : 0
        },
        error: null
      };
    } catch (error) {
      return handleServiceError(error);
    }
  }
};
