"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar, CheckCircle, XCircle, Clock, User, MapPin, Activity, ShieldCheck, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";

const STATUS_OPTIONS = [
  { value: "present", label: "Present", icon: CheckCircle, color: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30" },
  { value: "absent", label: "Absent", icon: XCircle, color: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30" },
  { value: "on_leave", label: "On Leave", icon: Clock, color: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/30" },
  { value: "late", label: "Late", icon: Clock, color: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/20 dark:text-orange-450 dark:border-orange-900/30" },
  { value: "half_day", label: "Half Day", icon: Clock, color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-450 dark:border-blue-900/30" },
];

export default function StaffAttendancePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, Record<string, string>>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  const loadKey = useRef(0);

  const loadStaffAndAttendance = useCallback(async () => {
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
  }, [selectedDate, supabase]);

  useEffect(() => {
    loadKey.current += 1;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStaffAndAttendance();
  }, [loadStaffAndAttendance]);

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
      <UnifiedPageHeader 
        title="Attendance"
        subtitle="Track daily staff attendance and manage substitutions"
        icon={Users}
        color="emerald"
        actions={
          <div className="flex items-center gap-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 bg-transparent text-xs font-black uppercase tracking-widest outline-none border-none text-slate-700 dark:text-slate-300"
            />
          </div>
        }
      />

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
                <h3 className="text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase leading-none mb-2">
                    Daily Roster
                </h3>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    Attendance Registry
                </h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : staffList.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <Users className="h-16 w-16 text-slate-200 mb-6" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No active faculty found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {staffList.map((staff: any, idx: number) => {
              const currentStatus = currentDayAttendance[staff.id];
              return (
                <div 
                  key={staff.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-6 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 flex items-center justify-center font-black text-lg border border-slate-100 dark:border-slate-800">
                      {staff.first_name[0]}{staff.last_name?.[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-sm tracking-tight">
                        {staff.first_name} {staff.last_name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {staff.designations?.name || "Teacher"}
                      </p>
                    </div>
                  </div>

                  <div>
                    {currentStatus ? (
                      <div className="flex gap-2">
                        <div className={cn(
                          "flex-1 px-4 py-3 rounded-xl text-center text-[10px] font-black uppercase tracking-widest border",
                          STATUS_OPTIONS.find(s => s.value === currentStatus)?.color || "bg-slate-100 text-slate-500 border-slate-200"
                        )}>
                          {STATUS_OPTIONS.find(s => s.value === currentStatus)?.label || currentStatus}
                        </div>
                        <button 
                          className="h-[38px] w-[38px] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors flex items-center justify-center"
                          onClick={() => markAttendance(staff.id, "")}
                          disabled={saving}
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-1.5">
                        {STATUS_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            className={cn(
                              "h-9 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300",
                              option.value === 'present' ? "hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400" :
                              option.value === 'absent' ? "hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/20 dark:hover:text-rose-400" :
                              option.value === 'on_leave' ? "hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 dark:hover:bg-amber-950/20 dark:hover:text-amber-400" :
                              option.value === 'late' ? "hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 dark:hover:bg-orange-950/20 dark:hover:text-orange-400" :
                              "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950/20 dark:hover:text-blue-400"
                            )}
                            onClick={() => markAttendance(staff.id, option.value)}
                            disabled={saving}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
