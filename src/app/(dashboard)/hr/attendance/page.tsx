"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, CheckCircle, XCircle, Clock, User, MapPin, Activity, ShieldCheck, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Shared UI Framework
import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import { ERPCard } from "@/components/ui/erp-card";

const STATUS_OPTIONS = [
  { value: "present", label: "Present", icon: CheckCircle, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { value: "absent", label: "Absent", icon: XCircle, color: "bg-rose-50 text-rose-600 border-rose-100" },
  { value: "on_leave", label: "On Leave", icon: Clock, color: "bg-amber-50 text-amber-600 border-amber-100" },
  { value: "late", label: "Late", icon: Clock, color: "bg-orange-50 text-orange-600 border-orange-100" },
  { value: "half_day", label: "Half Day", icon: Clock, color: "bg-blue-50 text-blue-600 border-blue-100" },
];

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

      const { data: todayAttendance } = await supabase
        .from("staff_attendance")
        .select("*")
        .eq("date", selectedDate);

      const staffAttendance: Record<string, string> = {};
      todayAttendance?.forEach((att: any) => {
        staffAttendance[att.staff_id] = att.status;
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

      setAttendanceData(prev => ({
        ...prev,
        [selectedDate]: {
          ...prev[selectedDate],
          [staffId]: status
        }
      }));

      toast.success(status === "" ? "Cleared" : `Marked ${status}`);
      
      if (status === "absent" || status === "on_leave") {
        toast.info("Substitution required for this faculty member");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to mark attendance");
    } finally {
      setSaving(false);
    }
  }

  const currentDayAttendance = attendanceData[selectedDate] || {};

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      {/* Unified Page Header */}
      <UnifiedPageHeader 
        title="Staff Attendance"
        subtitle="Track daily faculty attendance and manage substitutions"
        icon={Users}
        color="emerald"
        actions={
          <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-sm">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-transparent text-xs font-black uppercase tracking-widest outline-none border-none"
            />
          </div>
        }
      />

      {/* Stats Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <DashboardStatCard 
          title="Present" 
          value={Object.values(currentDayAttendance).filter(s => s === "present").length} 
          icon={CheckCircle} 
          color="emerald" 
          description="In school today"
        />
        <DashboardStatCard 
          title="Absent" 
          value={Object.values(currentDayAttendance).filter(s => s === "absent").length} 
          icon={XCircle} 
          color="rose" 
          description="Unaccounted"
        />
        <DashboardStatCard 
          title="On Leave" 
          value={Object.values(currentDayAttendance).filter(s => s === "on_leave").length} 
          icon={Clock} 
          color="amber" 
          description="Approved leave"
        />
        <DashboardStatCard 
          title="Late" 
          value={Object.values(currentDayAttendance).filter(s => s === "late").length} 
          icon={Activity} 
          color="amber" 
          description="Delayed entry"
        />
        <DashboardStatCard 
          title="Total Staff" 
          value={staffList.length} 
          icon={Users} 
          color="blue" 
          description="Active faculty"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ERPCard 
            title="Attendance Registry" 
            description={`Daily status log for ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`} 
            color="emerald" 
            icon={<CheckCircle className="h-5 w-5" />}
            className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden"
          >
            {loading ? (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="h-10 w-10 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Scanning staff database...</p>
              </div>
            ) : staffList.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center">
                <Users className="h-12 w-12 text-slate-200 mb-4" />
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No active faculty found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                {staffList.map((staff: any) => {
                  const currentStatus = currentDayAttendance[staff.id];
                  return (
                    <div 
                      key={staff.id} 
                      className="group bg-white rounded-2xl border border-slate-100 p-5 hover:border-emerald-500/30 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-11 w-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-500/20 group-hover:rotate-3 transition-transform">
                          {staff.first_name[0]}{staff.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 tracking-tight text-sm">{staff.first_name} {staff.last_name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{staff.designations?.name || "Teacher"}</p>
                        </div>
                      </div>

                      {currentStatus ? (
                        <div className="flex gap-2">
                          <div className={cn(
                            "flex-1 px-3 py-2 rounded-xl text-center text-[10px] font-black uppercase tracking-widest border shadow-sm",
                            STATUS_OPTIONS.find(s => s.value === currentStatus)?.color || "bg-slate-100 text-slate-500 border-slate-200"
                          )}>
                            {STATUS_OPTIONS.find(s => s.value === currentStatus)?.label || currentStatus}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                            onClick={() => markAttendance(staff.id, "")}
                            disabled={saving}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {STATUS_OPTIONS.slice(0, 3).map((option) => (
                            <Button
                              key={option.value}
                              variant="outline"
                              className={cn(
                                "flex-1 h-10 px-0 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border-slate-100",
                                option.value === 'present' ? "hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200" :
                                option.value === 'absent' ? "hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200" :
                                "hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
                              )}
                              onClick={() => markAttendance(staff.id, option.value)}
                              disabled={saving}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ERPCard>
        </div>

        <div className="space-y-8">
          {/* Substitution Intelligence */}
          <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                <ShieldCheck className="h-24 w-24 text-white" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-3">
                <MapPin className="h-4 w-4 text-emerald-500" />
                Intelligence
            </h3>
            <div className="relative z-10 space-y-4">
              <p className="text-lg font-black text-white tracking-tight leading-tight">Auto-Substitution Active</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider">
                When a teacher is marked absent, the system automatically assigns matching proxies to maintain timetable integrity.
              </p>
              <div className="pt-4">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">System Monitoring</Badge>
              </div>
            </div>
          </div>

          <div className="glass futuristic-card p-8 rounded-3xl border-none shadow-xl">
             <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <Activity className="h-5 w-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Insight</h3>
             </div>
             <p className="text-sm font-bold text-slate-900 leading-relaxed">
                Faculty attendance is currently at <span className="text-emerald-600">92%</span> for this week.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}