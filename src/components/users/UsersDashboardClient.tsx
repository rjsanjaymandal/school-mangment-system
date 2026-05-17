"use client";

import { useState } from "react";
import Link from "next/link";
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
    Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ManageAccessModal } from "./ManageAccessModal";
import { ProvisionUserModal } from "./ProvisionUserModal";
import { ImpersonationButton } from "./ImpersonationButton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function UsersDashboardClient({ users }: { users: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");

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

    return (
        <div className="space-y-12 animate-in fade-in transition-all duration-1000 relative reveal-1">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-primary/10 pb-12 relative z-10">
                <div className="flex items-center gap-x-8">
                    <div className="h-16 w-16 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary rounded-sm group hover:bg-primary hover:text-primary-foreground transition-all duration-300 emerald-glow-sm">
                        <Shield className="h-8 w-8 transition-all duration-300" />
                    </div>
                    <div>
                        <div className="relative">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground">
                                User Directory
                            </h2>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" /> 
                            Manage system access and roles
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <ProvisionUserModal />
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 reveal-2">
                <div className="border border-border bg-card p-6 rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="h-20 w-20 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Total Users</p>
                    <h3 className="text-4xl font-bold text-foreground leading-none">{users.length.toString().padStart(2, '0')}</h3>
                    <p className="text-xs font-medium text-emerald-600 mt-4 flex items-center gap-2">
                       <Users className="h-3.5 w-3.5" /> Active Accounts
                    </p>
                </div>

                <div className="border border-border bg-card p-6 rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldAlert className="h-20 w-20 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Administrators</p>
                    <h3 className="text-4xl font-bold text-foreground leading-none">
                        {users.filter(u => u.role === 'admin').length.toString().padStart(2, '0')}
                    </h3>
                    <p className="text-xs font-medium text-emerald-600 mt-4 flex items-center gap-2">
                       <ShieldCheck className="h-3.5 w-3.5" /> System Admins
                    </p>
                </div>

                <div className="border border-border bg-card p-6 rounded-xl shadow-sm relative overflow-hidden group">
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Teachers</p>
                    <h3 className="text-4xl font-bold text-foreground leading-none">
                        {users.filter(u => u.role === 'teacher').length.toString().padStart(2, '0')}
                    </h3>
                    <p className="text-xs font-medium text-emerald-600 mt-4 flex items-center gap-2">
                       <BookOpen className="h-3.5 w-3.5" /> Teaching Staff
                    </p>
                </div>

                <div className="border border-border bg-card p-6 rounded-xl shadow-sm relative overflow-hidden group">
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Parents</p>
                    <h3 className="text-4xl font-bold text-foreground leading-none">
                        {users.filter(u => u.role === 'parent').length.toString().padStart(2, '0')}
                    </h3>
                    <p className="text-xs font-medium text-emerald-600 mt-4 flex items-center gap-2">
                       <Baby className="h-3.5 w-3.5" /> Parent Accounts
                    </p>
                </div>
            </div>

            {/* User List */}
            <div className="space-y-6 reveal-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 border border-border bg-card/50 rounded-lg">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-x-3">
                        <Users className="h-5 w-5 text-primary" />
                        User List
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-full md:w-[180px] h-11 bg-background border-border text-foreground font-medium rounded-sm focus:ring-1 focus:ring-primary/40 transition-all">
                                <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent className="bg-background border-border">
                                <SelectItem value="all" className="font-medium text-sm">All Roles</SelectItem>
                                <SelectItem value="admin" className="font-medium text-sm">Admins</SelectItem>
                                <SelectItem value="teacher" className="font-medium text-sm">Teachers</SelectItem>
                                <SelectItem value="student" className="font-medium text-sm">Students</SelectItem>
                                <SelectItem value="parent" className="font-medium text-sm">Parents</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="relative flex-1 md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Input
                                placeholder="Search users..."
                                className="h-11 pl-11 bg-background border-border text-foreground font-medium rounded-sm focus:ring-1 focus:ring-primary/40 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="border border-border bg-card/40 rounded-lg overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="py-3 px-6 text-sm font-semibold text-muted-foreground">Name</th>
                                    <th className="py-3 px-6 text-sm font-semibold text-muted-foreground">Email Address</th>
                                    <th className="py-3 px-6 text-sm font-semibold text-muted-foreground text-center">Role</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/5">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-16 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center">
                                                <Users className="h-12 w-12 mb-4 text-muted-foreground/30" />
                                                <p className="text-sm font-medium">No users found matching your criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="group hover:bg-muted/30 transition-colors border-b border-border">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 flex items-center justify-center font-bold text-white text-sm rounded-full bg-primary/20 border border-primary/20">
                                                        {user.full_name?.[0] || 'U'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors leading-none mb-1">
                                                            {user.full_name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground font-mono">
                                                            ID: {user.id.substring(0, 8)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm text-muted-foreground border border-border bg-background px-3 py-1.5 rounded-sm shadow-sm font-mono">
                                                    {user.email}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <Badge
                                                    className={cn(
                                                        "text-xs font-medium px-3 py-1 rounded-full flex items-center justify-center gap-x-2 w-fit mx-auto border capitalize",
                                                        user.role === 'admin'
                                                            ? "bg-primary text-white border-primary shadow-sm"
                                                            : user.role === 'teacher'
                                                                ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                                                                : user.role === 'student'
                                                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                                    : "bg-muted text-muted-foreground border-border"
                                                    )}
                                                >
                                                    {getRoleIcon(user.role)}
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-x-3">
                                                    <ImpersonationButton userId={user.id} userName={user.full_name} />
                                                    <div className="h-6 w-[1px] bg-primary/10 mx-2" />
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
            <div className="p-8 rounded-sm border border-border bg-card/40 backdrop-blur-sm relative overflow-hidden group reveal-3">
                <div className="absolute inset-0 bg-primary/5 opacity-50" />
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-x-6">
                        <div className="h-14 w-14 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary rounded-full shadow-sm">
                            <ShieldCheck className="h-7 w-7 transition-transform group-hover:scale-110 duration-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-primary mb-1">
                                System Security
                            </p>
                            <h4 className="text-base font-medium text-foreground leading-tight">
                                User data is continually backed up and synchronized across the platform.
                            </h4>
                        </div>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        className="h-11 px-8 rounded-sm font-semibold transition-all"
                    >
                        <Link href="/audit">
                            <Activity className="h-4 w-4 mr-2" />
                            View Audit Logs
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
