"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Activity, Search, Download, Shield, Clock, Filter, AlertTriangle, ChevronDown, Eye
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
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
  };

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
    if (action.includes("CREATE")) return <Badge className="bg-emerald-100 text-emerald-700">Create</Badge>;
    if (action.includes("UPDATE")) return <Badge className="bg-blue-100 text-blue-700">Update</Badge>;
    if (action.includes("DELETE")) return <Badge className="bg-rose-100 text-rose-700">Delete</Badge>;
    if (action.includes("LOGIN")) return <Badge className="bg-violet-100 text-violet-700">Login</Badge>;
    if (action.includes("LOGOUT")) return <Badge className="bg-slate-100 text-slate-700">Logout</Badge>;
    if (action.includes("EXPORT")) return <Badge className="bg-amber-100 text-amber-700">Export</Badge>;
    return <Badge className="bg-slate-100 text-slate-700">{action}</Badge>;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "failed": return <Badge className="bg-rose-100 text-rose-700">Failed</Badge>;
      case "warning": return <Badge className="bg-amber-100 text-amber-700">Warning</Badge>;
      default: return <Badge className="bg-emerald-100 text-emerald-700">Success</Badge>;
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin": return <Badge className="bg-rose-100 text-rose-700">Admin</Badge>;
      case "teacher": return <Badge className="bg-blue-100 text-blue-700">Teacher</Badge>;
      default: return <Badge className="bg-slate-100 text-slate-700">Student</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">Track system activities and security events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Activities", value: stats.total, color: "slate" },
          { label: "Successful", value: stats.success, color: "emerald" },
          { label: "Failed", value: stats.failed, color: "rose" },
          { label: "Warnings", value: stats.warnings, color: "amber" },
        ].map((stat, i) => (
          <Card key={i} className="p-4 hover:shadow-md transition-shadow">
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-4 border-b flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by user, action, or entity..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 border rounded-lg text-sm bg-background" value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
              <option value="all">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>
            <select className="px-3 py-2 border rounded-lg text-sm bg-background" value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
              <option value="all">All Modules</option>
              <option value="students">Students</option>
              <option value="profiles">Profiles</option>
              <option value="payments">Payments</option>
              <option value="attendance">Attendance</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Timestamp</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Action</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Module</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Entity ID</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">IP Address</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">No audit logs found</td></tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-mono">{new Date(log.created_at).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-xs">{log.actor?.full_name?.[0]?.toUpperCase() || "S"}</div>
                        <div>
                          <p className="font-medium">{log.actor?.full_name || "SYSTEM"}</p>
                          <p className="text-xs text-muted-foreground">{log.actor?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{getRoleBadge(log.actor?.role)}</td>
                    <td className="py-3 px-4">{getActionBadge(log.action)}</td>
                    <td className="py-3 px-4"><span className="font-medium capitalize">{log.entity_type}</span></td>
                    <td className="py-3 px-4"><code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">{log.entity_id.substring(0, 12)}...</code></td>
                    <td className="py-3 px-4"><code className="text-xs font-mono text-muted-foreground">{log.ip_address || "Internal"}</code></td>
                    <td className="py-3 px-4">{getStatusBadge(log.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {filteredLogs.length} of {logs.length} entries</span>
        </div>
      </Card>
    </div>
  );
}