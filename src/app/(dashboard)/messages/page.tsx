import { createClient } from "@/lib/supabase/server";
import { MessagesDashboard } from "@/components/messages/MessagesDashboard";
import { MessagesService } from "@/lib/services/messages";
import { redirect } from "next/navigation";

export default async function MessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get modern conversation threads
  const { data: conversations } = await MessagesService.getConversations(user.id);

  // Get all profiles for starting new conversations
  const { data: contacts } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url")
    .neq("id", user.id)
    .order("full_name");

  return (
    <MessagesDashboard
      initialConversations={conversations || []}
      contacts={contacts || []}
      currentUserId={user.id}
    />
  );
}

