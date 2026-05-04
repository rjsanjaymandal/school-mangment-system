import {
  GraduationCap,
  Users,
  BookOpen,
  ShieldAlert,
  Settings,
} from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";
import { InstitutionalService } from "@/lib/services/institutional";
import { UserService } from "@/lib/services/user";
import { Badge } from "@/components/ui/badge";
import { AdminCharts } from "./AdminCharts";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  const [academicYear, statsData] = await Promise.all([
    InstitutionalService.getCurrentAcademicYear().catch((e: any) => ({ error: e.message })),
    UserService.getSystemStats().catch((e: any) => ({ error: e.message })),
  ]);

  const realStats =
    statsData && !("error" in statsData)
      ? statsData
      : {
        studentCount: 0,
        teacherCount: 0,
        parentCount: 0,
        classCount: 0,
        };

  const activeYearName =
    academicYear && !("error" in academicYear)
      ? academicYear.name
      : "Academic Year 2024-25";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-foreground font-medium">Admin</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">Admin Mission Control</h1>
          <p className="text-sm text-muted-foreground">{activeYearName}</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Students", value: realStats.studentCount, sub: "Total Enrolled", icon: GraduationCap, color: "emerald" },
          { label: "Teachers", value: realStats.teacherCount, sub: "Faculty Staff", icon: Users, color: "blue" },
          { label: "Parents", value: realStats.parentCount, sub: "Verified Guardians", icon: Users, color: "purple" },
          { label: "Classes", value: realStats.classCount, sub: "Active Sections", icon: BookOpen, color: "slate" },
        ].map((stat, i) => (
          <ERPCard key={i} accentColor={stat.color as any}>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </ERPCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ERPCard accentColor="blue" title="Academic Overview" icon={<BookOpen className="h-5 w-5 text-blue-600" />}>
          <div className="p-4 space-y-4">
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[85%] rounded-full" />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">85% Syllabus Completion</p>
              <Badge className="bg-blue-100 text-blue-700">On Track</Badge>
            </div>
          </div>
        </ERPCard>

        <ERPCard accentColor="red" title="System Security" icon={<ShieldAlert className="h-5 w-5 text-red-600" />}>
          <div className="p-4">
            <p className="text-sm text-muted-foreground italic">
              "All gateway entries are monitored. No breaches detected in the last 24 hours."
            </p>
          </div>
        </ERPCard>
      </div>

      <ERPCard accentColor="emerald" title="System Analytics" icon={<BookOpen className="h-5 w-5 text-emerald-600" />}>
        <div className="p-4">
          <AdminCharts />
        </div>
      </ERPCard>
    </div>
  );
}