"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Shield, Users, Save, RotateCcw, Search, UserCheck, Key, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";

const ROLES = ["admin", "principal", "teacher", "clerk", "receptionist"];

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700 border-red-200",
  principal: "bg-purple-100 text-purple-700 border-purple-200",
  teacher: "bg-blue-100 text-blue-700 border-blue-200",
  clerk: "bg-amber-100 text-amber-700 border-amber-200",
  receptionist: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const ROLE_OPTIONS = [
  { value: "admin", label: "Administrator", description: "Full system access" },
  { value: "principal", label: "Principal", description: "Management access" },
  { value: "teacher", label: "Teacher", description: "Teaching staff" },
  { value: "clerk", label: "Clerk", description: "Administrative staff" },
  { value: "receptionist", label: "Receptionist", description: "Front desk access" },
];

interface StaffMember {
  id: string;
  staff_id: string;
  first_name: string;
  last_name: string;
  designation: string;
  user_id: string | null;
  profile?: {
    full_name: string;
    email: string;
    phone: string;
    avatar_url: string;
  };
  role?: string;
}

interface StaffWithRole extends StaffMember {
  currentRole: string;
}

function getInitials(firstName?: string, lastName?: string): string {
  if (!firstName) return "?";
  const first = firstName.charAt(0).toUpperCase();
  const last = lastName?.charAt(0).toUpperCase() || "";
  return first + last;
}

export default function RolesPage() {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [staffMembers, setStaffMembers] = useState<StaffWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);

  // Load staff data
async function loadStaff() {
    setLoading(true);
    try {
      // First, let's check if user_roles table works by doing a simple count
      let roleMap = new Map();
      try {
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("user_id, role")
          .limit(1);
        
        if (userRoles) {
          const { data: allRoles } = await supabase
            .from("user_roles")
            .select("user_id, role");
          roleMap = new Map(allRoles?.map(ur => [ur.user_id, ur.role]) || []);
        }
      } catch (roleError) {
        console.log("user_roles not accessible, continuing without roles");
      }

      // Get staff data
      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select(`
          id,
          staff_id,
          first_name,
          last_name,
          designation_id,
          user_id
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (staffError || !staffData) {
        console.error("Staff query error:", staffError);
        setStaffMembers([]);
        setInitialized(true);
        return;
      }

      const userIds = staffData.map(s => s.user_id).filter(Boolean);
      
      // Get profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, avatar_url")
        .in("id", userIds.length > 0 ? userIds : ["no-match"]);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Get login activity (optional - don't fail if table doesn't exist)
      let loginMap = new Map();
      try {
        const { data: loginActivity } = await supabase
          .from("user_login_activity")
          .select("user_id, last_login")
          .order("last_login", { ascending: false })
          .limit(100);
        
        loginMap = new Map(loginActivity?.map((la: any) => [la.user_id, la.last_login]) || []);
      } catch (e) {
        // Table might not exist, ignore
        console.log("user_login_activity table not available");
      }

      const staffWithRoles: StaffWithRole[] = (staffData || []).map((s: any) => {
        const profile = profileMap.get(s.user_id);
        const role = roleMap.get(s.user_id) || "none";
        
        return {
          id: s.id,
          staff_id: s.staff_id,
          first_name: s.first_name,
          last_name: s.last_name,
          designation: "Staff",
          user_id: s.user_id,
          profile: profile ? {
            full_name: profile.full_name,
            email: profile.email,
            phone: profile.phone,
            avatar_url: profile.avatar_url
          } : undefined,
          currentRole: role,
        };
      });

      setStaffMembers(staffWithRoles);
      
      // Initialize pending roles
      const initialPending: Record<string, string> = {};
      staffWithRoles.forEach(s => {
        initialPending[s.id] = s.currentRole;
      });
      setPendingRoles(initialPending);
      setInitialized(true);
    } catch (error) {
      console.error("Error loading staff:", error);
      toast.error("Failed to load staff data");
    } finally {
      setLoading(false);
    }
  }

  // Load on mount
  useEffect(() => {
    loadStaff();
  }, []);

  const handleRoleChange = (staffId: string, newRole: string) => {
    setPendingRoles(prev => ({ ...prev, [staffId]: newRole }));
  };

  const handleUpdateRole = async (staffId: string) => {
    const staff = staffMembers.find(s => s.id === staffId);
    if (!staff || !staff.user_id) {
      toast.error("No linked user account");
      return;
    }

    const newRole = pendingRoles[staffId];
    if (newRole === staff.currentRole) {
      toast.info("No changes to save");
      return;
    }

    setUpdating(staffId);
    try {
      // Upsert to user_roles table
      const { error } = await supabase
        .from("user_roles")
        .upsert({
          user_id: staff.user_id,
          role: newRole,
          assigned_at: new Date().toISOString()
        }, { onConflict: "user_id" });

      if (error) throw error;

      // Update profile role as well
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", staff.user_id);

      if (profileError) throw profileError;

      // Update local state
      setStaffMembers(prev => prev.map(s => 
        s.id === staffId ? { ...s, currentRole: newRole } : s
      ));

      toast.success(`Role updated to ${newRole}`);
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error(error.message || "Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const handleResetAccess = async (staffId: string) => {
    const staff = staffMembers.find(s => s.id === staffId);
    if (!staff || !staff.user_id) {
      toast.error("No linked user account");
      return;
    }

    if (!confirm("This will disable login access for this user. Continue?")) return;

    setUpdating(staffId);
    try {
      // Remove from user_roles
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", staff.user_id);

      // Update profile role to none
      await supabase
        .from("profiles")
        .update({ role: "none" })
        .eq("id", staff.user_id);

      // Update local state
      setStaffMembers(prev => prev.map(s => 
        s.id === staffId ? { ...s, currentRole: "none" } : s
      ));
      setPendingRoles(prev => ({ ...prev, [staffId]: "none" }));

      toast.success("Login access disabled");
    } catch (error: any) {
      console.error("Error resetting access:", error);
      toast.error(error.message || "Failed to reset access");
    } finally {
      setUpdating(null);
    }
  };

  const filteredStaff = staffMembers.filter(s => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    const search = searchQuery.toLowerCase();
    return fullName.includes(search) || 
           s.staff_id?.toLowerCase().includes(search) ||
           s.profile?.email?.toLowerCase().includes(search);
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Permissions</h1>
            <p className="text-blue-100 text-sm">Manage user roles and login access</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            Total Staff
          </div>
          <p className="text-2xl font-bold mt-1">{staffMembers.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            Admins
          </div>
          <p className="text-2xl font-bold mt-1 text-red-600">
            {staffMembers.filter(s => s.currentRole === "admin").length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCheck className="h-4 w-4" />
            Teachers
          </div>
          <p className="text-2xl font-bold mt-1 text-blue-600">
            {staffMembers.filter(s => s.currentRole === "teacher").length}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Key className="h-4 w-4" />
            No Access
          </div>
          <p className="text-2xl font-bold mt-1 text-gray-600">
            {staffMembers.filter(s => s.currentRole === "none").length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, staff ID, or email..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={loadStaff}>
          Refresh
        </Button>
      </div>

      {/* Staff Table */}
      <ERPCard accentColor="blue" className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">#</TableHead>
                <TableHead className="font-semibold">Employee Profile</TableHead>
                <TableHead className="font-semibold">Login Info</TableHead>
                <TableHead className="font-semibold">Current Role</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading staff data...
                  </TableCell>
                </TableRow>
              ) : filteredStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No staff members found
                  </TableCell>
                </TableRow>
              ) : (
                filteredStaff.map((staff, index) => (
                  <TableRow key={staff.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {staff.profile?.avatar_url ? (
                            <img 
                              src={staff.profile.avatar_url} 
                              alt={staff.first_name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            getInitials(staff.first_name, staff.last_name)
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {staff.first_name} {staff.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {staff.staff_id} • {staff.designation}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{staff.profile?.email || "No email"}</p>
                        <p className="text-xs text-muted-foreground">{staff.profile?.phone || "No phone"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {staff.currentRole === "none" ? (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600">
                          No Access
                        </Badge>
                      ) : (
                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium border ${ROLE_COLORS[staff.currentRole] || "bg-gray-100 text-gray-700"}`}>
                          {staff.currentRole}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Select 
                          value={pendingRoles[staff.id] || "none"}
                          onValueChange={(value) => handleRoleChange(staff.id, value)}
                          disabled={updating === staff.id}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleUpdateRole(staff.id)}
                          disabled={updating === staff.id || pendingRoles[staff.id] === staff.currentRole}
                        >
                          {updating === staff.id ? (
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => handleResetAccess(staff.id)}
                          disabled={updating === staff.id || staff.currentRole === "none"}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </ERPCard>
    </div>
  );
}