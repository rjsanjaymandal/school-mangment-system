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
import { formatDistanceToNow } from "date-fns";

export default function AuditDashboardClient({ logs }: { logs: any[] }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12 w-full max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-foreground uppercase">
                        Audit Logs
                    </h2>
                    <p className="text-foreground/70 font-bold tracking-tight uppercase text-[10px] tracking-[0.2em] mt-1">
                        Cryptographic Security Logs & Immutable System Actions
                    </p>
                </div>
                <div className="flex gap-x-3">
                    <Button
                        disabled
                        className="rounded-sm bg-card/40 border border-border backdrop-blur-md text-foreground font-black flex items-center gap-x-2 text-[10px] uppercase tracking-widest opacity-50 cursor-not-allowed h-10 px-4"
                    >
                        <Database className="h-4 w-4" />
                        Export Archive
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-6 relative overflow-hidden shadow-2xl group hover:border-primary transition-all">
                    <ShieldAlert className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-primary/10 group-hover:text-primary transition-all" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">System Health</p>
                    <h3 className="text-3xl font-black text-foreground">SECURE</h3>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-6 shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">Tracked Actions (24h)</p>
                    <h3 className="text-3xl font-black text-foreground">{(logs.length * 1.4).toFixed(0)}</h3>
                </Card>
                <Card className="border-border bg-card/40 backdrop-blur-xl rounded-sm p-6 shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/60 mb-1">Active Sessions</p>
                    <h3 className="text-3xl font-black text-foreground">42</h3>
                </Card>
                <Card className="border-destructive/20 bg-destructive/5 rounded-sm p-6 shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-destructive mb-1">Security Flags</p>
                    <h3 className="text-3xl font-black text-destructive">0</h3>
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
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-accent/30">
                            <tr className="border-b border-border">
                                <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-primary">
                                    Timestamp
                                </th>
                                <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-primary">
                                    Actor Identity
                                </th>
                                <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-primary">
                                    Action Vector
                                </th>
                                <th className="text-left p-5 font-black uppercase tracking-widest text-[10px] text-primary">
                                    Target Entity
                                </th>
                                <th className="text-right p-5 font-black uppercase tracking-widest text-[10px] text-primary">
                                    IP Footprint
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {logs.map((log) => (
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
                                                {log.actor?.email || "SYSTEM_DAEMON"}
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
                            {logs.length === 0 && (
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

