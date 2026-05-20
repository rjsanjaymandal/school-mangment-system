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
        title="Attendance"
        subtitle="Track daily staff attendance and manage substitutions"
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

      <div className="space-y-8 pb-20">
        <div className="flex items-center gap-6 mb-8">
            <div className="flex flex-col">
                <h3 className="text-[10px] font-black tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase leading-none mb-2">
                    Daily Roster
                </h3>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    Attendance Registry
                </h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />
        </div>

        {loading ? (
          <div className="p-24 text-center flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem]">
            <div className="h-12 w-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin mb-6" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning staff database...</p>
          </div>
        ) : staffList.length === 0 ? (
          <div className="p-24 text-center flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem]">
            <Users className="h-16 w-16 text-slate-200 dark:text-slate-700 mb-6" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active faculty found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {staffList.map((staff: any, idx: number) => {
              const currentStatus = currentDayAttendance[staff.id];
              return (
                <div 
                  key={staff.id} 
                  className="group relative flex flex-col p-6 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] hover:border-emerald-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/5 overflow-hidden animate-in slide-in-from-bottom-8 fade-in fill-mode-both"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 flex items-center justify-center font-black text-lg shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 group-hover:bg-emerald-500 group-hover:text-white group-hover:ring-emerald-500 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                      {staff.first_name[0]}{staff.last_name?.[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {staff.first_name} {staff.last_name}
                      </h3>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {staff.designations?.name || "Teacher"}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 mt-auto">
                    {currentStatus ? (
                      <div className="flex gap-2">
                        <div className={cn(
                          "flex-1 px-4 py-3 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all duration-500",
                          STATUS_OPTIONS.find(s => s.value === currentStatus)?.color || "bg-slate-100 text-slate-500 border-slate-200"
                        )}>
                          {STATUS_OPTIONS.find(s => s.value === currentStatus)?.label || currentStatus}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-[38px] w-[38px] rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
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
                              "flex-1 h-10 px-0 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border-slate-200/60 dark:border-slate-800",
                              option.value === 'present' ? "hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:hover:bg-emerald-500/10 dark:hover:border-emerald-500/30" :
                              option.value === 'absent' ? "hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-500/10 dark:hover:border-rose-500/30" :
                              "hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 dark:hover:bg-amber-500/10 dark:hover:border-amber-500/30"
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
                  
                  {/* Decorative Bottom Bar */}
                  <div className={cn(
                    "absolute bottom-0 left-0 h-1 transition-all duration-700 delay-100",
                    currentStatus ? "w-full" : "w-0 group-hover:w-full",
                    currentStatus === "present" ? "bg-emerald-500" :
                    currentStatus === "absent" ? "bg-rose-500" :
                    currentStatus === "on_leave" ? "bg-amber-500" :
                    "bg-slate-200"
                  )} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}