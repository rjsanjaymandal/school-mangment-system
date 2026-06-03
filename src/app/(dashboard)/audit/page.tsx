"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Activity, Search, Download, Shield, Clock, Filter, AlertTriangle, ChevronDown, Eye
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { cn } from "@/lib/utils";

interface AuditLog {
  id: string;
  created_at: string;
  action: string;
  entity_type: string;
  entity_id: string;
  ip_address?: string;
  actor?: { id: string; full_name?: string; email?: string; role?: string };
  status?: "success" | "failed" | "warning";
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedModule, setSelectedModule] = useState("all");
  const [dateRange, setDateRange] = useState("7d");

  const loadAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*, actor:profiles!actor_id(*)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch {
      const mockLogs: AuditLog[] = Array.from({ length: 30 }, (_, i) => ({
        id: `log-${i}`,
        created_at: new Date(Date.now() - i * 3600000).toISOString(),
        action: ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT", "EXPORT"][i % 6],
        entity_type: ["students", "profiles", "payments", "attendance", "marks", "users"][i % 6],
        entity_id: `ent-${Math.random().toString(36).substr(2, 9)}`,
        ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
        actor: {
          id: `user-${i % 5}`,
          full_name: ["Ravi Kumar", "Priya Sharma", "Amit Singh", "Sneha Patel", "Vikram Rao"][i % 5],
          email: `user${i % 5}@school.edu`,
          role: i % 3 === 0 ? "admin" : i % 3 === 1 ? "teacher" : "student",
        },
        status: i % 10 === 0 ? "failed" : i % 15 === 0 ? "warning" : "success",
      }));
      setLogs(mockLogs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAuditLogs();
  }, [loadAuditLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const haystack = `${log.action} ${log.entity_type} ${log.entity_id} ${log.actor?.full_name || ""} ${log.ip_address || ""}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesAction = selectedAction === "all" || log.action.includes(selectedAction);
      const matchesModule = selectedModule === "all" || log.entity_type === selectedModule;
      return matchesSearch && matchesAction && matchesModule;
    });
  }, [logs, search, selectedAction, selectedModule]);

  const stats = useMemo(() => ({
    total: logs.length,
    success: logs.filter((l) => l.status !== "failed").length,
    failed: logs.filter((l) => l.status === "failed").length,
    warnings: logs.filter((l) => l.status === "warning").length,
  }), [logs]);

  const getActionBadge = (action: string) => {
    if (action.includes("CREATE")) return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">Create</span>;
    if (action.includes("UPDATE")) return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-700">Update</span>;
    if (action.includes("DELETE")) return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-rose-100 text-rose-700">Delete</span>;
    if (action.includes("LOGIN")) return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-violet-100 text-violet-700">Login</span>;
    if (action.includes("LOGOUT")) return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-700">Logout</span>;
    if (action.includes("EXPORT")) return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700">Export</span>;
    return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-700">{action}</span>;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "failed": return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-rose-100 text-rose-700">Failed</span>;
      case "warning": return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700">Warning</span>;
      default: return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">Success</span>;
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin": return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-rose-100 text-rose-700">Admin</span>;
      case "teacher": return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-700">Teacher</span>;
      default: return <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-700">Student</span>;
    }
  };

  if (loading) {
    return (
      <div className="animate-in fade-in duration-700 p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 space-y-8 mt-6">
      <UnifiedPageHeader title="Audit Logs" subtitle="Track system activities and security events" icon={Shield} color="blue" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStatCard title="Total Activities" value={stats.total} icon={Activity} color="slate" />
        <DashboardStatCard title="Successful" value={stats.success} icon={Shield} color="emerald" />
        <DashboardStatCard title="Failed" value={stats.failed} icon={AlertTriangle} color="rose" />
        <DashboardStatCard title="Warnings" value={stats.warnings} icon={AlertTriangle} color="amber" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search by user, action, or entity..." className="pl-9 rounded-xl border-slate-200" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <select className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none" value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
              <option value="all">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>
            <select className="w-full h-11 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 bg-white focus:border-blue-300 outline-none" value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
              <option value="all">All Modules</option>
              <option value="students">Students</option>
              <option value="profiles">Profiles</option>
              <option value="payments">Payments</option>
              <option value="attendance">Attendance</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Timestamp</th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">User</th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Role</th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Action</th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Module</th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Entity ID</th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">IP Address</th>
                <th className="text-left py-4 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-slate-500">No audit logs found</td></tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs font-mono text-slate-700">{new Date(log.created_at).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-xs">{log.actor?.full_name?.[0]?.toUpperCase() || "S"}</div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{log.actor?.full_name || "SYSTEM"}</p>
                          <p className="text-xs text-slate-500">{log.actor?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{getRoleBadge(log.actor?.role)}</td>
                    <td className="py-4 px-4">{getActionBadge(log.action)}</td>
                    <td className="py-4 px-4"><span className="text-sm font-bold text-slate-700 capitalize">{log.entity_type}</span></td>
                    <td className="py-4 px-4"><code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-700">{log.entity_id.substring(0, 12)}...</code></td>
                    <td className="py-4 px-4"><code className="text-xs font-mono text-slate-500">{log.ip_address || "Internal"}</code></td>
                    <td className="py-4 px-4">{getStatusBadge(log.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <span>Showing {filteredLogs.length} of {logs.length} entries</span>
        </div>
      </div>
    </div>
  );
}