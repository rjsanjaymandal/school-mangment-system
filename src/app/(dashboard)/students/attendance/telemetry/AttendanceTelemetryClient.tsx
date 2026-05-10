"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, TrendingUp, Users, CheckCircle, XCircle, Clock } from "lucide-react";

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
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b bg-slate-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-500" />
              Daily Marking
            </CardTitle>
            <div className="flex gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-8 w-40"
              />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-8 px-2 rounded-md border text-sm"
              >
                <option value="all">All Classes</option>
                {classes?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Status Summary */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600">{present}</p>
              <p className="text-xs text-emerald-700">Present</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{absent}</p>
              <p className="text-xs text-red-700">Absent</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{late}</p>
              <p className="text-xs text-amber-700">Late</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{excused}</p>
              <p className="text-xs text-blue-700">Excused</p>
            </div>
          </div>

          {/* Attendance List */}
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">Roll No.</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">Student</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">Class</th>
                    <th className="px-3 py-2 text-center font-medium text-slate-600">Status</th>
                    <th className="px-3 py-2 text-center font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {attendance?.map((record: any) => (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono text-slate-600">
                        {record.student?.roll_number || "-"}
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-medium text-slate-900">
                          {record.student?.profile?.first_name 
                            ? `${record.student.profile.first_name} ${record.student.profile.last_name || ""}`
                            : record.student?.profile?.full_name || "Unknown"
                          }
                        </span>
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {record.student?.class?.name || "N/A"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <Badge className={
                          record.status === "present" ? "bg-emerald-100 text-emerald-700" :
                          record.status === "absent" ? "bg-red-100 text-red-700" :
                          record.status === "late" ? "bg-amber-100 text-amber-700" :
                          "bg-blue-100 text-blue-700"
                        }>
                          {record.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            size="sm"
                            variant={record.status === "present" ? "default" : "outline"}
                            className={`h-7 text-xs ${record.status === "present" ? "bg-emerald-600" : ""}`}
                            onClick={() => markAttendance(record.student.id, "present")}
                          >
                            P
                          </Button>
                          <Button
                            size="sm"
                            variant={record.status === "absent" ? "default" : "outline"}
                            className={`h-7 text-xs ${record.status === "absent" ? "bg-red-600" : ""}`}
                            onClick={() => markAttendance(record.student.id, "absent")}
                          >
                            A
                          </Button>
                          <Button
                            size="sm"
                            variant={record.status === "late" ? "default" : "outline"}
                            className={`h-7 text-xs ${record.status === "late" ? "bg-amber-600" : ""}`}
                            onClick={() => markAttendance(record.student.id, "late")}
                          >
                            L
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {attendance?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                        No students found for this date
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Summary Chart placeholder */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4 border-b bg-slate-50/50">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-slate-500" />
            Weekly Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-end justify-between h-40 gap-2">
            {last7Days.map((date, i) => {
              const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              const dayName = dayNames[new Date(date).getDay()];
              // Use deterministic heights based on index instead of Math.random
              const heights = [45, 60, 55, 70, 65, 80, 50];
              const height = heights[i];
              return (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div 
                    className="w-full bg-emerald-500 rounded-t transition-all hover:bg-emerald-600"
                    style={{ height: `${height}%`, minHeight: "20px" }}
                  />
                  <span className="text-xs text-slate-500">{dayName}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}