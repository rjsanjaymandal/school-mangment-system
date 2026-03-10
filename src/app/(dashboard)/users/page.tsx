import { createClient } from "@/lib/supabase/server";
import UsersDashboardClient from "@/components/users/UsersDashboardClient";

export default async function UsersPage() {
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
  }

  return <UsersDashboardClient users={users || []} />;
}
