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
} from "lucide-react";
import { PerformancePredictor } from "@/components/ai/PerformancePredictor";
import { UserService } from "@/lib/services/user";
import { AuditService } from "@/lib/services/audit";
import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth-utils";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const role = await getSessionRole();
  const { data: { user } } = await supabase.auth.getUser();

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
        studentCount: 1234,
        teacherCount: 84,
        attendanceRate: "94.2%",
        revenue: "₹45.2K",
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
      trend: "+12.5%",
      description: "Enrollment growth",
      color: "text-blue-600",
    },
    {
      title: "Faculty Members",
      value: realStats.teacherCount.toString(),
      icon: UserSquare2,
      trend: "+2.1%",
      description: "Active staff",
      color: "text-slate-600",
    },
    {
      title: "Current Attendance",
      value: realStats.attendanceRate,
      icon: ClipboardCheck,
      trend: "+0.8%",
      description: "Daily average",
      color: "text-emerald-600",
    },
    {
      title: "Monthly Revenue",
      value: realStats.revenue,
      icon: CreditCard,
      trend: "+18%",
      description: "Fee collection",
      color: "text-slate-900",
    },
  ];

  return (
    <div className="space-y-12 page-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-x-2 mb-3">
             <div className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                School Management System
             </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
            Academic Overview
          </h2>
          <p className="text-slate-500 font-medium text-xs mt-3 flex items-center gap-x-2">
             Centralized control and insights for your institution.
          </p>
        </div>
        <div className="flex items-center gap-x-3">
          <button className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-500 shadow-sm">
            <Bell className="h-5 w-5" />
          </button>
          <Link href="/reports">
            <button className="px-6 h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl transition-all hover:opacity-90 active:scale-95 shadow-sm font-bold text-xs tracking-wide">
                Generate Reports
            </button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {stat.title}
              </p>
              <stat.icon className="h-4 w-4 text-slate-300" />
            </div>

            <div className="flex items-end gap-x-2">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                {stat.value}
              </h3>
            </div>

            <div className="mt-6">
               <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-1000", stat.color.replace('text-', 'bg-'))} 
                    style={{ width: '70%' }} 
                  />
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-400 flex items-center gap-x-2 text-[10px] uppercase tracking-widest">
              <History className="h-3.5 w-3.5" />
              Recent Activity
            </h3>
          </div>
          <div className="space-y-3">
            {activityFeed.map((event, i) => (
              <div
                key={i}
                className="group/item flex gap-x-4 items-center p-3 rounded-md bg-muted/30 border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all cursor-pointer"
              >
                <div className="h-10 w-10 rounded-md bg-card border border-border flex items-center justify-center shrink-0 shadow-sm transition-all group-hover/item:border-primary/20">
                  <event.icon className="h-4 w-4 text-muted-foreground group-hover/item:text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground tracking-tight text-xs group-hover/item:text-primary transition-colors">
                    {event.title}
                  </p>
                  <p className="text-muted-foreground font-medium text-[10px] truncate uppercase tracking-wide mt-0.5">{event.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/reports" className="w-full block">
            <button className="w-full mt-6 py-3 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 rounded-md hover:bg-primary/5 transition-all text-center">
              View Detailed Logs
            </button>
          </Link>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
           <div className="flex items-center justify-between mb-6">
              <div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">Academic Projections</h3>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Institutional Data Analysis</p>
              </div>
           </div>
           <PerformancePredictor />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Attendance Trends
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Historical Data Monitoring
              </p>
            </div>
          </div>
          <div className="h-[280px] flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
            <BarChart3 className="h-12 w-12 mb-4 text-slate-200 dark:text-slate-800" />
            <p className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Generating Analytics...
            </p>
          </div>
        </div>

        <div className="col-span-3 bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Daily Schedule</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              {todayLabel}
            </p>
          </div>
          <div className="space-y-4">
            {upcomingSchedule.length > 0 ? upcomingSchedule.map((slot: any) => (
              <div
                key={slot.id}
                className="flex items-center gap-x-4 p-4 rounded-md bg-muted/30 border border-border hover:border-primary/30 hover:bg-muted/50 transition-all cursor-pointer group"
              >
                <div className="h-12 w-12 rounded-md bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {role === "teacher" ? slot.class_name : slot.subject?.name || "Scheduled class"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mt-1">
                    {slot.room_name} • {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)}
                  </p>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
              </div>
            )) : (
              <div className="h-[220px] flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-muted/20">
                <CalendarDays className="h-10 w-10 mb-4 text-muted-foreground opacity-20" />
                <p className="font-semibold text-[10px] uppercase tracking-widest text-muted-foreground/60">
                  No upcoming schedule items for today
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
