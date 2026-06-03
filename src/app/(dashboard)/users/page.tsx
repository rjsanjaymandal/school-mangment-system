export const revalidate = 30;
export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import UsersDashboardClient from "@/components/users/UsersDashboardClient";
import { isAdmin } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    redirect("/");
  }

  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
  }

  return (
    <div className="animate-in fade-in duration-700 space-y-6">
      <UsersDashboardClient users={users || []} />
    </div>
  );
}