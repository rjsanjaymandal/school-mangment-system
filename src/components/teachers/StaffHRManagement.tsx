"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Briefcase,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Filter,
  Search,
  IndianRupee,
  Shovel,
  TrendingUp,
  UserCheck,
  Save,
  ShieldCheck,
  Activity,
  Zap,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { markStaffAttendance } from "@/app/actions/staff-attendance";
import { toast } from "sonner";

interface LeaveRequest {
  id: string;
  staff_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  staff?: {
    full_name: string;
  };
}

interface StaffPayroll {
  id: string;
  staff_id: string;
  base_salary: number;
  bonuses: number;
  deductions: number;
  net_pay: number;
  month: number;
  year: number;
  status: string;
}

export function StaffHRManagement({ 
  leaveRequests = [], 
  payrolls = [],
  staff = [],
  staffCount = 0,
  userRole,
  currentUserId
}: { 
  leaveRequests?: LeaveRequest[];
  payrolls?: StaffPayroll[];
  staff?: any[];
  staffCount?: number;
  userRole?: string | null;
  currentUserId?: string;
}) {
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>(
    staff.reduce((acc, s) => ({ ...acc, [s.id]: 'present' }), {})
  );
  const [isSaving, setIsSaving] = useState(false);
  const isAdminOrTeacher = userRole === "admin" || userRole === "teacher";
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
  const totalPayout = payrolls.reduce((acc, curr) => acc + (curr.net_pay || 0), 0);
  const paidCount = payrolls.filter(p => p.status === 'paid').length;

  if (!isAdminOrTeacher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 animate-in fade-in transition-all duration-1000 reveal-1">
        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <XCircle className="h-8 w-8" />
        </div>
        <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Access Denied
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4" /> 
              You don't have permission to view Staff HR components.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in transition-all duration-1000">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-x-4">
            <div className="h-12 w-12 bg-primary/10 flex items-center justify-center text-primary rounded-lg">
                <Users className="h-6 w-6" />
            </div>
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Staff & HR Management
                </h2>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mt-1">
                    <Activity className="h-4 w-4" /> 
                    Manage staff attendance, leaves, and payroll
                </p>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <Button variant="outline" className="h-10 px-4 font-medium transition-all gap-2">
                <Download className="h-4 w-4" /> Export HR Data
            </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 reveal-2">
        {/* Metric Node 1 */}
        <div className="border border-border bg-card p-6 rounded-xl shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Briefcase className="h-24 w-24 text-primary" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Total Staff</p>
            <div className="flex items-baseline gap-4">
                <h3 className="text-3xl font-bold text-foreground">
                    {staffCount.toString().padStart(2, '0')}
                </h3>
                <div className={cn(
                    "px-2.5 py-0.5 text-[10px] font-semibold rounded-full uppercase",
                    pendingLeaves.length === 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-red-50 text-red-600 border border-red-200"
                )}>
                    {pendingLeaves.length === 0 ? "Stable" : "Action Needed"}
                </div>
            </div>
            <p className="text-xs font-semibold text-muted-foreground mt-4 flex items-center gap-2">
               <Activity className="h-3.5 w-3.5" /> Data Verified
            </p>
        </div>

        {/* Metric Node 2 */}
        <div className="border border-border bg-card p-6 rounded-xl shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Clock className="h-24 w-24 text-primary" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Leave Requests</p>
            <h3 className="text-3xl font-bold text-foreground">
                {pendingLeaves.length.toString().padStart(2, '0')}
            </h3>
            <p className="text-xs font-semibold text-muted-foreground mt-4 flex items-center gap-2">
               <FileText className="h-3.5 w-3.5" /> Pending Approval
            </p>
        </div>

        {/* Metric Node 3 */}
        <div className="border border-border bg-card p-6 rounded-xl shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="h-24 w-24 text-primary" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Payroll Status</p>
            <h3 className="text-3xl font-bold text-foreground">
                {paidCount} <span className="text-muted-foreground text-xl font-medium">/ {payrolls.length || staffCount}</span>
            </h3>
            <p className="text-xs font-semibold text-muted-foreground mt-4 flex items-center gap-2">
               <CheckCircle2 className="h-3.5 w-3.5" /> Processed This Month
            </p>
        </div>
      </div>

      <Tabs defaultValue="attendance" className="space-y-6">
        <div className="flex justify-between items-center gap-6">
            <TabsList className="bg-muted p-1 rounded-sm h-11 w-full justify-start overflow-x-auto">
                <TabsTrigger value="attendance" className="text-sm font-medium px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                    <UserCheck className="h-4 w-4 mr-2" /> Attendance
                </TabsTrigger>
                <TabsTrigger value="leave" className="text-sm font-medium px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                    <Calendar className="h-4 w-4 mr-2" /> Leave Requests
                </TabsTrigger>
                <TabsTrigger value="payouts" className="text-sm font-medium px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                    <Briefcase className="h-4 w-4 mr-2" /> Payroll
                </TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="attendance" className="animate-in slide-in-from-bottom-2 mt-0 outline-none space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-6 p-6 border border-border bg-card/40 rounded-sm">
              <div>
                <h4 className="text-base font-semibold text-foreground">Staff Attendance</h4>
                <p className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Date: {new Date().toLocaleDateString()}
                </p>
              </div>
              <Button 
                onClick={async () => {
                  setIsSaving(true);
                  const res = await markStaffAttendance({
                    date: new Date().toISOString().split('T')[0],
                    marked_by: currentUserId || 'system',
                    records: Object.entries(attendanceRecords).map(([id, status]) => ({
                      staff_id: id,
                      status
                    }))
                  });
                  setIsSaving(false);
                  if (res.success) toast.success("Attendance updated successfully");
                  else toast.error(res.error || "Failed to update attendance");
                }}
                disabled={isSaving}
                className="h-10 px-6 font-medium transition-all"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Attendance"}
              </Button>
          </div>

          <div className="border border-border bg-card/40 rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="py-3 px-6 text-sm font-semibold text-muted-foreground">Staff Member</th>
                  <th className="py-3 px-6 text-sm font-semibold text-muted-foreground text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staff.map((s) => (
                  <tr key={s.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 flex items-center justify-center font-bold text-white text-sm rounded-full bg-primary/20 border border-primary/20">
                            {s.full_name?.[0] || "?"}
                        </div>
                        <div>
                            <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors block">{s.full_name}</span>
                            <span className="text-xs font-medium text-muted-foreground mt-1 block font-mono">ID: {s.id.split('-')[0]}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-2">
                        {['present', 'absent', 'late', 'half_day'].map((status) => (
                          <button
                            key={status}
                            onClick={() => setAttendanceRecords(prev => ({ ...prev, [s.id]: status }))}
                            className={cn(
                                "px-3 py-1.5 rounded-sm text-xs font-semibold uppercase transition-all",
                                attendanceRecords[s.id] === status
                                    ? "bg-primary text-white"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                          >
                            {status.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="leave" className="animate-in slide-in-from-bottom-2 mt-0 outline-none space-y-6">
          <div className="border border-border bg-card/40 rounded-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-border bg-muted/50">
                            <th className="px-6 py-3 text-sm font-semibold text-muted-foreground">Staff Member</th>
                            <th className="px-6 py-3 text-sm font-semibold text-muted-foreground">Type</th>
                            <th className="px-6 py-3 text-sm font-semibold text-muted-foreground">Duration</th>
                            <th className="px-6 py-3 text-sm font-semibold text-muted-foreground">Reason</th>
                            <th className="px-6 py-3 text-sm font-semibold text-muted-foreground text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {leaveRequests.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-24 text-center">
                                    <div className="flex flex-col items-center">
                                        <Clock className="h-10 w-10 mb-4 text-muted-foreground opacity-20" />
                                        <p className="text-sm font-medium text-muted-foreground">No leave requests found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            leaveRequests.map((leave) => (
                                <tr key={leave.id} className="group hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{leave.staff?.full_name || "Unknown Staff"}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="text-xs font-semibold capitalize">
                                            {leave.leave_type}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-foreground/80 truncate max-w-[200px]">
                                        {leave.reason}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {leave.status === 'pending' ? (
                                            <div className="flex justify-end gap-x-2">
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border",
                                                leave.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"
                                            )}>
                                                <span>{leave.status}</span>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
          </div>
        </TabsContent>

        <TabsContent value="payouts" className="animate-in slide-in-from-bottom-2 mt-0 outline-none space-y-6">
          <div className="relative group bg-card border border-border p-12 overflow-hidden rounded-xl shadow-sm text-center flex flex-col items-center">
            <div className="absolute -right-4 -top-4 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
              <IndianRupee className="h-48 w-48 text-primary" />
            </div>

            <div className="relative z-10 flex flex-col items-center space-y-8">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Briefcase className="h-10 w-10" />
                </div>
                
                <div className="space-y-2">
                    <h3 className="text-4xl font-bold tracking-tight text-foreground">
                        Payroll Processing
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground">Manage and disburse staff salaries.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-2xl py-8 border-y border-border">
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-muted-foreground uppercase">Total Payout</p>
                        <p className="text-4xl font-bold text-foreground">₹{totalPayout.toLocaleString()}</p>
                    </div>
                    <div className="space-y-2 border-l border-border pl-12">
                        <p className="text-sm font-semibold text-muted-foreground uppercase">Staff Count</p>
                        <p className="text-4xl font-bold text-foreground">{payrolls.length || staffCount}</p>
                    </div>
                </div>

                <div className="max-w-xl pb-4">
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                        Automatic calculation based on attendance and performance. Please review all leaves before processing payroll.
                    </p>
                </div>

                <Button className="h-12 px-8 font-medium transition-all gap-2">
                    Process Payroll
                    <TrendingUp className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
