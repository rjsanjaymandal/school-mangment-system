export const revalidate = 30;

import { createClient } from "@/lib/supabase/server";
import { MessagesDashboard } from "@/components/messages/MessagesDashboard";
import { MessagesService } from "@/lib/services/messages";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";

export default async function MessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let conversations: any[] = [];
  let contacts: any[] = [];

  try {
    const { data } = await MessagesService.getConversations(user.id);
    conversations = data || [];
  } catch (error) {
    console.warn("[MESSAGES] Failed to load conversations:", error);
  }

  try {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role, avatar_url")
      .neq("id", user.id)
      .order("full_name");
    contacts = data || [];
  } catch (error) {
    console.warn("[MESSAGES] Failed to load contacts:", error);
  }

  return (
    <div className="p-6 space-y-0 animate-in fade-in duration-700">
      <UnifiedPageHeader 
        title="Messages"
        subtitle="Communication and notifications"
        icon={MessageSquare}
        color="blue"
      />

      <MessagesDashboard
        initialConversations={conversations}
        contacts={contacts}
        currentUserId={user.id}
      />
    </div>
  );
}