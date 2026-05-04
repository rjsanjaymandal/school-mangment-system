import {
  GraduationCap,
  Users,
  Calendar,
  CheckCircle,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { InstitutionalService } from "@/lib/services/institutional";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

export default async function TeacherDashboard() {
  const academicYear = await InstitutionalService.getCurrentAcademicYear().catch((err: any) => ({ error: err.message }));
  const activeYearName =
    academicYear && !("error" in academicYear)
      ? academicYear.name
      : "Active Academic Cycle";

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 page-fade-in">
      <PageHeader
        title="Educator Workspace"
        description="Academic Performance Monitoring & Classroom Engagement"
        icon={GraduationCap}
        badge={activeYearName}
      >
        <Link href="/exams">
          <Button variant="outline" className="rounded-xl font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 gap-x-2">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            Grading Center
          </Button>
        </Link>
      </PageHeader>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Active Groups", val: "4", icon: Users, color: "blue" },
          { title: "Pending Grading", val: "12", icon: Calendar, color: "orange" },
          { title: "Attendance Rate", val: "96%", icon: CheckCircle, color: "emerald" },
          { title: "Curriculum Progress", val: "72%", icon: BookOpen, color: "indigo" },
        ].map((m, i) => (
          <Card key={i} className="card-premium rounded-[2.5rem] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className={`h-12 w-12 rounded-2xl bg-${m.color}-500/10 text-${m.color}-600 dark:text-${m.color}-400 flex items-center justify-center`}>
                <m.icon className="h-6 w-6" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {m.title}
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold text-slate-900 dark:text-white leading-none">
                {m.val}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="card-premium rounded-[2.5rem] p-10 space-y-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Classroom Overview</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              Real-time engagement metrics for your primary assigned cohorts.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all cursor-pointer group">
              <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                Advanced Physics (A-102)
              </span>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all cursor-pointer group">
              <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                Quantum Theory (B-204)
              </span>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Card>

        <Card className="card-premium rounded-[2.5rem] p-10 bg-slate-900 dark:bg-slate-950 text-white space-y-8 border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] pointer-events-none" />
          <div>
            <h3 className="text-xl font-bold">Intellectual Strategy</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">
              Upcoming curriculum milestones
            </p>
          </div>
          <div className="flex gap-x-5 items-center p-6 rounded-2xl bg-white/5 border border-white/10 relative z-10">
            <div className="h-12 w-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-bold">Mid-Term Assessment Cycle</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">
                Starts in 3 days • System Locked
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
  );
}

