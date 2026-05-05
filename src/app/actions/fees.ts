"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// ===== FEES =====

export async function createFee(data: {
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
        const { error } = await supabase.from("fees").insert(data);
        if (error) throw error;
        revalidatePath("/fees");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateFee(id: string, data: Partial<{
    name: string;
    amount: number;
    due_date: string;
    class_id: string;
    description: string;
    fee_type: string;
}>) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("fees").update(data).eq("id", id);
        if (error) throw error;
        revalidatePath("/fees");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteFee(id: string) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("fees").delete().eq("id", id);
        if (error) throw error;
        revalidatePath("/fees");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getFeesByClass(classId: string) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("fees")
            .select("*, class:classes(*)")
            .eq("class_id", classId);

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message, data: [] };
    }
}

// ===== PAYMENTS =====

export async function recordPayment(data: {
    student_id: string;
    fee_id: string;
    amount_paid: number;
    payment_method: string;
    transaction_id?: string;
}) {
    try {
        const supabase = createAdminClient();
        const receiptNo = `RCP-${Date.now().toString(36).toUpperCase()}`;

        const { error } = await supabase.from("payments").insert({
            ...data,
            receipt_number: receiptNo,
            status: "completed",
        });

        if (error) throw error;
        revalidatePath("/fees");
        return { success: true, receipt_number: receiptNo };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPaymentsByStudent(studentId: string) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("payments")
            .select("*, fee:fees(*)")
            .eq("student_id", studentId)
            .order("payment_date", { ascending: false });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message, data: [] };
    }
}

export async function getFeeCollectionSummary() {
    try {
        const supabase = createAdminClient();

        const { data: fees, error: feesError } = await supabase
            .from("fees")
            .select("*");

        const { data: payments, error: paymentsError } = await supabase
            .from("payments")
            .select("*")
            .eq("status", "completed");

        if (feesError) throw feesError;
        if (paymentsError) throw paymentsError;

        const totalFees = (fees || []).reduce((sum, f) => sum + Number(f.amount), 0);
        const totalCollected = (payments || []).reduce((sum, p) => sum + Number(p.amount_paid), 0);

        return {
            success: true,
            data: {
                totalFees,
                totalCollected,
                outstanding: totalFees - totalCollected,
                collectionRate: totalFees > 0 ? ((totalCollected / totalFees) * 100).toFixed(1) : "0",
            },
        };
    } catch (error: any) {
        return { success: false, error: error.message, data: null };
    }
}

export async function getFeeDashboardStats(academicYear: string = "2026-27") {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase.rpc("get_fee_dashboard_stats", {
            p_academic_year: academicYear
        });

        if (error) throw error;
        
        // The RPC returns a single row with multiple columns
        return { success: true, data: data?.[0] || null };
    } catch (error: any) {
        console.error("Error fetching fee dashboard stats:", error);
        return { success: false, error: error.message, data: null };
    }
}
