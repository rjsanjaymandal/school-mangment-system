"use client";

import { useState } from "react";
import {
    Users,
    ShieldAlert,
    Search,
    Key,
    Database,
    UserCheck,
    GlobeLock,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ManageAccessModal } from "./ManageAccessModal";
import { ProvisionUserModal } from "./ProvisionUserModal";

export default function UsersDashboardClient({ users }: { users: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = users.filter((user) =>
        (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.first_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.last_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12 w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-between border-b border-border pb-8">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase">
                        User Management
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2 italic">
                        Access Control & System Permissions
                    </p>
                </div>
                <div className="flex gap-x-3">
                    <ProvisionUserModal />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-border bg-card rounded-xl p-6 relative overflow-hidden group shadow-sm">
                    <Users className="absolute right-[-5px] bottom-[-5px] h-16 w-16 text-primary opacity-5 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 italic">Total Users</p>
                    <h3 className="text-4xl font-black text-foreground">{users.length}</h3>
                </Card>
                <Card className="border-border bg-card rounded-xl p-6 relative overflow-hidden group shadow-sm hover:border-primary/50 transition-all">
                    <ShieldAlert className="absolute right-[-5px] bottom-[-5px] h-16 w-16 text-primary opacity-5 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 italic">Administrators</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter">{users.filter(u => u.role === 'admin').length}</h3>
                </Card>
                <Card className="border-border bg-card rounded-xl p-6 relative shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 italic">Teachers</p>
                    <h3 className="text-4xl font-black text-foreground">{users.filter(u => u.role === 'teacher').length}</h3>
                </Card>
                <Card className="border-border bg-card rounded-xl p-6 relative shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 italic">Parents</p>
                    <h3 className="text-4xl font-black text-foreground">{users.filter(u => u.role === 'parent').length}</h3>
                </Card>
            </div>

            <Card className="border-border bg-card rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/30">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-x-2 italic">
                        <Key className="h-3.5 w-3.5 text-primary" />
                        System Registry
                    </h3>
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-10 rounded-lg border-border bg-background h-10 text-[10px] uppercase font-bold tracking-widest placeholder:text-muted-foreground/30 focus-visible:ring-primary/20 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-secondary/20">
                            <tr>
                                <th className="text-left p-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">User Identity</th>
                                <th className="text-left p-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Authentication</th>
                                <th className="text-left p-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">System Role</th>
                                <th className="text-right p-5 text-[10px] font-bold uppercase tracking-widest text-primary italic">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-secondary/20 transition-all duration-300">
                                        <td className="p-5">
                                            <div className="flex items-center gap-x-4">
                                                <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs transition-all uppercase">
                                                    {user.first_name?.[0] || 'U'}{user.last_name?.[0] || ''}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground uppercase tracking-tight group-hover:text-primary transition-colors italic">
                                                        {user.first_name} {user.last_name}
                                                    </p>
                                                    <p className="text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">
                                                        UID: {user.id.substring(0, 8)}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className="text-[10px] font-bold text-primary bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all">
                                                {user.email}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <Badge
                                                className={cn(
                                                    "text-[9px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest italic",
                                                    user.role === 'admin'
                                                        ? "bg-primary text-primary-foreground border-none"
                                                        : user.role === 'teacher'
                                                            ? "bg-primary/10 text-primary border border-primary/20"
                                                            : "bg-secondary text-muted-foreground border border-border"
                                                )}
                                            >
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="p-5 text-right">
                                            <ManageAccessModal user={user} />
                                        </td>
                                    </tr>
                                ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-muted-foreground text-sm font-medium">
                                        No users found matching the search criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

