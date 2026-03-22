import { createClient } from "@/lib/supabase/server";
import { MessagesDashboard } from "@/components/messages/MessagesDashboard";

export default async function MessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get inbox messages
  const { data: inbox } = await supabase
    .from("messages")
    .select("*, sender:profiles!sender_id(*)")
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Get sent messages
  const { data: sent } = await supabase
    .from("messages")
    .select("*, receiver:profiles!receiver_id(*)")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Get all profiles for compose
  const { data: contacts } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, role, email")
    .neq("id", user.id)
    .order("first_name");

  return (
    <MessagesDashboard
      inbox={inbox || []}
      sent={sent || []}
      contacts={contacts || []}
      currentUserId={user.id}
    />
  );
}

