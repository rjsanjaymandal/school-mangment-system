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

export default function UsersDashboardClient({ users }: { users: any[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = users.filter((user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12 w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase italic underline decoration-primary/30 underline-offset-8">
                        Identity & Access Control
                    </h2>
                    <p className="text-primary font-black uppercase text-[10px] tracking-[0.3em] mt-3 bg-primary/10 w-fit px-3 py-1 rounded-sm border border-primary/20">
                        Protocol Personnel & Role-Based Authorization Matrix
                    </p>
                </div>
                <div className="flex gap-x-3">
                    <Button className="rounded-sm bg-primary text-primary-foreground font-black gap-x-2 emerald-glow min-w-[160px] uppercase tracking-widest text-[10px] py-6 shadow-2xl transition-all hover:bg-primary/90">
                        <Plus className="h-4 w-4" />
                        Provision User
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-6 relative overflow-hidden group shadow-2xl">
                    <Users className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-primary opacity-10 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Total Identities</p>
                    <h3 className="text-3xl font-black text-primary">{users.length}</h3>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-8 relative overflow-hidden group shadow-2xl hover:border-primary transition-all">
                    <ShieldAlert className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-primary opacity-5 group-hover:scale-110 transition-transform" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 italic">Clearance: Level 5 (Admin)</p>
                    <h3 className="text-4xl font-black text-foreground tracking-tighter italic">{users.filter(u => u.role === 'admin').length}</h3>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-6 relative shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Active Faculty</p>
                    <h3 className="text-3xl font-black text-foreground">{users.filter(u => u.role === 'teacher').length}</h3>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-6 relative shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Parent Nodes</p>
                    <h3 className="text-3xl font-black text-foreground">{users.filter(u => u.role === 'parent').length}</h3>
                </Card>
            </div>

            <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-border/50 flex items-center justify-between bg-primary/5">
                    <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-x-2">
                        <Key className="h-4 w-4" />
                        Access Control Ledger
                    </h3>
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-primary" />
                        <Input
                            placeholder="SEARCH IDENTITIES..."
                            className="pl-9 rounded-sm border-border bg-card/40 backdrop-blur-md h-10 text-[10px] uppercase font-black tracking-widest placeholder:text-foreground/20 focus:border-primary transition-all shadow-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-primary/5">
                            <tr className="border-b border-border/50">
                                <th className="text-left p-5 font-black uppercase tracking-[0.2em] text-[10px] text-primary">
                                    Profile Signature
                                </th>
                                <th className="text-left p-5 font-black uppercase tracking-[0.2em] text-[10px] text-primary">
                                    Network Alias
                                </th>
                                <th className="text-left p-5 font-black uppercase tracking-[0.2em] text-[10px] text-primary">
                                    Clearance Level
                                </th>
                                <th className="text-right p-5 font-black uppercase tracking-[0.2em] text-[10px] text-primary">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filteredUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-primary/5 transition-colors border-border/50 group"
                                >
                                    <td className="p-5">
                                        <div className="flex items-center gap-x-3">
                                            <div className="h-10 w-10 shrink-0 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs shadow-lg group-hover:emerald-glow-sm transition-all uppercase">
                                                {user.first_name?.[0] || 'U'}{user.last_name?.[0] || ''}
                                            </div>
                                            <div>
                                                <p className="font-black text-foreground uppercase tracking-tight">
                                                    {user.first_name} {user.last_name}
                                                </p>
                                                <p className="text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                                                    ID: {user.id.substring(0, 8)}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="font-mono text-[10px] font-black text-primary bg-primary/5 border border-primary/10 px-4 py-2 rounded-sm uppercase tracking-widest group-hover:emerald-glow transition-all">
                                            {user.email}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <Badge
                                            className={cn(
                                                "text-[9px] font-black px-4 py-1 rounded-sm uppercase tracking-[0.2em] shadow-lg",
                                                user.role === 'admin'
                                                    ? "bg-primary text-primary-foreground emerald-glow border-none"
                                                    : user.role === 'teacher'
                                                        ? "bg-primary/10 text-primary border border-primary/20"
                                                        : "bg-background/40 text-foreground/40 border border-border"
                                            )}
                                        >
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="p-5 text-right flex items-center justify-end gap-x-2">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="rounded-sm font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10 transition-all"
                                        >
                                            MANAGE ACCESS
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-muted-foreground text-sm font-medium">
                                        No identities matched the search signature.
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

