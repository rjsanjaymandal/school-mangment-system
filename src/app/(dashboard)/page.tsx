import Link from "next/link";
import {
  Users,
  GraduationCap,
  UserSquare2,
  CreditCard,
  Bell,
  BarChart3,
  CalendarDays,
  FileText,
  ClipboardCheck,
  History,
  LayoutDashboard,
} from "lucide-react";
import { UserService } from "@/lib/services/user";
import { AuditService } from "@/lib/services/audit";
import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth-utils";
import { cn } from "@/lib/utils";
import { ERPCard } from "@/components/ui/erp-card";
import { Card } from "@/components/ui/card";
import { PerformancePredictor } from "@/components/shared/DynamicWrapper";

export default async function DashboardPage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const { data: { user } } = await supabase.auth.getUser();

  // Parallelize all independent data fetches
  const [statsData, recentLogs, currentAY] = await Promise.all([
    UserService.getSystemStats(),
    AuditService.getAuditEntries(),
    supabase
      .from("academic_years")
      .select("id, name")
      .eq("is_current", true)
      .maybeSingle()
      .then(({ data }) => data),
  ]);

  const todayLabel = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
  const currentTime = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

  // Student class lookup + timetable fetch in parallel where possible
  let studentClassId: string | null = null;
  if (role === "student" && user?.id && currentAY?.id) {
    const { data: enrollment } = await supabase
      .from("class_enrollments")
      .select("class_id")
      .eq("student_id", user.id)
      .eq("academic_year_id", currentAY.id)
      .maybeSingle();

    if (enrollment?.class_id) {
      studentClassId = enrollment.class_id;
    } else {
      const { data: studentRecord } = await supabase
        .from("students")
        .select("class_id")
        .eq("id", user.id)
        .maybeSingle();
      studentClassId = studentRecord?.class_id || null;
    }
  }

  const { data: todayTimetables } = currentAY?.id
    ? await supabase
        .from("timetables")
        .select(`
          id,
          class_id,
          day_of_week,
          class:classes(name, room_number),
          slots:timetable_slots(
            id,
            teacher_id,
            start_time,
            end_time,
            room_number,
            subject:subjects(name),
            teacher:teachers(
              profile:profiles(full_name)
            )
          )
        `)
        .eq("academic_year_id", currentAY.id)
        .eq("day_of_week", todayLabel)
    : { data: [] };

  const todaySchedule = (todayTimetables || [])
    .flatMap((timetable: any) =>
      (timetable.slots || []).map((slot: any) => ({
        ...slot,
        class_id: timetable.class_id,
        class_name: timetable.class?.name || "Unknown class",
        room_name: slot.room_number || timetable.class?.room_number || "TBA",
      })),
    )
    .filter((slot: any) => {
      if (role === "student") return slot.class_id === studentClassId;
      if (role === "teacher") return slot.teacher_id === user?.id;
      return true;
    })
    .sort((a: any, b: any) => (a.start_time || "").localeCompare(b.start_time || ""));

  const upcomingSchedule = todaySchedule.filter((slot: any) => (slot.end_time || "") >= currentTime).slice(0, 3);

  // Handle case where service returns an error object
  const realStats =
    statsData && !("error" in statsData)
      ? statsData
      : {
        studentCount: 0,
        teacherCount: 0,
        attendanceRate: "—",
        revenue: "₹0",
      };

  const activityFeed = Array.isArray(recentLogs)
    ? recentLogs.slice(0, 3).map((log) => ({
      title: log.action.replace(/_/g, " "),
      desc: `Updated by ${log.actor?.first_name || "System"}`,
      icon:
        log.action.includes("USER") || log.action.includes("PROFILE")
          ? Users
          : FileText,
    }))
    : [
      {
        title: "Admission Open",
        desc: "Term 2 enrollment is active.",
        icon: GraduationCap,
      },
      {
        title: "Daily Attendance",
        desc: "All classes reported.",
        icon: ClipboardCheck,
      },
      {
        title: "Academic Report",
        desc: "Monthly performance generated.",
        icon: FileText,
      },
    ];

  const stats = [
    {
      title: "Total Students",
      value: realStats.studentCount.toString(),
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-600",
    },
    {
      title: "Staff",
      value: realStats.teacherCount.toString(),
      icon: UserSquare2,
      color: "text-slate-600",
      bgColor: "bg-slate-600",
    },
    {
      title: "Current Attendance",
      value: realStats.attendanceRate,
      icon: ClipboardCheck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-600",
    },
    {
      title: "Monthly Revenue",
      value: realStats.revenue,
      icon: CreditCard,
      color: "text-slate-900",
      bgColor: "bg-slate-900",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Dashboard</span>
            {currentAY?.name && (
              <>
                <span>/</span>
                <span className="text-foreground font-medium">{currentAY.name}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your school easily</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-md border hover:bg-slate-50 transition-all">
            <Bell className="h-5 w-5 text-slate-500" />
          </button>
          <Link href="/reports">
            <button className="px-4 h-9 bg-slate-900 text-white rounded-md transition-all hover:opacity-90 font-medium text-sm">
              Generate Reports
            </button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white p-4 border rounded-md shadow-sm hover:border-slate-300 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {stat.title}
              </p>
              <stat.icon className="h-4 w-4 text-slate-300" />
            </div>

            <div className="flex items-end gap-x-2">
              <h3 className="text-2xl font-bold text-slate-900">
                {stat.value}
              </h3>
            </div>

            <div className="mt-6">
               <div className="h-1 w-full bg-slate-100 bg-slate-100 rounded-full overflow-hidden">
                 <div 
                   className={cn("h-full transition-all duration-1000", stat.bgColor)} 
                   style={{ width: '70%' }} 
                 />
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ERPCard title="Recent Activity" className="lg:col-span-1" accentColor="slate" icon={<History className="h-4 w-4" />}>
          <div className="space-y-3">
            {activityFeed.map((event, i) => (
              <div key={i} className="flex gap-3 items-center p-2 rounded-md hover:bg-slate-50 cursor-pointer">
                <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
                  <event.icon className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <p className="text-xs text-slate-500 truncate">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/reports">
            <button className="w-full mt-4 py-2 text-sm text-emerald-600 border border-emerald-200 rounded-md hover:bg-emerald-50">
              View All Activity
            </button>
          </Link>
        </ERPCard>

        <ERPCard title="Academic Performance" className="lg:col-span-2" accentColor="emerald" icon={<BarChart3 className="h-4 w-4" />}>
          <PerformancePredictor />
        </ERPCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <ERPCard title="Attendance Trends" className="col-span-4" accentColor="blue" icon={<BarChart3 className="h-4 w-4" />}>
          <div className="h-48 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-lg bg-slate-50">
            <BarChart3 className="h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">Attendance data will appear here</p>
          </div>
        </ERPCard>

        <ERPCard title="Daily Schedule" className="col-span-3" accentColor="purple" icon={<CalendarDays className="h-4 w-4" />}>
          <div className="space-y-3">
            {upcomingSchedule.length > 0 ? upcomingSchedule.map((slot: any) => (
              <div key={slot.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-50">
                <div className="h-10 w-10 rounded bg-emerald-100 flex items-center justify-center">
                  <CalendarDays className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{role === "teacher" ? slot.class_name : slot.subject?.name || "Class"}</p>
                  <p className="text-xs text-slate-500">{slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-500 text-center py-8">No classes scheduled</p>
            )}
          </div>
        </ERPCard>
      </div>
    </div>
  );
}
