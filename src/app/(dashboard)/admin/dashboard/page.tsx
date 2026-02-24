import {
  GraduationCap,
  Layout,
  Users,
  BookOpen,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstitutionalService } from "@/lib/services/institutional";
import { UserService } from "@/lib/services/user";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboard() {
  const [academicYear, statsData] = await Promise.all([
    InstitutionalService.getCurrentAcademicYear(),
    UserService.getSystemStats(),
  ]);

  const realStats =
    statsData && !("error" in statsData)
      ? statsData
      : {
          studentCount: 0,
          teacherCount: 0,
        };

  const activeYearName =
    academicYear && !("error" in academicYear)
      ? academicYear.name
      : "Academic Year 2023-24";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
            Admin Mission Control
          </h2>
          <div className="flex items-center gap-x-2 mt-1">
            <p className="text-slate-500 font-medium tracking-tight">
              Institutional Governance & Strategic System Management
            </p>
            <Badge
              variant="outline"
              className="border-blue-200 text-blue-600 bg-blue-50 font-black text-[10px]"
            >
              {activeYearName}
            </Badge>
          </div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-2xl neon-blue">
          <GraduationCap className="h-6 w-6" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none glass futuristic-card bg-slate-900 text-white p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-blue-400">
              Operational Status
            </CardTitle>
          </CardHeader>
          <div className="text-3xl font-black">ACTIVE</div>
          <p className="text-xs text-blue-300/60 mt-2 font-medium">
            Institutional kernels operational
          </p>
        </Card>

        <Card className="border-none glass futuristic-card bg-white/40 p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Global Enrollment
            </CardTitle>
          </CardHeader>
          <div className="text-3xl font-black text-slate-900">
            {realStats.studentCount}
          </div>
          <div className="flex items-center gap-x-1 mt-2 text-[10px] font-bold text-slate-500">
            <Users className="h-3 w-3" />
            Verified Identities
          </div>
        </Card>

        <Card className="border-none glass futuristic-card bg-white/40 p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Faculty Pool
            </CardTitle>
          </CardHeader>
          <div className="text-3xl font-black text-slate-900">
            {realStats.teacherCount}
          </div>
          <div className="flex items-center gap-x-1 mt-2 text-[10px] font-bold text-slate-500">
            <Layout className="h-3 w-3" />
            Academic Staff
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none glass futuristic-card bg-white/40 p-8">
          <div className="flex items-center gap-x-4 mb-4">
            <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Academic Integrity</h3>
              <p className="text-xs text-slate-500">
                Curriculum and syllabus sync status
              </p>
            </div>
          </div>
          <div className="space-y-4 pt-2">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-[85%] rounded-full" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              85% Syllabus Completion
            </p>
          </div>
        </Card>

        <Card className="border-none glass futuristic-card bg-slate-950 p-8 text-white">
          <div className="flex items-center gap-x-4 mb-4">
            <div className="h-10 w-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold">Security Oversight</h3>
              <p className="text-xs text-slate-400">
                Threat detection & access monitoring
              </p>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-4">
            <p className="text-xs font-medium italic opacity-70 italic">
              "Autonomous kernels are monitoring all gateway entries. No
              breaches detected in the last 24h cycle."
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
