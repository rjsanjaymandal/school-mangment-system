import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
            Educator Workspace
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">
            Academic Performance Monitoring & Classroom Engagement
          </p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-2xl">
          <GraduationCap className="h-6 w-6" />
        </div>
      </div>

      <Card className="border-none glass bg-white/50 backdrop-blur-xl p-12 text-center">
        <h3 className="text-2xl font-black text-slate-900 mb-2">
          Welcome to your Teacher Hub
        </h3>
        <p className="text-slate-500 font-medium">
          Manage your classes, students, and curriculum from a single interface.
        </p>
      </Card>
    </div>
  );
}
