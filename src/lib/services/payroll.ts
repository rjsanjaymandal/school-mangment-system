import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleServiceError } from "../error-handler";
import type { SupabaseClient } from "@supabase/supabase-js";

export const PayrollService = {
  async getAllPayrolls(filters?: { 
    staff_id?: string; 
    month?: number; 
    year?: number;
    status?: string;
  }, client?: SupabaseClient) {
    try {
      const supabase = client || createClient();
      let query = supabase
        .from("staff_payrolls")
        .select(`
          *,
          staff:profiles(full_name, phone, email, role)
        `)
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (filters?.staff_id) query = query.eq("staff_id", filters.staff_id);
      if (filters?.month) query = query.eq("month", filters.month);
      if (filters?.year) query = query.eq("year", filters.year);
      if (filters?.status) query = query.eq("status", filters.status);

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error("PayrollService.getAllPayrolls error:", error instanceof Error ? error.message : error);
      return { data: [], error };
    }
  },

  async getPayrollById(id: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("staff_payrolls")
        .select(`
          *,
          staff:profiles(full_name, phone, email, role)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("PayrollService.getPayrollById error:", error);
      return { data: null, error };
    }
  },

  async createPayroll(payrollData: {
    staff_id: string;
    base_salary: number;
    bonuses?: number;
    deductions?: number;
    month: number;
    year: number;
  }) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("staff_payrolls")
        .insert({
          ...payrollData,
          bonuses: payrollData.bonuses || 0,
          deductions: payrollData.deductions || 0,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("PayrollService.createPayroll error:", error);
      return { data: null, error };
    }
  },

  async updatePayroll(id: string, payrollData: Partial<{
    base_salary: number;
    bonuses: number;
    deductions: number;
    status: string;
  }>) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("staff_payrolls")
        .update(payrollData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("PayrollService.updatePayroll error:", error);
      return { data: null, error };
    }
  },

  async processPayment(id: string) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("staff_payrolls")
        .update({
          status: 'paid',
          payment_date: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("PayrollService.processPayment error:", error);
      return { data: null, error };
    }
  },

  async deletePayroll(id: string) {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase.from("staff_payrolls").delete().eq("id", id);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("PayrollService.deletePayroll error:", error);
      return { error };
    }
  },

  async getStaffPayrollHistory(staffId: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("staff_payrolls")
        .select("*")
        .eq("staff_id", staffId)
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error("PayrollService.getStaffPayrollHistory error:", error);
      return { data: [], error };
    }
  },

  async getPayrollSummary(year: number, client?: SupabaseClient) {
    try {
      const supabase = client || createClient();
      
      const { data: payrolls } = await supabase
        .from("staff_payrolls")
        .select("base_salary, bonuses, deductions, status")
        .eq("year", year);

      const totalPayroll = (payrolls || []).reduce((sum, p) => sum + Number(p.base_salary), 0);
      const totalBonuses = (payrolls || []).reduce((sum, p) => sum + Number(p.bonuses || 0), 0);
      const totalDeductions = (payrolls || []).reduce((sum, p) => sum + Number(p.deductions || 0), 0);
      const totalNetPay = totalPayroll + totalBonuses - totalDeductions;
      const paidCount = (payrolls || []).filter(p => p.status === 'paid').length;
      const pendingCount = (payrolls || []).filter(p => p.status === 'pending').length;

      return {
        data: {
          total_payroll: totalPayroll,
          total_bonuses: totalBonuses,
          total_deductions: totalDeductions,
          total_net_pay: totalNetPay,
          paid_count: paidCount,
          pending_count: pendingCount
        },
        error: null
      };
    } catch (error) {
      console.error("PayrollService.getPayrollSummary error:", error);
      return { data: {
        total_payroll: 0,
        total_bonuses: 0,
        total_deductions: 0,
        total_net_pay: 0,
        paid_count: 0,
        pending_count: 0
      }, error };
    }
  },

  async getLeaveRequests(filters?: { 
    staff_id?: string; 
    status?: string;
  }, client?: SupabaseClient) {
    try {
      const supabase = client || createClient();
      let query = supabase
        .from("leave_requests")
        .select(`
          id, staff_id, leave_type, start_date, end_date, reason, status, created_at,
          staff:profiles!leave_requests_staff_id_fkey(full_name, phone, role)
        `)
        .order("created_at", { ascending: false });

      if (filters?.staff_id) query = query.eq("staff_id", filters.staff_id);
      if (filters?.status) query = query.eq("status", filters.status);

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error("PayrollService.getLeaveRequests error:", error instanceof Error ? error.message : error);
      return { data: [], error };
    }
  },

  async createLeaveRequest(requestData: {
    staff_id: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason?: string;
  }) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("leave_requests")
        .insert({
          ...requestData,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("PayrollService.createLeaveRequest error:", error);
      return { data: null, error };
    }
  },

  async updateLeaveStatus(id: string, status: 'approved' | 'rejected', approvedBy: string) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("leave_requests")
        .update({ 
          status,
          approved_by: approvedBy
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("PayrollService.updateLeaveStatus error:", error);
      return { data: null, error };
    }
  },

  async getLeaveBalance(staffId: string, year: number) {
    try {
      const supabase = createClient();
      
      const { data: requests } = await supabase
        .from("leave_requests")
        .select("leave_type, start_date, end_date, status")
        .eq("staff_id", staffId)
        .gte("start_date", `${year}-01-01`)
        .lt("start_date", `${year + 1}-01-01`)
        .eq("status", "approved");

      const leaveTypes = ['sick', 'casual', 'earned', 'maternity', 'paternity', 'unpaid'];
      const balance: Record<string, number> = {};
      
      leaveTypes.forEach(type => {
        const defaultDays = type === 'sick' ? 10 : type === 'casual' ? 12 : type === 'earned' ? 15 : 0;
        const usedDays = (requests || [])
          .filter(r => r.leave_type === type)
          .reduce((sum, r) => {
            const start = new Date(r.start_date);
            const end = new Date(r.end_date);
            return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          }, 0);
        balance[type] = defaultDays - usedDays;
      });

      return { data: balance, error: null };
    } catch (error) {
      console.error("PayrollService.getLeaveBalance error:", error);
      return { data: {}, error };
    }
  }
};
