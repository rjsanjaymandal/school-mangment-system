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

import { UnifiedPageHeader } from "@/components/shared/UnifiedPageHeader";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";

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
      <UnifiedPageHeader 
        title="Attendance Telemetry"
        subtitle="Real-time attendance monitoring and analytics"
        icon={Calendar}
        color="emerald"
      />

      {/* 4-Card Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStatCard 
          title="Today's Attendance"
          value={`${todayStats.total > 0 ? Math.round((todayStats.present / todayStats.total) * 100) : 0}%`}
          description={`${todayStats.present} / ${totalStudents || 0} present`}
          icon={CheckCircle}
          color="emerald"
        />

        <DashboardStatCard 
          title="Absent Today"
          value={todayStats.absent}
          description="Students absent"
          icon={XCircle}
          color="rose"
        />

        <DashboardStatCard 
          title="Weekly Average"
          value={`${weeklyPercentage}%`}
          description={weeklyPercentage >= 75 ? "On track" : "Needs attention"}
          trend={{
            value: weeklyPercentage >= 75 ? "On track" : "Needs attention",
            isUp: weeklyPercentage >= 75
          }}
          icon={Clock}
          color="blue"
        />

        <DashboardStatCard 
          title="Monthly Average"
          value={`${monthlyPercentage}%`}
          description={`${monthlyPresent} / ${monthlyTotal} present`}
          icon={Users}
          color="purple"
        />
      </div>

      {/* Main Content */}
      <AttendanceTelemetryClient 
        todayStats={todayStats}
        totalStudents={totalStudents || 0}
      />
    </div>
  );
}