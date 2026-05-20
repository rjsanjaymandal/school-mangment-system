"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ===== MESSAGES =====

export async function sendMessage(data: {
    receiver_id: string;
    subject?: string;
    body: string;
    priority?: string;
}) {
    try {
        const authClient = await createClient();
        const { data: { user } } = await authClient.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const supabase = createAdminClient();
        const { error } = await supabase.from("messages").insert({
            sender_id: user.id,
            receiver_id: data.receiver_id,
            subject: data.subject || null,
            content: data.body,
            priority: data.priority || "normal",
        });
        if (error) throw error;
        revalidatePath("/messages");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getInbox(userId: string) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("receiver_id", userId)
            .order("created_at", { ascending: false });
        if (error) throw error;
        
        // Fetch sender profiles
        if (data && data.length > 0) {
            const senderIds = data.map(m => m.sender_id);
            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, full_name, avatar_url, role")
                .in("id", senderIds);
            
            const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
            
            const enriched = data.map(msg => ({
                ...msg,
                sender: profileMap.get(msg.sender_id) || { full_name: "Unknown", role: "student" }
            }));
            
            return { success: true, data: enriched };
        }
        
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message, data: [] };
    }
}

export async function markMessageRead(messageId: string) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("messages")
            .update({ is_read: true })
            .eq("id", messageId);
        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ===== INVENTORY =====

export async function createInventoryItem(data: {
    name: string;
    category?: string;
    quantity_in_stock?: number;
    unit_price?: number;
    sku?: string;
    min_stock_level?: number;
    location?: string;
    supplier?: string;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("inventory_items").insert(data);
        if (error) throw error;
        revalidatePath("/services/inventory");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateInventoryItem(id: string, data: Partial<{
    name: string;
    category: string;
    quantity_in_stock: number;
    unit_price: number;
    min_stock_level: number;
    location: string;
    supplier: string;
    status: string;
}>) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("inventory_items").update(data).eq("id", id);
        if (error) throw error;
        revalidatePath("/services/inventory");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteInventoryItem(id: string) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("inventory_items").delete().eq("id", id);
        if (error) throw error;
        revalidatePath("/services/inventory");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ===== DOCUMENTS =====

export async function createDocument(data: {
    title: string;
    category?: string;
    file_path?: string;
    file_size?: number;
    uploaded_by?: string;
    expiry_date?: string;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("document_archives").insert(data);
        if (error) throw error;
        revalidatePath("/compliance");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ===== GUARDIAN LINKS =====

export async function linkGuardian(data: {
    guardian_id: string;
    student_id: string;
    relationship?: string;
    is_primary?: boolean;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("guardian_students")
            .upsert(data, { onConflict: "guardian_id,student_id" });
        if (error) throw error;
        revalidatePath("/students/guardians");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStudentGuardians(studentId: string) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("guardian_students")
            .select("*, guardian:profiles(*)")
            .eq("student_id", studentId);
        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message, data: [] };
    }
}

// ===== NOTIFICATIONS =====

export async function createNotification(data: {
    user_id: string;
    title: string;
    body?: string;
    type?: string;
    link?: string;
}) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase.from("notifications").insert(data);
        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getNotifications(userId: string) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(50);
        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error: any) {
        return { success: false, error: error.message, data: [] };
    }
}

export async function markNotificationRead(id: string) {
    try {
        const supabase = createAdminClient();
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);
        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
