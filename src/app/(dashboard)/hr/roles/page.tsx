"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Shield, Users, Save, RotateCcw, Search, UserCheck, Key, Check, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ERPCard } from "@/components/ui/erp-card";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ROLES = ["admin", "principal", "teacher", "clerk", "receptionist"];

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-rose-100 text-rose-700 border-rose-200",
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

function RoleBadge({ role }: { role: string }) {
  if (role === "none") {
    return <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 text-[10px] font-black uppercase tracking-widest">No Access</Badge>;
  }
  return (
    <span className={cn("inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border", ROLE_STYLES[role] || "bg-slate-100 text-slate-700")}>
      {role}
    </span>
  );
}

export default function RolesPage() {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [staffMembers, setStaffMembers] = useState<StaffWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});
  const [loadKey, setLoadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let roleMap = new Map();
        try {
          const { data: userRoles } = await supabase.from("user_roles").select("user_id, role").limit(1);
          if (userRoles) {
            const { data: allRoles } = await supabase.from("user_roles").select("user_id, role");
            roleMap = new Map(allRoles?.map(ur => [ur.user_id, ur.role]) || []);
          }
        } catch (roleError) {
          console.log("user_roles not accessible, continuing without roles");
        }

        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("id, staff_id, first_name, last_name, designation_id, user_id")
          .order("created_at", { ascending: false })
          .limit(50);

        if (staffError || !staffData) {
          console.error("Staff query error:", staffError);
          if (!cancelled) { setStaffMembers([]); }
          return;
        }

        const userIds = staffData.map(s => s.user_id).filter(Boolean);

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone, avatar_url")
          .in("id", userIds.length > 0 ? userIds : ["no-match"]);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

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
            profile: profile ? { full_name: profile.full_name, email: profile.email, phone: profile.phone, avatar_url: profile.avatar_url } : undefined,
            currentRole: role,
          };
        });

        if (!cancelled) {
          setStaffMembers(staffWithRoles);
          const initialPending: Record<string, string> = {};
          staffWithRoles.forEach(s => { initialPending[s.id] = s.currentRole; });
          setPendingRoles(initialPending);
        }
      } catch (error) {
        console.error("Error loading staff:", error);
        if (!cancelled) toast.error("Failed to load staff data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [loadKey]);

  const handleRoleChange = (staffId: string, newRole: string) => {
    setPendingRoles(prev => ({ ...prev, [staffId]: newRole }));
  };

  const handleUpdateRole = async (staffId: string) => {
    const staff = staffMembers.find(s => s.id === staffId);
    if (!staff || !staff.user_id) { toast.error("No linked user account"); return; }
    const newRole = pendingRoles[staffId];
    if (newRole === staff.currentRole) { toast.info("No changes to save"); return; }
    setUpdating(staffId);
    try {
      const { error } = await supabase.from("user_roles").upsert({ user_id: staff.user_id, role: newRole, assigned_at: new Date().toISOString() }, { onConflict: "user_id" });
      if (error) throw error;
      const { error: profileError } = await supabase.from("profiles").update({ role: newRole }).eq("id", staff.user_id);
      if (profileError) throw profileError;
      setStaffMembers(prev => prev.map(s => s.id === staffId ? { ...s, currentRole: newRole } : s));
      toast.success(`Role updated to ${newRole}`);
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error(error.message || "Failed to update role");
    } finally { setUpdating(null); }
  };

  const handleResetAccess = async (staffId: string) => {
    const staff = staffMembers.find(s => s.id === staffId);
    if (!staff || !staff.user_id) { toast.error("No linked user account"); return; }
    if (!confirm("This will disable login access for this user. Continue?")) return;
    setUpdating(staffId);
    try {
      await supabase.from("user_roles").delete().eq("user_id", staff.user_id);
      await supabase.from("profiles").update({ role: "none" }).eq("id", staff.user_id);
      setStaffMembers(prev => prev.map(s => s.id === staffId ? { ...s, currentRole: "none" } : s));
      setPendingRoles(prev => ({ ...prev, [staffId]: "none" }));
      toast.success("Login access disabled");
    } catch (error: any) {
      console.error("Error resetting access:", error);
      toast.error(error.message || "Failed to reset access");
    } finally { setUpdating(null); }
  };

  const filteredStaff = staffMembers.filter(s => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    const search = searchQuery.toLowerCase();
    return fullName.includes(search) || s.staff_id?.toLowerCase().includes(search) || s.profile?.email?.toLowerCase().includes(search);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 mt-6">
      {/* Header */}
      <UnifiedPageHeader title="Permissions" subtitle="Manage user roles and login access" icon={Shield} color="blue" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStatCard title="Total Staff" value={staffMembers.length} icon={Users} color="blue" description="All registered staff" />
        <DashboardStatCard title="Admins" value={staffMembers.filter(s => s.currentRole === "admin").length} icon={Shield} color="rose" description="Full system access" />
        <DashboardStatCard title="Teachers" value={staffMembers.filter(s => s.currentRole === "teacher").length} icon={UserCheck} color="amber" description="Teaching staff" />
        <DashboardStatCard title="No Access" value={staffMembers.filter(s => s.currentRole === "none").length} icon={Key} color="slate" description="Login disabled" />
      </div>

      {/* Search + Refresh */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search by name, staff ID, or email..."
            className="pl-11 h-10 rounded-xl bg-white border-slate-200 text-xs font-bold shadow-sm"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Button variant="outline" onClick={() => setLoadKey(k => k + 1)}
          className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-200 gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Table */}
      <ERPCard accentColor="blue" className="border-none shadow-xl rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 w-12">#</th>
                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Employee Profile</th>
                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Login Info</th>
                <th className="text-left py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Current Role</th>
                <th className="text-right py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="animate-pulse space-y-3 max-w-md mx-auto">
                      {[1, 2, 3].map((i) => (<div key={i} className="h-12 bg-slate-100 rounded-xl" />))}
                    </div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-400 mb-1">No staff members found</p>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {searchQuery ? "Try a different search term" : "No staff data available"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff, index) => (
                  <tr key={staff.id} className="border-b border-slate-100/50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-sm font-bold text-slate-400">{index + 1}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0 shadow-sm">
                          {staff.profile?.avatar_url ? (
                            <img src={staff.profile.avatar_url} alt={staff.first_name} className="h-10 w-10 rounded-xl object-cover" />
                          ) : (
                            getInitials(staff.first_name, staff.last_name)
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{staff.first_name} {staff.last_name}</p>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{staff.staff_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{staff.profile?.email || <span className="text-slate-300">No email</span>}</p>
                        <p className="text-[10px] font-semibold text-slate-400">{staff.profile?.phone || "No phone"}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <RoleBadge role={staff.currentRole} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <select value={pendingRoles[staff.id] || "none"}
                          onChange={(e) => handleRoleChange(staff.id, e.target.value)}
                          disabled={updating === staff.id}
                          className="h-9 rounded-xl border border-slate-200 px-3 text-[10px] font-bold text-slate-700 bg-white focus:border-blue-300 outline-none disabled:opacity-50">
                          {ROLE_OPTIONS.map((role) => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                          ))}
                        </select>
                        <button onClick={() => handleUpdateRole(staff.id)}
                          disabled={updating === staff.id || pendingRoles[staff.id] === staff.currentRole}
                          className={cn("h-9 w-9 rounded-xl flex items-center justify-center transition-all shadow-sm",
                            updating === staff.id ? "bg-blue-100" : "bg-blue-600 hover:bg-blue-700 disabled:opacity-30")}>
                          {updating === staff.id ? (
                            <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </button>
                        <button onClick={() => handleResetAccess(staff.id)}
                          disabled={updating === staff.id || staff.currentRole === "none"}
                          className="h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-30"
                          title="Disable access">
                          <RotateCcw className="h-3.5 w-3.5 text-slate-500 hover:text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ERPCard>
    </div>
  );
}
