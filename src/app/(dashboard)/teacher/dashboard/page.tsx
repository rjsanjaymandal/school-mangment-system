import {
  GraduationCap,
  Users,
  Calendar,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstitutionalService } from "@/lib/services/institutional";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function TeacherDashboard() {
  const academicYear = await InstitutionalService.getCurrentAcademicYear();
  const activeYearName =
    academicYear && !("error" in academicYear)
      ? academicYear.name
      : "Active Academic Cycle";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
            Educator Workspace
          </h2>
          <div className="flex items-center gap-x-2 mt-1">
            <p className="text-slate-500 font-medium tracking-tight">
              Academic Performance Monitoring & Classroom Engagement
            </p>
            <Badge
              variant="outline"
              className="border-blue-200 text-blue-600 bg-blue-50 font-black text-[10px]"
            >
              {activeYearName}
            </Badge>
          </div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-2xl neon-blue">
          <GraduationCap className="h-6 w-6" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Active Groups",
            val: "4",
            icon: Users,
            color: "text-blue-600",
          },
          {
            title: "Pending Grading",
            val: "12",
            icon: Calendar,
            color: "text-orange-600",
          },
          {
            title: "Attendance Rate",
            val: "96%",
            icon: CheckCircle,
            color: "text-green-600",
          },
          {
            title: "Curriculum Progress",
            val: "72%",
            icon: GraduationCap,
            color: "text-purple-600",
          },
        ].map((m, i) => (
          <Card
            key={i}
            className="border-none glass futuristic-card bg-white/40 p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  {m.title}
                </p>
                <div className="text-2xl font-black text-slate-900">
                  {m.val}
                </div>
              </div>
              <div
                className={`${m.color} h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center`}
              >
                <m.icon className="h-4 w-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none glass bg-white/50 backdrop-blur-xl p-8 group">
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Classroom Overview
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Real-time engagement metrics for your primary assigned cohorts.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-50 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <span className="font-bold text-slate-900">
                Advanced Physics (A-102)
              </span>
              <ArrowRight className="h-4 w-4 text-slate-300" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-50 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <span className="font-bold text-slate-900">
                Quantum Theory (B-204)
              </span>
              <ArrowRight className="h-4 w-4 text-slate-300" />
            </div>
          </div>
        </Card>

        <Card className="border-none glass bg-slate-900 text-white p-8">
          <h3 className="text-xl font-bold mb-2">Intellectual Strategy</h3>
          <p className="text-xs text-blue-300 opacity-60 mb-6">
            Upcoming curriculum milestones
          </p>
          <div className="flex gap-x-4 items-center p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Mid-Term Assessment Cycle</p>
              <p className="text-[10px] opacity-60 uppercase font-black">
                Starts in 3 days
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
