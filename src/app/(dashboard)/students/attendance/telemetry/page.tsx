export const revalidate = 30;

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AttendanceTelemetryClient 
} from "./AttendanceTelemetryClient";
import { 
  TrendingUp, TrendingDown, Users, Calendar, 
  Clock, CheckCircle, XCircle, AlertTriangle
} from "lucide-react";

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
}

export default async function AttendanceTelemetryPage() {
  const supabase = await createClient();
  
  // Get today's date
  const today = new Date().toISOString().split("T")[0];
  
  // Fetch today's attendance stats
  const { data: todayAttendance } = await supabase
    .from("attendance")
    .select("status")
    .eq("date", today);

  // Calculate today's stats
  const todayStats: AttendanceStats = {
    present: todayAttendance?.filter(a => a.status === "present").length || 0,
    absent: todayAttendance?.filter(a => a.status === "absent").length || 0,
    late: todayAttendance?.filter(a => a.status === "late").length || 0,
    excused: todayAttendance?.filter(a => a.status === "excused").length || 0,
    total: todayAttendance?.length || 0,
  };

  // Get total students
  const { count: totalStudents } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // Get weekly attendance (last 7 days) - use single Date instance
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const weekStart = new Date(now.getTime() - 7 * msPerDay).toISOString().split("T")[0];
  const { data: weeklyAttendance } = await supabase
    .from("attendance")
    .select("status, date")
    .gte("date", weekStart);

  // Calculate weekly stats
  const weeklyStats = weeklyAttendance || [];
  const weeklyPresent = weeklyStats.filter(a => a.status === "present").length;
  const weeklyTotal = weeklyStats.length;
  const weeklyPercentage = weeklyTotal > 0 ? Math.round((weeklyPresent / weeklyTotal) * 100) : 0;

  // Get monthly stats
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  const { data: monthlyAttendance } = await supabase
    .from("attendance")
    .select("status, date")
    .gte("date", monthStart);

  const monthlyStats = monthlyAttendance || [];
  const monthlyPresent = monthlyStats.filter(a => a.status === "present").length;
  const monthlyTotal = monthlyStats.length;
  const monthlyPercentage = monthlyTotal > 0 ? Math.round((monthlyPresent / monthlyTotal) * 100) : 0;

  // Get low attendance students (below 75%)
  const { data: lowAttendanceStudents } = await supabase
    .from("students")
    .select(`
      id,
      admission_number,
      profile:profiles(full_name),
      class:classes(name),
      attendance:attendance(status)
    `)
    .limit(10);

  // Get class-wise attendance
  const { data: classAttendance } = await supabase
    .from("classes")
    .select("id, name, students(id)");

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-50 rounded-md border-l-4 border-emerald-500">
          <Calendar className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Attendance Telemetry</h1>
          <p className="text-sm text-slate-500">Real-time attendance monitoring and analytics</p>
        </div>
      </div>

      {/* 4-Card Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Today's Attendance</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {todayStats.total > 0 
                    ? Math.round((todayStats.present / todayStats.total) * 100) 
                    : 0}%
                </p>
                <p className="text-xs text-slate-400">
                  {todayStats.present} / {totalStudents || 0} present
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Absent Today</p>
                <p className="text-2xl font-semibold text-slate-900">{todayStats.absent}</p>
                <p className="text-xs text-slate-400">Students absent</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Weekly Average</p>
                <p className="text-2xl font-semibold text-slate-900">{weeklyPercentage}%</p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  {weeklyPercentage >= 75 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-600">On track</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      <span className="text-red-600">Needs attention</span>
                    </>
                  )}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Monthly Average</p>
                <p className="text-2xl font-semibold text-slate-900">{monthlyPercentage}%</p>
                <p className="text-xs text-slate-400">
                  {monthlyPresent} / {monthlyTotal} present
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <AttendanceTelemetryClient 
        todayStats={todayStats}
        totalStudents={totalStudents || 0}
      />
    </div>
  );
}