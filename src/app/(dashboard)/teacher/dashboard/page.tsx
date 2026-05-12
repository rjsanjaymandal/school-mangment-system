import {
  GraduationCap,
  Users,
  Calendar,
  CheckCircle,
  BookOpen,
} from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";
import { InstitutionalService } from "@/lib/services/institutional";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TeacherDashboard() {
  const supabase = await createClient();
  const academicYear = await InstitutionalService.getCurrentAcademicYear(supabase).catch((err: any) => ({ error: err.message }));
  const activeYearName =
    academicYear && !("error" in academicYear)
      ? academicYear.name
      : "Active Academic Cycle";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-foreground font-medium">Teacher</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">Educator Workspace</h1>
          <p className="text-sm text-muted-foreground">{activeYearName}</p>
        </div>
        <Link href="/exams">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Grading Center
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Active Groups", val: "4", icon: Users, color: "blue" },
          { title: "Pending Grading", val: "12", icon: Calendar, color: "amber" },
          { title: "Attendance Rate", val: "96%", icon: CheckCircle, color: "emerald" },
          { title: "Curriculum Progress", val: "72%", icon: BookOpen, color: "purple" },
        ].map((m, i) => (
          <ERPCard key={i} accentColor={m.color as any}>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-lg bg-${m.color}-100 flex items-center justify-center`}>
                  <m.icon className={`h-5 w-5 text-${m.color}-600`} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{m.val}</p>
                <p className="text-xs text-muted-foreground">{m.title}</p>
              </div>
            </div>
          </ERPCard>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ERPCard accentColor="blue" title="Classroom Overview">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <span className="font-medium">Advanced Physics (A-102)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <span className="font-medium">Quantum Theory (B-204)</span>
            </div>
          </div>
        </ERPCard>

        <ERPCard accentColor="amber" title="Upcoming Events">
          <div className="p-4">
            <div className="flex items-center gap-4 p-4 rounded-md bg-amber-50">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium">Mid-Term Assessment</p>
                <p className="text-xs text-muted-foreground">Starts in 3 days</p>
              </div>
            </div>
          </div>
        </ERPCard>
      </div>
    </div>
  );
}