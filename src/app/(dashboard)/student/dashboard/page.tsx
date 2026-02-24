import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
            Student Portal
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">
            Learning Journey & Academic Achievement Tracking
          </p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-green-500 text-white flex items-center justify-center shadow-2xl">
          <GraduationCap className="h-6 w-6" />
        </div>
      </div>

      <Card className="border-none glass bg-white/50 backdrop-blur-xl p-12 text-center">
        <h3 className="text-2xl font-black text-slate-900 mb-2">
          Ready to learn?
        </h3>
        <p className="text-slate-500 font-medium">
          Access your grades, projects, and upcoming exams here.
        </p>
      </Card>
    </div>
  );
}
