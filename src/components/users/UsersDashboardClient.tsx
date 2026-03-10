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
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">
                        Identity Matrix
                    </h2>
                    <p className="text-slate-500 font-medium tracking-tight">
                        Role-Based Access Control & Profile Harmonization
                    </p>
                </div>
                <div className="flex gap-x-3">
                    <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
                        <Plus className="h-4 w-4" />
                        Provision User
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="border-none glass futuristic-card bg-slate-900 text-white p-6 relative overflow-hidden">
                    <Users className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-blue-500/20" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Identities</p>
                    <h3 className="text-3xl font-black text-white">{users.length}</h3>
                </Card>
                <Card className="border-none glass futuristic-card p-6 border-blue-100 bg-blue-50/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">System Admins</p>
                    <h3 className="text-3xl font-black text-slate-900">{users.filter(u => u.role === 'admin').length}</h3>
                </Card>
                <Card className="border-none glass futuristic-card p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Active Faculty</p>
                    <h3 className="text-3xl font-black text-slate-900">{users.filter(u => u.role === 'teacher').length}</h3>
                </Card>
                <Card className="border-none glass futuristic-card p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Parent Nodes</p>
                    <h3 className="text-3xl font-black text-slate-900">{users.filter(u => u.role === 'parent').length}</h3>
                </Card>
            </div>

            <Card className="border-none glass futuristic-card overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-x-2">
                        <Key className="h-4 w-4 text-blue-400" />
                        Access Control Ledger
                    </h3>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search profiles or emails..."
                            className="pl-9 rounded-xl border-slate-200 bg-slate-50 text-slate-900 h-10 text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50/50">
                            <tr className="border-b">
                                <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-slate-400">
                                    Profile Signature
                                </th>
                                <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-slate-400">
                                    Network Alias
                                </th>
                                <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-slate-400">
                                    Clearance Level
                                </th>
                                <th className="text-right p-5 font-black uppercase tracking-widest text-[10px] text-slate-400">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredUsers.map((user) => (
                                <tr
                                    key={user.id}
                                    className="hover:bg-slate-50/50 transition-colors"
                                >
                                    <td className="p-5">
                                        <div className="flex items-center gap-x-3">
                                            <div className="h-10 w-10 shrink-0 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xs neon-blue">
                                                {user.first_name?.[0] || 'U'}{user.last_name?.[0] || ''}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">
                                                    {user.first_name} {user.last_name}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    ID: {user.id.substring(0, 8)}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{user.email}</span>
                                    </td>
                                    <td className="p-5">
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] uppercase font-black tracking-widest rounded-md px-3 py-1 ${user.role === 'admin'
                                                    ? "text-blue-500 border-blue-200 bg-blue-50"
                                                    : user.role === 'teacher'
                                                        ? "text-emerald-500 border-emerald-200 bg-emerald-50"
                                                        : "text-slate-500 border-slate-200 bg-slate-50"
                                                }`}
                                        >
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="p-5 text-right flex items-center justify-end gap-x-2">
                                        <Button variant="ghost" size="sm" className="rounded-xl font-black text-xs text-blue-500 hover:bg-blue-50">MANAGE PERMISSIONS</Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-slate-500 text-sm font-medium">
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
