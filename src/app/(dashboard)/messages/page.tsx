import { createClient } from "@/lib/supabase/server";
import { MessagesDashboard } from "@/components/messages/MessagesDashboard";
import { MessagesService } from "@/lib/services/messages";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";

export default async function MessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: conversations } = await MessagesService.getConversations(user.id);

  const { data: contacts } = await supabase
    .from("profiles")
    .select("id, full_name, role, avatar_url")
    .neq("id", user.id)
    .order("full_name");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-50 rounded-md">
          <MessageSquare className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-sm text-slate-500">Communication and notifications</p>
        </div>
      </div>

      <ERPCard
        title="Messages"
        description="View and send messages"
        icon={MessageSquare}
        color="blue"
      >
        <MessagesDashboard
          initialConversations={conversations || []}
          contacts={contacts || []}
          currentUserId={user.id}
        />
      </ERPCard>
    </div>
  );
}

