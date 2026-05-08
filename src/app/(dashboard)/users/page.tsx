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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-md">
            <Users className="h-6 w-6 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Users</h1>
            <p className="text-sm text-slate-500">{users?.length || 0} total users</p>
          </div>
        </div>
        <Button className="rounded-md bg-emerald-600 hover:bg-emerald-700 gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <ERPCard
        title="User Management"
        description="Manage system users and permissions"
        icon={<Users className="h-5 w-5" />}
        color="slate"
      >
        <UsersDashboardClient users={users || []} />
      </ERPCard>
    </div>
  );
}

