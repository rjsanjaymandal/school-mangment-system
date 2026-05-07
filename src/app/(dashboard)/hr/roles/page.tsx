export const revalidate = 30;
export const dynamic = 'force-static';

import { createClient } from "@/lib/supabase/server";
import { Shield, Users, Save, RotateCcw, Search, UserCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ERPCard } from "@/components/ui/erp-card";
import { updateUserRole, resetUserAccess } from "@/app/actions/roles";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ROLES = ["admin", "principal", "teacher", "clerk", "receptionist"];

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700 border-red-200",
  principal: "bg-purple-100 text-purple-700 border-purple-200",
  teacher: "bg-blue-100 text-blue-700 border-blue-200",
  clerk: "bg-amber-100 text-amber-700 border-amber-200",
  receptionist: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default async function RolesPage() {
  const supabase = await createClient();
  
  // Simple auth check - just verify user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Fetch all staff with their roles and login info
  const { data: staff } = await supabase
    .from("staff")
    .select(`
      id,
      employee_id,
      designation,
      profile:profiles(id, full_name, email, phone, avatar_url, created_at)
    `)
    .order("created_at", { ascending: false });

  // Fetch user roles
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("user_id, role, assigned_at");

  // Create role lookup
  const roleLookup = Object.fromEntries(
    (userRoles || []).map((ur) => [ur.user_id, ur.role])
  );

  // Get login activity (last login timestamps)
  const { data: loginActivity } = await supabase
    .from("user_login_activity")
    .select("user_id, last_login")
    .order("last_login", { ascending: false });

  const loginLookup = Object.fromEntries(
    (loginActivity || []).map((la) => [la.user_id, la.last_login])
  );

  async function handleRoleChange(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    const newRole = formData.get("role") as string;
    await updateUserRole(userId, newRole);
    revalidatePath("/hr/roles");
  }

  async function handleResetAccess(formData: FormData) {
    "use server";
    const userId = formData.get("userId") as string;
    await resetUserAccess(userId);
    revalidatePath("/hr/roles");
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-md border-l-4 border-blue-500">
          <Shield className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Role & Permissions</h1>
          <p className="text-sm text-slate-500">Manage staff roles and access control</p>
        </div>
      </div>

      <Card className="border-l-4 border-l-blue-500 shadow-sm">
        <CardHeader className="pb-4 border-b bg-slate-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-600" />
              Role Assignment & Security
            </CardTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100">
              {(staff || []).length} Staff Members
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Search */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, employee ID or designation..."
              className="pl-10 rounded-md"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b">
                  <TableHead className="text-sm font-medium text-slate-600 w-12">#</TableHead>
                  <TableHead className="text-sm font-medium text-slate-600">Employee Profile</TableHead>
                  <TableHead className="text-sm font-medium text-slate-600">Login Info</TableHead>
                  <TableHead className="text-sm font-medium text-slate-600">Current Role</TableHead>
                  <TableHead className="text-sm font-medium text-slate-600">Last Access</TableHead>
                  <TableHead className="text-sm font-medium text-slate-600 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {(staff || []).map((member, index) => {
                  const profile = member.profile as any;
                  const userId = profile?.id;
                  const currentRole = roleLookup[userId] || "teacher";
                  const lastLogin = loginLookup[userId];

                  return (
                    <TableRow key={member.id} className="hover:bg-slate-50">
                      <TableCell className="text-slate-500">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium overflow-hidden">
                            {profile?.avatar_url ? (
                              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                              profile?.full_name?.[0] || "?"
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{profile?.full_name || "Unknown"}</p>
                            <p className="text-xs text-slate-500">{member.designation || member.employee_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-slate-600">{profile?.email || "No email"}</p>
                          <p className="text-xs text-slate-500">{profile?.phone || "No phone"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={ROLE_COLORS[currentRole] || ROLE_COLORS.teacher}>
                          {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lastLogin ? (
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Clock className="h-3 w-3" />
                            {new Date(lastLogin).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <form action={handleRoleChange}>
                            <input type="hidden" name="userId" value={userId || ""} />
                            <div className="flex items-center gap-2">
                              <Select name="role" defaultValue={currentRole}>
                                <SelectTrigger className="w-32 h-8 rounded-md">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROLES.map((r) => (
                                    <SelectItem key={r} value={r}>
                                      {r.charAt(0).toUpperCase() + r.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button type="submit" size="sm" className="h-8 rounded-md bg-blue-600 hover:bg-blue-700">
                                <Save className="h-3 w-3" />
                              </Button>
                            </div>
                          </form>
                          <form action={handleResetAccess}>
                            <input type="hidden" name="userId" value={userId || ""} />
                            <Button type="submit" variant="outline" size="sm" className="h-8 rounded-md text-red-600 border-red-200 hover:bg-red-50">
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {(staff || []).length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No staff members found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}