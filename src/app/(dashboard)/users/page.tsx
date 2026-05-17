export const revalidate = 30;
export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import UsersDashboardClient from "@/components/users/UsersDashboardClient";
import { isAdmin } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";

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
    <div className="space-y-6">
      <UsersDashboardClient users={users || []} />
    </div>
  );
}

