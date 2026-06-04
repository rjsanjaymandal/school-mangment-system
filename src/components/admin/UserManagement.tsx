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
  Activity,
  Zap,
  GlobeLock,
  Download,
  Key
} from "lucide-react";
import { UserService } from "@/lib/services/user";
import { startImpersonation } from "@/lib/services/impersonation";
import { createClient } from "@/lib/supabase/client";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(true);

  const fetchUsers = async () => {
    setIsRefreshing(true);
    const supabase = createClient();
    const data = await UserService.getAllProfiles(supabase);
    if (data && !("error" in data)) {
      setUsers(data);
    } else {
      toast.error("Failed to load users");
    }
    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    let active = true;

    const loadUsers = async () => {
      const supabase = createClient();
      const data = await UserService.getAllProfiles(supabase);
      if (!active) return;

      if (data && !("error" in data)) {
        setUsers(data);
      } else {
        toast.error("Failed to load users");
      }

      setLoading(false);
      setIsRefreshing(false);
    };

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  const handleRoleUpdate = async (userId: string, newRole: any) => {
    const supabase = createClient();
    const res = await UserService.updateProfileRole(supabase, userId, newRole);
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
    const supabase = createClient();
    const res = await UserService.deactivateUser(supabase, userId);
    if (res && !("error" in res)) {
      toast.success("User access deactivated");
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
      toast.error(error.message || "Failed to start shadow session");
      setIsImpersonating(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      `${user.first_name || ""} ${user.last_name || ""}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (user.id?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
  );

  const getRoleBadge = (role: string) => {
    const baseClass = "text-xs font-medium px-3 py-1 rounded-full flex items-center justify-center gap-x-2 w-fit min-w-[100px] mx-auto capitalize";
    switch (role) {
      case "admin":
        return (
          <Badge variant="outline" className={cn(baseClass, "bg-primary text-primary-foreground border-primary shadow-sm")}>
            <ShieldCheck className="h-4 w-4" /> Admin
          </Badge>
        );
      case "teacher":
        return (
          <Badge variant="outline" className={cn(baseClass, "bg-indigo-500/10 text-indigo-500 border-indigo-500/20")}>
            <UserCheck className="h-4 w-4" /> Teacher
          </Badge>
        );
      case "student":
        return (
          <Badge variant="outline" className={cn(baseClass, "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")}>
            <Users className="h-4 w-4" /> Student
          </Badge>
        );
      case "parent":
        return (
          <Badge variant="outline" className={cn(baseClass, "bg-muted text-muted-foreground border-border")}>
            <Shield className="h-4 w-4" /> Parent
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className={cn(baseClass, "bg-muted text-muted-foreground border-border")}>
            {role || "User"}
          </Badge>
        );
    }
  };

  if (loading)
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-primary/5 border border-primary/10 rounded-sm" />
        <div className="grid grid-cols-4 gap-8">
            <div className="h-32 bg-primary/5 border border-primary/10 rounded-sm" />
            <div className="h-32 bg-primary/5 border border-primary/10 rounded-sm" />
            <div className="h-32 bg-primary/5 border border-primary/10 rounded-sm" />
            <div className="h-32 bg-primary/5 border border-primary/10 rounded-sm" />
        </div>
        <div className="h-96 bg-primary/5 border border-primary/10 rounded-sm" />
      </div>
    );

  return (
    <div className="space-y-12 animate-in fade-in transition-all duration-1000 relative reveal-1">
      
      {/* Header Architecture */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-primary/10 pb-12 relative z-10">
        <div className="flex items-center gap-x-8">
            <div className="h-16 w-16 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary rounded-sm group hover:bg-primary hover:text-primary-foreground transition-all duration-300 emerald-glow-sm">
                <Shield className="h-8 w-8 transition-all duration-300" />
            </div>
            <div>
                <div className="relative">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        System Admin
                    </h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" /> 
                    Manage site settings and core access
                </p>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <Button
                variant="outline"
                onClick={fetchUsers}
                disabled={isRefreshing}
                className="h-11 px-6 font-medium transition-all"
            >
                <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                Refresh
            </Button>
            <Button variant="default" className="h-11 px-6 font-medium transition-all">
                <Download className="h-4 w-4 mr-2" /> Export Users
            </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 reveal-2 relative z-10">
        <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition-all">
            <p className="text-xs font-medium text-muted-foreground mb-2">Total Users</p>
            <h3 className="text-4xl font-bold text-foreground leading-none">{users.length.toString().padStart(2, '0')}</h3>
            <p className="text-xs font-medium text-primary mt-6 flex items-center gap-2">
               <Users className="h-3.5 w-3.5" /> All System Accounts
            </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition-all">
            <p className="text-xs font-medium text-muted-foreground mb-2">Admins</p>
            <h3 className="text-4xl font-bold text-foreground leading-none">{users.filter(u => u.role === 'admin').length.toString().padStart(2, '0')}</h3>
            <p className="text-xs font-medium text-primary mt-6 flex items-center gap-2">
               <ShieldCheck className="h-3.5 w-3.5 text-red-500" /> Root Permissions
            </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition-all">
            <p className="text-xs font-medium text-muted-foreground mb-2">Teachers</p>
            <h3 className="text-4xl font-bold text-foreground leading-none">{users.filter(u => u.role === 'teacher').length.toString().padStart(2, '0')}</h3>
            <p className="text-xs font-medium text-primary mt-6 flex items-center gap-2">
               <UserCog className="h-3.5 w-3.5" /> Subject Masters
            </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-md transition-all">
            <p className="text-xs font-medium text-muted-foreground mb-2">Students</p>
            <h3 className="text-4xl font-bold text-foreground leading-none">{users.filter(u => u.role === 'student').length.toString().padStart(2, '0')}</h3>
            <p className="text-xs font-medium text-primary mt-6 flex items-center gap-2">
               <Users className="h-3.5 w-3.5" /> Enrolled Students
            </p>
        </div>
      </div>

      {/* Surface Control */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 p-6 border border-border bg-card/40 backdrop-blur-sm rounded-sm reveal-3">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-all duration-300" />
            <Input
                placeholder="Search users by name or ID..."
                className="h-11 pl-12 bg-background border-border text-foreground font-medium rounded-sm focus:ring-1 focus:ring-primary/40 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium">Live Sync</span>
             </div>
          </div>
      </div>

      <div className="border border-border bg-card/40 rounded-sm overflow-hidden reveal-3">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-4 px-6 font-semibold">User</TableHead>
              <TableHead className="py-4 px-6 font-semibold text-center">Role</TableHead>
              <TableHead className="py-4 px-6 font-semibold text-center">Joined Date</TableHead>
              <TableHead className="py-4 px-6 font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center">
                        <Users className="h-10 w-10 mb-4 text-muted-foreground opacity-20" />
                        <p className="text-sm font-medium text-muted-foreground">No users found matching your search.</p>
                    </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="group hover:bg-muted/50 transition-colors">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 flex items-center justify-center font-bold text-white text-sm rounded-full bg-primary/20 border border-primary/20">
                          {user.first_name?.[0] || "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors leading-none mb-1">
                          {user.first_name} {user.last_name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                           ID: {user.id.substring(0, 8)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-center">{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="py-4 px-6 text-center">
                    <div className="flex flex-col items-center gap-1 text-xs">
                      <span className="text-foreground/80 font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                      <span className="text-muted-foreground">
                        {new Date(user.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-sm hover:bg-muted transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 p-2 rounded-sm border border-border shadow-md"
                      >
                        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                          User Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleImpersonate(user.id)}
                          disabled={isImpersonating === user.id}
                          className="flex items-center gap-3 px-2 py-2 text-sm cursor-pointer rounded-sm"
                        >
                          <Eye className="h-4 w-4" />{" "}
                          {isImpersonating === user.id
                            ? "Logging in..."
                            : "Login as User"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleRoleUpdate(user.id, "admin")}
                          className="flex items-center gap-3 px-2 py-2 text-sm cursor-pointer rounded-sm"
                        >
                          <ShieldCheck className="h-4 w-4" /> Make Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleUpdate(user.id, "teacher")}
                          className="flex items-center gap-3 px-2 py-2 text-sm cursor-pointer rounded-sm"
                        >
                          <UserCog className="h-4 w-4" /> Make Teacher
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleUpdate(user.id, "student")}
                          className="flex items-center gap-3 px-2 py-2 text-sm cursor-pointer rounded-sm"
                        >
                          <Users className="h-4 w-4" /> Make Student
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeactivate(user.id)}
                          className="flex items-center gap-3 px-2 py-2 text-sm text-red-500 cursor-pointer rounded-sm hover:text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <AlertCircle className="h-4 w-4" /> Deactivate Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Audit Log Banner */}
      <div className="p-8 rounded-sm border border-border bg-card/40 backdrop-blur-sm relative overflow-hidden group reveal-3 mt-8">
        <div className="absolute inset-0 bg-primary/5 opacity-50" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-x-6">
            <div className="h-14 w-14 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary rounded-full shadow-sm">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary mb-1">
                Audit Logs
              </p>
              <h4 className="text-base font-medium text-foreground leading-tight">
                Review system activity and admin changes in the global log.
              </h4>
            </div>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-11 px-8 rounded-sm font-semibold transition-all"
          >
            <Link href="/audit" className="flex items-center gap-x-2">
               <Activity className="h-4 w-4" /> View Logs
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
