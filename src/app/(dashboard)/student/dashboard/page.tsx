import { GraduationCap, Star, Book, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstitutionalService } from "@/lib/services/institutional";
import { Badge } from "@/components/ui/badge";

export default async function StudentDashboard() {
  const academicYear = await InstitutionalService.getCurrentAcademicYear();
  const activeYearName =
    academicYear && !("error" in academicYear)
      ? academicYear.name
      : "Academic Journey 2024";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
            Student Portal
          </h2>
          <div className="flex items-center gap-x-2 mt-1">
            <p className="text-slate-500 font-medium tracking-tight">
              Learning Journey & Academic Achievement Tracking
            </p>
            <Badge
              variant="outline"
              className="border-green-200 text-green-600 bg-green-50 font-black text-[10px]"
            >
              {activeYearName}
            </Badge>
          </div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-green-500 text-white flex items-center justify-center shadow-2xl neon-green">
          <GraduationCap className="h-6 w-6" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "GPA Index",
            val: "3.88",
            icon: Star,
            color: "text-amber-500",
          },
          {
            title: "Course Load",
            val: "6 Units",
            icon: Book,
            color: "text-blue-500",
          },
          {
            title: "Active Hours",
            val: "142h",
            icon: Clock,
            color: "text-purple-500",
          },
          {
            title: "Trend",
            val: "+0.2",
            icon: TrendingUp,
            color: "text-green-500",
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-none glass bg-white/50 p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            Academic Milestones
          </h3>
          <div className="space-y-4">
            {[
              { name: "Mathematics Mid-Term", grade: "A+", date: "2 days ago" },
              {
                name: "Advanced Physics Project",
                grade: "A",
                date: "Last week",
              },
              {
                name: "Library Research Paper",
                grade: "Pending",
                date: "Due Tomorrow",
              },
            ].map((m, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-50 group hover:shadow-md transition-all cursor-default"
              >
                <div>
                  <p className="font-bold text-slate-900">{m.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                    {m.date}
                  </p>
                </div>
                <Badge
                  className={
                    m.grade === "Pending"
                      ? "bg-slate-100 text-slate-400"
                      : "bg-green-100 text-green-600 border-none"
                  }
                >
                  {m.grade}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-1 border-none glass futuristic-card bg-slate-900 text-white p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <GraduationCap className="h-32 w-32 -mr-8 -mt-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Next Milestone</h3>
          <p className="text-xs text-blue-300 opacity-60 mb-8">
            Calculus Final Entrance Exam
          </p>
          <div className="text-4xl font-black mb-2 italic">72:00:00</div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
            Time to Engagement
          </p>

          <button className="w-full mt-8 py-4 rounded-2xl bg-blue-600 font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">
            Launch Preparation
          </button>
        </Card>
      </div>
    </div>
  );
}
