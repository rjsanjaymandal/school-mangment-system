"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ===== PAYROLL =====

export async function createPayroll(data: {
    staff_id: string;
    base_salary: number;
    bonuses?: number;
    deductions?: number;
    month: number;
    year: number;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("staff_payrolls").insert({
            ...data,
            bonuses: data.bonuses || 0,
            deductions: data.deductions || 0,
        });
        if (error) throw error;
        revalidatePath("/fees");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function processPayroll(payrollId: string) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("staff_payrolls")
            .update({ status: "paid", payment_date: new Date().toISOString() })
            .eq("id", payrollId);
        if (error) throw error;
        revalidatePath("/fees");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPayrollByMonth(month: number, year: number) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("staff_payrolls")
            .select("*, staff:profiles(*)")
            .eq("month", month)
            .eq("year", year);
        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message, data: [] };
    }
}

// ===== LEAVE REQUESTS =====

export async function submitLeaveRequest(data: {
    staff_id: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason?: string;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("leave_requests").insert(data);
        if (error) throw error;
        revalidatePath("/fees");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateLeaveStatus(id: string, status: "approved" | "rejected", approvedBy: string) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("leave_requests")
            .update({ status, approved_by: approvedBy })
            .eq("id", id);
        if (error) throw error;
        revalidatePath("/fees");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getLeaveRequests(filters?: { staff_id?: string; status?: string }) {
    try {
        const supabase = createAdminClient();
        let query = supabase.from("leave_requests").select("*, staff:profiles(*)");
        if (filters?.staff_id) query = query.eq("staff_id", filters.staff_id);
        if (filters?.status) query = query.eq("status", filters.status);
        const { data, error } = await query.order("created_at", { ascending: false });
        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message, data: [] };
    }
}
