"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Download, Filter, Calendar, User, 
  Eye, Pencil, Trash2, LogIn, LogOut, Settings,
  AlertCircle, CheckCircle, Clock
} from "lucide-react";
import { useState } from "react";

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  user_name: string;
  timestamp: string;
  ip_address: string;
  details?: string;
  status: "success" | "failed" | "warning";
}

const MOCK_LOGS: AuditLog[] = [
  { id: "1", action: "LOGIN", entity_type: "auth", entity_id: "usr-001", user_id: "usr-001", user_name: "Admin User", timestamp: "2025-05-05 10:30:45", ip_address: "192.168.1.100", status: "success" },
  { id: "2", action: "CREATE", entity_type: "student", entity_id: "sms-045", user_id: "usr-002", user_name: "Clerk Sharma", timestamp: "2025-05-05 10:25:12", ip_address: "192.168.1.101", details: "Added new student: Rahul Kumar", status: "success" },
  { id: "3", action: "UPDATE", entity_type: "fee", entity_id: "fee-023", user_id: "usr-003", user_name: "Accountant Singh", timestamp: "2025-05-05 10:20:33", ip_address: "192.168.1.102", details: "Modified fee structure for Class 10", status: "success" },
  { id: "4", action: "DELETE", entity_type: "staff", entity_id: "stf-012", user_id: "usr-001", user_name: "Admin User", timestamp: "2025-05-05 09:55:18", ip_address: "192.168.1.100", details: "Removed staff record: John Doe", status: "warning" },
  { id: "5", action: "LOGIN_FAILED", entity_type: "auth", entity_id: "usr-unknown", user_id: "unknown", user_name: "Unknown", timestamp: "2025-05-05 09:30:22", ip_address: "10.0.0.55", details: "Invalid credentials attempt", status: "failed" },
  { id: "6", action: "EXPORT", entity_type: "report", entity_id: "rpt-001", user_id: "usr-002", user_name: "Clerk Sharma", timestamp: "2025-05-05 09:15:44", ip_address: "192.168.1.101", details: "Exported attendance report", status: "success" },
  { id: "7", action: "PERMISSION_CHANGE", entity_type: "user_roles", entity_id: "usr-005", user_id: "usr-001", user_name: "Admin User", timestamp: "2025-05-05 08:45:11", ip_address: "192.168.1.100", details: "Assigned Teacher role to user", status: "success" },
  { id: "8", action: "BULK_IMPORT", entity_type: "students", entity_id: "import-023", user_id: "usr-003", user_name: "Accountant Singh", timestamp: "2025-05-04 16:20:00", ip_address: "192.168.1.102", details: "Imported 45 student records", status: "success" },
  { id: "9", action: "PAYMENT_RECEIVED", entity_type: "payment", entity_id: "pmt-156", user_id: "usr-003", user_name: "Accountant Singh", timestamp: "2025-05-04 15:30:22", ip_address: "192.168.1.102", details: "Fee payment: ₹15,000", status: "success" },
  { id: "10", action: "SETTINGS_CHANGE", entity_type: "school_settings", entity_id: "set-001", user_id: "usr-001", user_name: "Admin User", timestamp: "2025-05-04 14:00:00", ip_address: "192.168.1.100", details: "Updated academic year settings", status: "success" },
];

const ACTION_ICONS: Record<string, any> = {
  LOGIN: LogIn,
  LOGOUT: LogOut,
  CREATE: CheckCircle,
  UPDATE: Pencil,
  DELETE: Trash2,
  EXPORT: Download,
  LOGIN_FAILED: AlertCircle,
  PERMISSION_CHANGE: Settings,
  BULK_IMPORT: Download,
  PAYMENT_RECEIVED: CheckCircle,
  SETTINGS_CHANGE: Settings,
};

const STATUS_COLORS = {
  success: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
};

export function AuditLogViewer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateRange, setDateRange] = useState("7d");

  const filteredLogs = MOCK_LOGS.filter(log => {
    const matchesSearch = log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.entity_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.details?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by user, entity, or details..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 rounded-md"
          />
        </div>
        
        <select 
          className="h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none"
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
        >
          <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Actions</option>
          <option value="LOGIN" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Login/Logout</option>
          <option value="CREATE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Create</option>
          <option value="UPDATE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Update</option>
          <option value="DELETE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Delete</option>
          <option value="PAYMENT" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Payments</option>
        </select>

        <select 
          className="h-10 px-3 rounded-md border border-slate-200 dark:border-slate-800 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none"
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
        >
          <option value="1d" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Today</option>
          <option value="7d" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Last 7 days</option>
          <option value="30d" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Last 30 days</option>
          <option value="90d" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Last 90 days</option>
        </select>

        <Button variant="outline" className="rounded-md">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Actions</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">1,247</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Active Users</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">23</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Warnings</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">12</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Failed Attempts</p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-white">3</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Entity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">IP Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map(log => {
                  const IconComponent = ACTION_ICONS[log.action] || Eye;
                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-slate-400" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">{log.user_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{log.entity_type}</span>
                        <span className="text-xs text-slate-400 ml-1">#{log.entity_id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-600 dark:text-slate-400 max-w-[200px] truncate block">
                          {log.details || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-500 dark:text-slate-400">{log.timestamp}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">{log.ip_address}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={STATUS_COLORS[log.status]}>{log.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}