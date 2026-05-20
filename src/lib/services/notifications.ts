import { createClient } from "@/lib/supabase/server";

export interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    priority?: "low" | "medium" | "high";
    channel?: "all" | "students" | "staff" | "parents" | "custom";
    recipients?: number;
    sent_at?: string;
    status?: "sent" | "pending" | "failed";
}

export class NotificationsService {
    static async getAll(limit: number = 50): Promise<Notification[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    static async getUnread(): Promise<Notification[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("is_read", false)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    }

    static async getUnreadCount(): Promise<number> {
        const supabase = await createClient();
        const { count, error } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("is_read", false);

        if (error) throw error;
        return count || 0;
    }

    static async markAsRead(id: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);

        if (error) throw error;
    }

    static async markAllAsRead(): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("is_read", false);

        if (error) throw error;
    }

    static async create(notification: Partial<Notification>): Promise<Notification> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("notifications")
            .insert({
                ...notification,
                is_read: false,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async delete(id: string): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from("notifications")
            .delete()
            .eq("id", id);

        if (error) throw error;
    }

    static async deleteAll(): Promise<void> {
        const supabase = await createClient();
        const { error } = await supabase
            .from("notifications")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");

        if (error) throw error;
    }

    static async search(query: string, type?: string): Promise<Notification[]> {
        const supabase = await createClient();
        let queryBuilder = supabase
            .from("notifications")
            .select("*")
            .or(`title.ilike.%${query}%,message.ilike.%${query}%`)
            .order("created_at", { ascending: false });

        if (type && type !== "all") {
            queryBuilder = queryBuilder.eq("type", type);
        }

        const { data, error } = await queryBuilder;
        if (error) throw error;
        return data || [];
    }

    static async getByType(type: string, limit: number = 20): Promise<Notification[]> {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("type", type)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }
}