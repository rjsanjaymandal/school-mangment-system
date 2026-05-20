import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";

export const MessagesService = {
  async getAllMessages(filters?: { 
    receiver_id?: string; 
    sender_id?: string; 
    is_read?: boolean;
    priority?: string;
  }) {
    try {
      const supabase = createClient();
      
      // Check if messages table exists
      const { error: tableCheck } = await supabase
        .from("messages")
        .select("id")
        .limit(1);
      
      if (tableCheck) {
        console.warn("[MESSAGES] Table may not exist:", tableCheck.message);
        return { data: [], error: null };
      }
      
      let query = supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.receiver_id) query = query.eq("receiver_id", filters.receiver_id);
      if (filters?.sender_id) query = query.eq("sender_id", filters.sender_id);
      if (filters?.is_read !== undefined) query = query.eq("is_read", filters.is_read);
      if (filters?.priority) query = query.eq("priority", filters.priority);

      const { data, error } = await query;
      if (error) {
        console.warn("[MESSAGES] Query error:", error.message);
        return { data: [], error: null };
      }
      
      if (!data || data.length === 0) {
        return { data: [], error: null };
      }
      
      // Fetch sender and receiver profiles separately
      const userIds = [...new Set(data.flatMap(m => [m.sender_id, m.receiver_id]))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .in("id", userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const enriched = data.map(msg => ({
        ...msg,
        sender: profileMap.get(msg.sender_id) || { full_name: "Unknown", role: "student" },
        receiver: profileMap.get(msg.receiver_id) || { full_name: "Unknown", role: "student" }
      }));
      
      return { data: enriched, error: null };
    } catch (error) {
      console.warn("[MESSAGES] Error:", error);
      return { data: [], error: null };
    }
  },

  async getMessageById(id: string) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.warn("[MESSAGES] Message not found:", error.message);
        return { data: null, error: null };
      }
      
      if (data) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, role")
          .in("id", [data.sender_id, data.receiver_id]);
        
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        return { 
          data: {
            ...data,
            sender: profileMap.get(data.sender_id),
            receiver: profileMap.get(data.receiver_id)
          }, 
          error: null 
        };
      }
      
      return { data, error: null };
    } catch (error) {
      console.warn("[MESSAGES] Error:", error);
      return { data: null, error: null };
    }
  },

  async sendMessage(messageData: {
    sender_id: string;
    receiver_id: string;
    subject?: string;
    body?: string;
    content?: string;
    priority?: string;
  }) {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("messages")
        .insert({
          sender_id: messageData.sender_id,
          receiver_id: messageData.receiver_id,
          subject: messageData.subject,
          content: messageData.body || messageData.content,
          priority: messageData.priority || 'normal'
        })
        .select()
        .single();

      if (error) {
        console.warn("[MESSAGES] Send error:", error.message);
        return { data: null, error: error.message };
      }
      return { data, error: null };
    } catch (error) {
      console.warn("[MESSAGES] Error:", error);
      return { data: null, error: (error as Error).message };
    }
  },

  async markAsRead(id: string) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("id", id);

      if (error) {
        console.warn("[MESSAGES] Mark read error:", error.message);
        return { data: null, error: null };
      }
      return { data: { id, is_read: true }, error: null };
    } catch (error) {
      console.warn("[MESSAGES] Error:", error);
      return { data: null, error: null };
    }
  },

  async getConversations(userId: string) {
    try {
      const supabase = createClient();
      
      // Check if messages table exists
      const { error: tableError } = await supabase
        .from("messages")
        .select("id")
        .limit(1);
      
      // If table doesn't exist, return empty conversations
      if (tableError || !tableError) {
        return { data: [], error: null };
      }
      
      // Get all messages where user is sender or receiver
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("[MESSAGES] Table may not exist, returning empty:", error.message);
        return { data: [], error: null };
      }
      
      if (!data || data.length === 0) {
        return { data: [], error: null };
      }
      
      // Get unique user IDs
      const otherUserIds = [...new Set(
        data.map(m => m.sender_id === userId ? m.receiver_id : m.sender_id)
      )];
      
      // Get profiles for all other users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .in("id", otherUserIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      // Build conversations
      const conversations = otherUserIds.map(uid => {
        const lastMessage = data.find(
          m => m.sender_id === uid || m.receiver_id === uid
        );
        const unreadCount = data.filter(
          m => (m.sender_id === uid || m.receiver_id === uid) && !m.is_read && m.receiver_id === userId
        ).length;
        
        return {
          user: profileMap.get(uid) || { full_name: "Unknown", role: "student" },
          lastMessage,
          unreadCount
        };
      });

      return { data: conversations, error: null };
    } catch (error) {
      console.warn("[MESSAGES] Error loading conversations:", error);
      return { data: [], error: null };
    }
  },

  async deleteMessage(id: string) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", id);

      if (error) {
        console.warn("[MESSAGES] Delete error:", error.message);
        return { error: null };
      }
      return { error: null };
    } catch (error) {
      console.warn("[MESSAGES] Error:", error);
      return { error: null };
    }
  },

  async getConversationMessages(userId: string, contactId: string) {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${userId})`)
        .order("created_at", { ascending: true });

      if (error) {
        console.warn("[MESSAGES] Conversation error:", error.message);
        return { data: [], error: null };
      }
      
      if (!data || data.length === 0) {
        return { data: [], error: null };
      }
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .in("id", [userId, contactId]);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const enriched = data.map(msg => ({
        ...msg,
        sender: profileMap.get(msg.sender_id),
        receiver: profileMap.get(msg.receiver_id)
      }));
      
      return { data: enriched, error: null };
    } catch (error) {
      console.warn("[MESSAGES] Error:", error);
      return { data: [], error: null };
    }
  }
};