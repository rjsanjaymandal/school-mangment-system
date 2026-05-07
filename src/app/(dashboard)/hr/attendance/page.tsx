"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, CheckCircle, XCircle, Clock, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ERPCard } from "@/components/ui/erp-card";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "present", label: "Present", icon: CheckCircle, color: "text-emerald-600 bg-emerald-100" },
  { value: "absent", label: "Absent", icon: XCircle, color: "text-red-600 bg-red-100" },
  { value: "on_leave", label: "On Leave", icon: Clock, color: "text-amber-600 bg-amber-100" },
  { value: "late", label: "Late", icon: Clock, color: "text-orange-600 bg-orange-100" },
  { value: "half_day", label: "Half Day", icon: Clock, color: "text-blue-600 bg-blue-100" },
];

interface StaffAttendance {
  id: string;
  staff_id: string;
  staff_name: string;
  staff_designation: string;
  date: string;
  status: string | null;
  notes: string;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getInitials(name: string): string {
  const parts = name.split(" ");
  return parts.map(p => p.charAt(0)).join("").substring(0, 2).toUpperCase();
}

export default function StaffAttendancePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, Record<string, string>>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStaffAndAttendance();
  }, [selectedDate]);

  async function loadStaffAndAttendance() {
    setLoading(true);
    try {
      // Get teaching staff
      const { data: staffData } = await supabase
        .from("staff")
        .select(`
          id,
          staff_id,
          first_name,
          last_name,
          designations(name)
        `)
        .eq("staff_type", "teaching")
        .eq("status", "active")
        .order("first_name");

      // Get today's attendance
      const { data: todayAttendance } = await supabase
        .from("staff_attendance")
        .select("*")
        .eq("date", selectedDate);

      const attendanceMap: Record<string, Record<string, string>> = {};
      const staffAttendance: Record<string, string> = {};

      todayAttendance?.forEach((att: any) => {
        staffAttendance[att.staff_id] = att.status;
      });

      staffData?.forEach((s: any) => {
        attendanceData[s.id] = staffAttendance;
      });

      setStaffList(staffData || []);
      setAttendanceData(prev => ({ ...prev, [selectedDate]: staffAttendance }));
    } catch (error) {
      console.error("Error loading staff:", error);
    } finally {
      setLoading(false);
    }
  }

  async function markAttendance(staffId: string, status: string) {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("staff_attendance")
        .upsert({
          staff_id: staffId,
          date: selectedDate,
          status: status,
          marked_by: user?.id,
          notes: null
        }, { onConflict: "staff_id,date" });

      if (error) throw error;

      // Update local state
      setAttendanceData(prev => ({
        ...prev,
        [selectedDate]: {
          ...prev[selectedDate],
          [staffId]: status
        }
      }));

      if (status === "absent" || status === "on_leave") {
        toast.success(`Marked ${status}. Proxy teacher will be auto-assigned.`);
      } else {
        toast.success(`Attendance marked as ${status}`);
      }

      // Trigger revalidation to update timetable proxies
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to mark attendance");
    } finally {
      setSaving(false);
    }
  }

  const currentDayAttendance = attendanceData[selectedDate] || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff Attendance</h1>
          <p className="text-muted-foreground">Mark daily attendance - affects timetable proxies</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border rounded-md"
          />
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span className="text-sm">Present</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {Object.values(currentDayAttendance).filter(s => s === "present").length}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm">Absent</span>
          </div>
          <p className="text-2xl font-bold text-red-700 mt-1">
            {Object.values(currentDayAttendance).filter(s => s === "absent").length}
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <span className="text-sm">On Leave</span>
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">
            {Object.values(currentDayAttendance).filter(s => s === "on_leave").length}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span className="text-sm">Late</span>
          </div>
          <p className="text-2xl font-bold text-orange-700 mt-1">
            {Object.values(currentDayAttendance).filter(s => s === "late").length}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <span className="text-sm">Total Staff</span>
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{staffList.length}</p>
        </div>
      </div>

      {/* Staff Attendance Grid */}
      <ERPCard accentColor="emerald">
        <CardHeader className="border-b">
          <CardTitle>Mark Attendance - {selectedDate}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading staff...</div>
          ) : staffList.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No teaching staff found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {staffList.map((staff: any) => {
                const currentStatus = currentDayAttendance[staff.id];
                return (
                  <div 
                    key={staff.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                        {getInitials(`${staff.first_name} ${staff.last_name}`)}
                      </div>
                      <div>
                        <p className="font-medium">{staff.first_name} {staff.last_name}</p>
                        <p className="text-xs text-muted-foreground">{staff.designations?.name || "Teacher"}</p>
                      </div>
                    </div>

                    {currentStatus ? (
                      <div className="space-y-2">
                        <div className={`px-3 py-2 rounded-md text-center font-medium ${
                          currentStatus === "present" ? "bg-emerald-100 text-emerald-700" :
                          currentStatus === "absent" ? "bg-red-100 text-red-700" :
                          currentStatus === "on_leave" ? "bg-amber-100 text-amber-700" :
                          currentStatus === "late" ? "bg-orange-100 text-orange-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {STATUS_OPTIONS.find(s => s.value === currentStatus)?.label || currentStatus}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => markAttendance(staff.id, "")}
                        >
                          Clear / Change
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {STATUS_OPTIONS.slice(0, 3).map((option) => (
                          <Button
                            key={option.value}
                            variant="outline"
                            size="sm"
                            className={`text-xs ${option.color}`}
                            onClick={() => markAttendance(staff.id, option.value)}
                            disabled={saving}
                          >
                            {option.label.substring(0, 4)}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </ERPCard>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Auto-Substitution Active</p>
            <p className="text-sm text-blue-700">
              When you mark a teacher as "Absent" or "On Leave", the system automatically 
              searches for a substitute teacher with matching expertise and assigns them 
              to today's timetable slots. The timetable will update instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}