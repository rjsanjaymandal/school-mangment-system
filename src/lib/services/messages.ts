import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { handleServiceError } from "../error-handler";

export const MessagesService = {
  async getAllMessages(filters?: { 
    receiver_id?: string; 
    sender_id?: string; 
    is_read?: boolean;
    priority?: string;
  }) {
    try {
      const supabase = createClient();
      let query = supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!sender_id(full_name, avatar_url, role),
          receiver:profiles!receiver_id(full_name, avatar_url, role)
        `)
        .order("created_at", { ascending: false });

      if (filters?.receiver_id) query = query.eq("receiver_id", filters.receiver_id);
      if (filters?.sender_id) query = query.eq("sender_id", filters.sender_id);
      if (filters?.is_read !== undefined) query = query.eq("is_read", filters.is_read);
      if (filters?.priority) query = query.eq("priority", filters.priority);

      const { data, error } = await query;
      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getMessageById(id: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!sender_id(full_name, avatar_url, role),
          receiver:profiles!receiver_id(full_name, avatar_url, role)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async sendMessage(messageData: {
    sender_id: string;
    receiver_id: string;
    subject?: string;
    content: string;
    priority?: string;
  }) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("messages")
        .insert({
          ...messageData,
          priority: messageData.priority || 'normal'
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async markAsRead(id: string) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async markAllAsRead(receiverId: string) {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("receiver_id", receiverId)
        .eq("is_read", false);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async deleteMessage(id: string) {
    try {
      const supabase = createAdminClient();
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getUnreadCount(userId: string) {
    try {
      const supabase = createClient();
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: 'exact', head: true })
        .eq("receiver_id", userId)
        .eq("is_read", false);

      if (error) throw error;
      return { data: { unread: count || 0 }, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getConversations(userId: string) {
    try {
      const supabase = createClient();
      
      const { data: sent } = await supabase
        .from("messages")
        .select("receiver_id, created_at")
        .eq("sender_id", userId);

      const { data: received } = await supabase
        .from("messages")
        .select("sender_id, created_at")
        .eq("receiver_id", userId);

      const contactIds = new Set([
        ...(sent || []).map(m => m.receiver_id),
        ...(received || []).map(m => m.sender_id)
      ].filter(id => id !== userId));

      const conversations = await Promise.all(
        Array.from(contactIds).map(async (contactId) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, role")
            .eq("id", contactId)
            .single();

          const { data: lastMessage } = await supabase
            .from("messages")
            .select("*")
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${userId})`)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: 'exact', head: true })
            .eq("receiver_id", userId)
            .eq("sender_id", contactId)
            .eq("is_read", false);

          return {
            contact: profile,
            last_message: lastMessage,
            unread_count: unreadCount || 0
          };
        })
      );

      conversations.sort((a, b) => 
        new Date(b.last_message?.created_at || 0).getTime() - 
        new Date(a.last_message?.created_at || 0).getTime()
      );

      return { data: conversations, error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async getConversationMessages(userId: string, contactId: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!sender_id(full_name, avatar_url, role),
          receiver:profiles!receiver_id(full_name, avatar_url, role)
        `)
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${userId})`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  },

  async sendBulkMessage(senderId: string, receiverIds: string[], content: string, subject?: string, priority?: string) {
    try {
      const supabase = createAdminClient();
      
      const messages = receiverIds.map(receiver_id => ({
        sender_id: senderId,
        receiver_id,
        subject: subject || '',
        content,
        priority: priority || 'normal'
      }));

      const { data, error } = await supabase
        .from("messages")
        .insert(messages)
        .select();

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return handleServiceError(error);
    }
  }
};
