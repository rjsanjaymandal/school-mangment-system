"use client";

import { useMemo, useState } from "react";
import {
    ShieldAlert,
    ActivitySquare,
    Search,
    Key,
    Database,
    UserCheck,
    GlobeLock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export default function AuditDashboardClient({ logs }: { logs: any[] }) {
    const [search, setSearch] = useState("");

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const haystack = `${log.action} ${log.entity_type} ${log.entity_id} ${log.actor?.full_name || log.actor?.email || ""} ${log.ip_address || ""}`.toLowerCase();
            return haystack.includes(search.toLowerCase());
        });
    }, [logs, search]);

    const securityFlags = useMemo(() => {
        return logs.filter((log) => /(delete|revoke|fail|error|unauthorized)/i.test(log.action || "")).length;
    }, [logs]);

    const exportCsv = () => {
        const rows = [
            ["time", "user", "action", "module", "entity_id", "ip_address"],
            ...filteredLogs.map((log) => [
                log.created_at,
                log.actor?.full_name || log.actor?.email || "SYSTEM_DAEMON",
                log.action,
                log.entity_type,
                log.entity_id,
                log.ip_address || "Internal Router",
            ]),
        ];

        const csv = rows
            .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "audit-log-export.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12 w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground uppercase">
                        Audit Logs
                    </h2>
                    <p className="text-muted-foreground font-bold tracking-widest uppercase text-[10px] mt-1">
                        System Activity Records and History
                    </p>
                </div>
                <div className="flex gap-x-3">
                    <Button
                        onClick={exportCsv}
                        className="rounded-sm bg-card/40 border border-border backdrop-blur-md text-foreground font-black flex items-center gap-x-2 text-[10px] uppercase tracking-widest h-10 px-4"
                    >
                        <Database className="h-4 w-4" />
                        Export Archive
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <Card className="border-primary/20 bg-primary/5 backdrop-blur-xl rounded-xl p-8 relative overflow-hidden shadow-sm group hover:border-primary transition-all">
                    <ShieldAlert className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-primary/10 group-hover:text-primary transition-all" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">System Integrity</p>
                    <h3 className="text-4xl font-bold text-foreground tracking-tight">PROTECTED</h3>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-xl p-8 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2">Activities (24h)</p>
                    <h3 className="text-4xl font-bold text-foreground tracking-tight">{filteredLogs.length}</h3>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-xl p-8 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-2">Tracked Users</p>
                    <h3 className="text-4xl font-bold text-foreground tracking-tight">{new Set(logs.map((log) => log.actor?.id || log.actor?.email || "system")).size}</h3>
                </Card>
                <Card className="border-destructive/20 bg-destructive/5 rounded-xl p-8 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-2">Security Flags</p>
                    <h3 className="text-4xl font-bold text-destructive tracking-tighter">{securityFlags}</h3>
                </Card>
            </div>

            <Card className="border-border bg-card/40 backdrop-blur-md rounded-sm overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-border flex items-center justify-between bg-accent/50">
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-x-2">
                        <ActivitySquare className="h-4 w-4 text-primary" />
                        Immutable Operations Ledger
                    </h3>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/40 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search hashes, users or IDs..."
                            className="pl-9 rounded-xs border-border bg-background/50 text-foreground h-10 text-xs placeholder:text-foreground/40 focus-visible:ring-primary"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-accent/30">
                            <tr className="border-b border-primary/10">
                                <th className="text-left p-6 font-bold uppercase tracking-widest text-[10px] text-primary">
                                    Time
                                </th>
                                <th className="text-left p-6 font-bold uppercase tracking-widest text-[10px] text-primary">
                                    User
                                </th>
                                <th className="text-left p-6 font-bold uppercase tracking-widest text-[10px] text-primary">
                                    Action
                                </th>
                                <th className="text-left p-6 font-bold uppercase tracking-widest text-[10px] text-primary">
                                    Module
                                </th>
                                <th className="text-right p-6 font-bold uppercase tracking-widest text-[10px] text-primary">
                                    IP Address
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredLogs.map((log) => (
                                <tr
                                    key={log.id}
                                    className="hover:bg-accent/20 border-b border-border transition-colors font-mono text-xs group"
                                >
                                    <td className="p-5 text-foreground/80">
                                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-x-2">
                                            {log.actor?.role === 'admin' ? <Key className="h-3 w-3 text-destructive" /> : <UserCheck className="h-3 w-3 text-primary" />}
                                            <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                                                {log.actor?.full_name || log.actor?.email || "SYSTEM_DAEMON"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <Badge
                                            className={cn(
                                                "text-[9px] uppercase font-black tracking-widest rounded-xs px-2 py-0.5 shadow-lg",
                                                log.action.includes("CREATE") || log.action.includes("INSERT")
                                                    ? "bg-primary text-primary-foreground emerald-glow"
                                                    : log.action.includes("DELETE")
                                                        ? "bg-destructive text-destructive-foreground"
                                                        : "bg-foreground/20 text-foreground"
                                            )}
                                        >
                                            {log.action}
                                        </Badge>
                                    </td>
                                    <td className="p-5 text-foreground/90">
                                        <span className="font-bold">{log.entity_type.toUpperCase()}</span> <span className="text-foreground/40">[{log.entity_id.substring(0, 8)}...]</span>
                                    </td>
                                    <td className="p-5 text-right flex items-center justify-end gap-x-2 text-foreground/60">
                                        <GlobeLock className="h-3 w-3 text-primary/60" />
                                        {log.ip_address || "Internal Router"}
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-foreground/50 text-xs font-bold uppercase tracking-widest">
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

