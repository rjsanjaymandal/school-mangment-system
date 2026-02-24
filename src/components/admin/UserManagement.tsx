"use client";
import Link from "next/link";

import { useEffect, useState } from "react";
import {
  Users,
  Shield,
  Search,
  MoreHorizontal,
  RefreshCw,
  UserCheck,
  UserCog,
  ShieldCheck,
  AlertCircle,
  Eye,
} from "lucide-react";
import { UserService } from "@/lib/services/user";
import { startImpersonation } from "@/lib/services/impersonation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUsers = async () => {
    setIsRefreshing(true);
    const data = await UserService.getAllProfiles();
    if (data && !("error" in data)) {
      setUsers(data);
    } else {
      toast.error("Failed to load users");
    }
    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleUpdate = async (userId: string, newRole: any) => {
    const res = await UserService.updateProfileRole(userId, newRole);
    if (res && !("error" in res)) {
      toast.success(`Role updated to ${newRole}`);
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } else {
      toast.error("Failed to update role");
    }
  };

  const handleDeactivate = async (userId: string) => {
    const res = await UserService.deactivateUser(userId);
    if (res && !("error" in res)) {
      toast.success("User access deactivated");
      // Optionally update local state if status is added
    } else {
      toast.error("Failed to deactivate access");
    }
  };

  const [isImpersonating, setIsImpersonating] = useState<string | null>(null);

  const handleImpersonate = async (userId: string) => {
    setIsImpersonating(userId);
    try {
      await startImpersonation(userId);
    } catch (error: any) {
      toast.error(error.message || "Failed to start impersonation");
      setIsImpersonating(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      `${user.first_name || ""} ${user.last_name || ""}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge
            variant="futuristic"
            className="bg-red-500/10 text-red-500 border-red-500/20 shadow-xs shadow-red-500/10"
          >
            <ShieldCheck className="h-3 w-3 mr-1" /> ADMIN
          </Badge>
        );
      case "teacher":
        return (
          <Badge
            variant="futuristic"
            className="bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-xs shadow-blue-500/10"
          >
            <UserCheck className="h-3 w-3 mr-1" /> TEACHER
          </Badge>
        );
      case "student":
        return (
          <Badge
            variant="futuristic"
            className="bg-green-500/10 text-green-500 border-green-500/20 shadow-xs shadow-green-500/10"
          >
            <Users className="h-3 w-3 mr-1" /> STUDENT
          </Badge>
        );
      default:
        return (
          <Badge
            variant="futuristic"
            className="bg-slate-500/10 text-slate-500 border-slate-500/20 tracking-tighter uppercase font-black"
          >
            {role || "USER"}
          </Badge>
        );
    }
  };

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search identity vault..."
            className="pl-10 rounded-2xl border-white/10 bg-white/50 backdrop-blur-md shadow-xl focus:ring-slate-900 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={fetchUsers}
          disabled={isRefreshing}
          className="rounded-2xl border-white/10 bg-white/50 backdrop-blur-md font-bold gap-x-2 shadow-xl hover:bg-white transition-all"
        >
          <RefreshCw
            className={cn("h-4 w-4", isRefreshing && "animate-spin")}
          />
          Refresh Registry
        </Button>
      </div>

      <Card
        variant="glass"
        className="overflow-hidden border-none shadow-2xl bg-white/30 backdrop-blur-xl"
      >
        <Table>
          <TableHeader className="bg-slate-900/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Identity Details
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Access Tier
              </TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Registered
              </TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-slate-400 font-bold uppercase tracking-widest"
                >
                  No records found in current segment.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-white/5 hover:bg-white/40 transition-colors group"
                >
                  <TableCell>
                    <div className="flex items-center gap-x-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black shadow-lg neon-blue">
                        {user.first_name?.[0] || "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 leading-tight">
                          {user.first_name} {user.last_name}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 tracking-tight font-mono">
                          {user.id}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-black">
                        {new Date(user.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-slate-900 hover:text-white rounded-lg transition-all"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 rounded-2xl border-white/10 bg-white/80 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-200"
                      >
                        <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Access Management
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuItem
                          onClick={() => handleImpersonate(user.id)}
                          disabled={isImpersonating === user.id}
                          className="gap-x-2 font-bold cursor-pointer hover:bg-slate-900 hover:text-white focus:bg-slate-900 focus:text-white rounded-xl transition-colors"
                        >
                          <Eye className="h-4 w-4" />{" "}
                          {isImpersonating === user.id
                            ? "Initializing..."
                            : "View As Profile"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuItem
                          onClick={() => handleRoleUpdate(user.id, "admin")}
                          className="gap-x-2 font-bold cursor-pointer hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600 rounded-xl transition-colors"
                        >
                          <Shield className="h-4 w-4" /> Elevate to Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleUpdate(user.id, "teacher")}
                          className="gap-x-2 font-bold cursor-pointer hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 rounded-xl transition-colors"
                        >
                          <UserCog className="h-4 w-4" /> Switch to Teacher
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleUpdate(user.id, "student")}
                          className="gap-x-2 font-bold cursor-pointer hover:bg-green-50 hover:text-green-600 focus:bg-green-50 focus:text-green-600 rounded-xl transition-colors"
                        >
                          <Users className="h-4 w-4" /> Demote to Student
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuItem
                          onClick={() => handleDeactivate(user.id)}
                          className="gap-x-2 font-bold text-red-600 cursor-pointer hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <AlertCircle className="h-4 w-4" /> Deactive Access
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-tr from-blue-500/10 to-transparent opacity-50" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-x-4 text-white">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <ShieldCheck className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                Security Protocol
              </p>
              <h4 className="text-sm font-bold tracking-tight">
                Real-time metadata synchronization is active and monitoring
                changes.
              </h4>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-white/20 bg-white/10 text-white font-black hover:bg-white/20 transition-all border-none shadow-xl"
          >
            <Link href="/audit">VIEW AUDIT LOGS</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
