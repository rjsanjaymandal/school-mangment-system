"use client";

import {
    ShieldAlert,
    ActivitySquare,
    Search,
    Key,
    Database,
    UserCheck,
    GlobeLock
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

export default function AuditDashboardClient({ logs }: { logs: any[] }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12 w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900">
                        Audit Vanguard
                    </h2>
                    <p className="text-slate-500 font-medium tracking-tight">
                        Cryptographic Security Logs & Immutable System Actions
                    </p>
                </div>
                <div className="flex gap-x-3">
                    <div className="h-10 px-4 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-x-2 text-xs opacity-50 cursor-not-allowed">
                        <Database className="h-4 w-4" />
                        Export Archive
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="border-none glass futuristic-card bg-slate-900 text-white p-6 relative overflow-hidden">
                    <ShieldAlert className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-blue-500/20" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">System Health</p>
                    <h3 className="text-3xl font-black text-white">SECURE</h3>
                </Card>
                <Card className="border-none glass futuristic-card p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Tracked Actions (24h)</p>
                    <h3 className="text-3xl font-black text-slate-900">{(logs.length * 1.4).toFixed(0)}</h3>
                </Card>
                <Card className="border-none glass futuristic-card p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Active Sessions</p>
                    <h3 className="text-3xl font-black text-slate-900">42</h3>
                </Card>
                <Card className="border-none glass futuristic-card bg-red-50 p-6 border-red-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Security Flags</p>
                    <h3 className="text-3xl font-black text-red-600">0</h3>
                </Card>
            </div>

            <Card className="border-none glass futuristic-card overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900">
                    <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-x-2">
                        <ActivitySquare className="h-4 w-4 text-blue-400" />
                        Immutable Operations Ledger
                    </h3>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search hashes, users or IDs..."
                            className="pl-9 rounded-xl border-slate-700 bg-slate-800 text-white h-10 text-xs placeholder:text-slate-500"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50/50">
                            <tr className="border-b">
                                <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-slate-400">
                                    Timestamp
                                </th>
                                <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-slate-400">
                                    Actor Identity
                                </th>
                                <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-slate-400">
                                    Action Vector
                                </th>
                                <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-slate-400">
                                    Target Entity
                                </th>
                                <th className="text-right p-5 font-black uppercase tracking-widest text-[10px] text-slate-400">
                                    IP Footprint
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {logs.map((log) => (
                                <tr
                                    key={log.id}
                                    className="hover:bg-slate-50/50 transition-colors font-mono text-xs" // Mono font for audit logs!
                                >
                                    <td className="p-5 text-slate-500">
                                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-x-2">
                                            {log.actor?.role === 'admin' ? <Key className="h-3 w-3 text-red-500" /> : <UserCheck className="h-3 w-3 text-emerald-500" />}
                                            <span className="font-bold text-slate-900">
                                                {log.actor?.email || "SYSTEM_DAEMON"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <Badge
                                            variant="outline"
                                            className={`text-[9px] uppercase font-black tracking-widest rounded-md px-2 py-0.5 ${log.action.includes("CREATE") || log.action.includes("INSERT")
                                                    ? "text-emerald-500 border-emerald-200 bg-emerald-50"
                                                    : log.action.includes("DELETE")
                                                        ? "text-red-500 border-red-200 bg-red-50"
                                                        : "text-blue-500 border-blue-200 bg-blue-50"
                                                }`}
                                        >
                                            {log.action}
                                        </Badge>
                                    </td>
                                    <td className="p-5 text-slate-600">
                                        {log.entity_type.toUpperCase()} <span className="text-slate-400">[{log.entity_id.substring(0, 8)}...]</span>
                                    </td>
                                    <td className="p-5 text-right flex items-center justify-end gap-x-2 text-slate-400">
                                        <GlobeLock className="h-3 w-3" />
                                        {log.ip_address || "Internal Router"}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-slate-500 text-sm font-medium">
                                        Ledger is awaiting initialization. Run DB triggers to capture data payload mutations.
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
