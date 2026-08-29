"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Users,
    UserCheck,
    GlobeLock,
    Plus,
    ShieldCheck,
    GraduationCap,
    BookOpen,
    Baby,
    Filter,
    ShieldAlert,
    MoreHorizontal,
    Key,
    Search,
    Activity,
    Shield,
    Zap,
    Download,
    Eye,
    Power,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

import { ManageAccessModal } from "./ManageAccessModal";
import { ProvisionUserModal } from "./ProvisionUserModal";
import { ImpersonationButton } from "./ImpersonationButton";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { toggleUserStatusAction } from "@/app/(dashboard)/users/actions";

export default function UsersDashboardClient({ users }: { users: any[] }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        setTogglingId(userId);
        try {
            const nextStatus = !currentStatus;
            const res = await toggleUserStatusAction(userId, nextStatus);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to update user status");
        } finally {
            setTogglingId(null);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch = 
            (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (user.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        
        return matchesSearch && matchesRole;
    });

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <ShieldCheck className="h-4 w-4" />;
            case 'teacher': return <BookOpen className="h-4 w-4" />;
            case 'student': return <GraduationCap className="h-4 w-4" />;
            case 'parent': return <Baby className="h-4 w-4" />;
            default: return <Users className="h-4 w-4" />;
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return "bg-rose-500/10 text-rose-600 border-rose-500/20";
            case 'teacher': return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
            case 'student': return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            case 'parent': return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            default: return "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    return (
        <div className="space-y-8 mt-6">
            
            {/* Header */}
            <UnifiedPageHeader
                title="User Directory"
                subtitle="Manage system access and roles"
                icon={Shield}
                color="blue"
                actions={<ProvisionUserModal />}
            />

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <DashboardStatCard title="Total Users" value={users.length.toString().padStart(2, '0')} icon={Users} color="slate" description="Active Accounts" />
                <DashboardStatCard title="Admins" value={users.filter(u => u.role === 'admin').length.toString().padStart(2, '0')} icon={ShieldCheck} color="rose" description="System Admins" />
                <DashboardStatCard title="Teachers" value={users.filter(u => u.role === 'teacher').length.toString().padStart(2, '0')} icon={BookOpen} color="indigo" description="Teaching Staff" />
                <DashboardStatCard title="Parents" value={users.filter(u => u.role === 'parent').length.toString().padStart(2, '0')} icon={Baby} color="blue" description="Parent Accounts" />
            </div>

            {/* User List */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            <Users className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                            User List
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                            <select
                                className="w-full md:w-[180px] h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Roles</option>
                                <option value="admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Admins</option>
                                <option value="teacher" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Teachers</option>
                                <option value="student" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Students</option>
                                <option value="parent" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Parents</option>
                            </select>

                            <div className="relative flex-1 md:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    placeholder="Search users..."
                                    className="w-full h-11 pl-11 rounded-xl border border-slate-200 dark:border-slate-800 px-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-300 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Name</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Email Address</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Role</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">Status</th>
                                    <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-slate-500 dark:text-slate-400">
                                            <div className="flex flex-col items-center">
                                                <Users className="h-12 w-12 mb-4 text-slate-300" />
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No users found matching your criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 flex items-center justify-center font-bold text-white text-sm rounded-xl bg-emerald-500/20 text-emerald-700">
                                                        {user.full_name?.[0] || 'U'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">
                                                            {user.full_name}
                                                        </span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                            ID: {user.id.substring(0, 8)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-sm text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl font-mono">
                                                    {user.email}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center justify-center gap-2 border",
                                                    getRoleBadge(user.role)
                                                )}>
                                                    {getRoleIcon(user.role)}
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, user.is_active !== false)}
                                                    disabled={togglingId === user.id}
                                                    title={user.is_active !== false ? "Click to deactivate user" : "Click to activate user"}
                                                    className={cn(
                                                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-80 active:scale-95 disabled:opacity-50",
                                                        user.is_active !== false
                                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20"
                                                            : "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20"
                                                    )}
                                                >
                                                    {togglingId === user.id ? (
                                                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                                    ) : (
                                                        <span className={cn(
                                                            "h-1.5 w-1.5 rounded-full",
                                                            user.is_active !== false ? "bg-emerald-500" : "bg-rose-500"
                                                        )} />
                                                    )}
                                                    {user.is_active !== false ? "Active" : "Inactive"}
                                                </button>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <ImpersonationButton userId={user.id} userName={user.full_name} />
                                                    <div className="h-6 w-px bg-slate-200" />
                                                    <ManageAccessModal user={user} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            {/* Security Section */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-6 relative">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="h-14 w-14 bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 rounded-xl">
                            <ShieldCheck className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">
                                System Security
                            </p>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                User data is continually backed up and synchronized across the platform.
                            </h4>
                        </div>
                    </div>
                    <Link href="/audit">
                        <button className="h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest px-6 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
                            <Activity className="h-4 w-4 mr-2 inline" />
                            View Audit Logs
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}