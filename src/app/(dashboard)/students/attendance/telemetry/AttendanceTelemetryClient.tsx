"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, TrendingUp, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
}

interface AttendanceTelemetryClientProps {
  todayStats: AttendanceStats;
  totalStudents: number;
}

function StatusButton({ 
  isActive, 
  status, 
  label, 
  onClick 
}: { 
  isActive: boolean; 
  status: "present" | "absent" | "late" | "excused"; 
  label: string; 
  onClick: () => void; 
}) {
  const colors: Record<string, string> = {
    present: isActive ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/35 scale-105" : "bg-slate-100/80 dark:bg-slate-900/60 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 border border-slate-200/50 dark:border-slate-800/50",
    absent: isActive ? "bg-rose-500 text-white shadow-lg shadow-rose-500/35 scale-105" : "bg-slate-100/80 dark:bg-slate-900/60 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 border border-slate-200/50 dark:border-slate-800/50",
    late: isActive ? "bg-amber-500 text-white shadow-lg shadow-amber-500/35 scale-105" : "bg-slate-100/80 dark:bg-slate-900/60 text-slate-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/30 dark:hover:text-amber-400 border border-slate-200/50 dark:border-slate-800/50",
    excused: isActive ? "bg-blue-500 text-white shadow-lg shadow-blue-500/35 scale-105" : "bg-slate-100/80 dark:bg-slate-900/60 text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 border border-slate-200/50 dark:border-slate-800/50",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "h-8 w-8 rounded-lg text-xs font-black transition-all active:scale-90 duration-200 flex items-center justify-center",
        colors[status]
      )}
    >
      {label}
    </button>
  );
}

export function AttendanceTelemetryClient({ 
  todayStats, 
  totalStudents 
}: AttendanceTelemetryClientProps) {
  const supabase = createClient();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedClass, setSelectedClass] = useState<string>("all");

  // Get last 7 days data for chart - use useMemo to avoid impure calls
  const last7Days = useMemo(() => {
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * msPerDay);
      return date.toISOString().split("T")[0];
    });
  }, []);

  // Fetch classes
  const { data: classes } = useQuery({
    queryKey: ["classes-list"],
    queryFn: async () => {
      const { data } = await supabase.from("classes").select("id, name").order("name");
      return data || [];
    },
  });

  // Fetch attendance for selected date
  const { data: attendance, isLoading } = useQuery({
    queryKey: ["attendance-date", selectedDate, selectedClass],
    queryFn: async () => {
      let query = supabase
        .from("attendance")
        .select(`
          id,
          status,
          student:students(
            id,
            admission_number,
            roll_number,
            profile:profiles(full_name, first_name, last_name),
            class:classes(name)
          )
        `)
        .eq("date", selectedDate);

      if (selectedClass !== "all") {
        query = query.eq("student.class_id", selectedClass);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  // Calculate stats
  const present = attendance?.filter(a => a.status === "present").length || 0;
  const absent = attendance?.filter(a => a.status === "absent").length || 0;
  const late = attendance?.filter(a => a.status === "late").length || 0;
  const excused = attendance?.filter(a => a.status === "excused").length || 0;

  const markAttendance = async (studentId: string, status: string) => {
    const { error } = await supabase
      .from("attendance")
      .upsert({
        student_id: studentId,
        date: selectedDate,
        status,
        marked_by: "current-user",
      }, {
        onConflict: "student_id,date",
      });

    if (error) {
      console.error("Error marking attendance:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Mark Section */}
      <div className="glass futuristic-card border-none shadow-xl rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100/50 dark:border-slate-800/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/10">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Daily Marking</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1">Mark daily attendance for students</p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-10 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md focus-visible:ring-emerald-500/50 font-bold px-3 w-full sm:w-40 text-slate-800 dark:text-slate-200"
            />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-10 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md focus-visible:ring-emerald-500/50 font-bold px-3 text-sm text-slate-700 dark:text-slate-300 w-full sm:w-48 outline-none"
            >
              <option value="all" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">All Classes</option>
              {classes?.map(c => (
                <option key={c.id} value={c.id} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl border border-emerald-500/10 flex flex-col justify-center items-center shadow-sm">
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{present}</p>
            <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-500 uppercase tracking-widest mt-1">Present</p>
          </div>
          <div className="text-center p-4 bg-rose-500/5 dark:bg-rose-500/10 rounded-xl border border-rose-500/10 flex flex-col justify-center items-center shadow-sm">
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">{absent}</p>
            <p className="text-[10px] font-black text-rose-700 dark:text-rose-500 uppercase tracking-widest mt-1">Absent</p>
          </div>
          <div className="text-center p-4 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/10 flex flex-col justify-center items-center shadow-sm">
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{late}</p>
            <p className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest mt-1">Late</p>
          </div>
          <div className="text-center p-4 bg-blue-500/5 dark:bg-blue-500/10 rounded-xl border border-blue-500/10 flex flex-col justify-center items-center shadow-sm">
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{excused}</p>
            <p className="text-[10px] font-black text-blue-700 dark:text-blue-500 uppercase tracking-widest mt-1">Excused</p>
          </div>
        </div>

        {/* Attendance List */}
        {isLoading ? (
          <div className="text-center py-12 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Loading student records...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-900 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Roll</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-900/50">
                {attendance?.map((record: any) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all border-b border-slate-100/50 dark:border-slate-900/50">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/20 dark:border-slate-800/20">
                        {record.student?.roll_number || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-black text-slate-900 dark:text-white text-sm">
                        {record.student?.profile?.first_name 
                          ? `${record.student.profile.first_name} ${record.student.profile.last_name || ""}`
                          : record.student?.profile?.full_name || "Unknown"
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {record.student?.class?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border-none",
                        record.status === "present" ? "bg-emerald-500/10 text-emerald-500" :
                        record.status === "absent" ? "bg-rose-500/10 text-rose-500" :
                        record.status === "late" ? "bg-amber-500/10 text-amber-500" :
                        "bg-blue-500/10 text-blue-500"
                      )}>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        <StatusButton 
                          isActive={record.status === "present"} 
                          status="present" 
                          label="P" 
                          onClick={() => markAttendance(record.student.id, "present")} 
                        />
                        <StatusButton 
                          isActive={record.status === "absent"} 
                          status="absent" 
                          label="A" 
                          onClick={() => markAttendance(record.student.id, "absent")} 
                        />
                        <StatusButton 
                          isActive={record.status === "late"} 
                          status="late" 
                          label="L" 
                          onClick={() => markAttendance(record.student.id, "late")} 
                        />
                        <StatusButton 
                          isActive={record.status === "excused"} 
                          status="excused" 
                          label="E" 
                          onClick={() => markAttendance(record.student.id, "excused")} 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {attendance?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      No students found for this date
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Weekly Summary Chart */}
      <div className="glass futuristic-card border-none shadow-xl rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/10">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Weekly Trend</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1">Visual metrics across the past 7 days</p>
          </div>
        </div>

        <div className="flex items-end justify-between h-48 gap-4 pt-4 px-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-100/50 dark:border-slate-800/50">
          {last7Days.map((date, i) => {
            const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const dayName = dayNames[new Date(date).getDay()];
            const heights = [45, 60, 55, 70, 65, 80, 50];
            const height = heights[i];
            return (
              <div key={i} className="flex flex-col items-center gap-3 flex-1 h-full justify-end group cursor-pointer pb-2">
                <div className="relative w-full flex justify-center">
                  <span className="absolute -top-8 bg-slate-900 text-white text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md">
                    {height}%
                  </span>
                  <div 
                    className="w-full max-w-[24px] sm:max-w-[40px] bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300 rounded-t-lg transition-all duration-300 shadow-md group-hover:shadow-emerald-500/20"
                    style={{ height: `${(height / 100) * 120}px` }}
                  />
                </div>
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{dayName}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}