import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
            Admin Mission Control
          </h2>
          <p className="text-slate-500 font-medium tracking-tight">
            Institutional Governance & Strategic System Management
          </p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-2xl">
          <GraduationCap className="h-6 w-6" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none glass futuristic-card bg-slate-900 text-white p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-blue-400">
              System Health
            </CardTitle>
          </CardHeader>
          <div className="text-3xl font-black">ACTIVE</div>
          <p className="text-xs text-blue-300/60 mt-2 font-medium">
            All core services operational
          </p>
        </Card>
      </div>

      <Card className="border-none glass bg-white/50 backdrop-blur-xl p-12 text-center">
        <h3 className="text-2xl font-black text-slate-900 mb-2">
          Welcome Back, Administrator
        </h3>
        <p className="text-slate-500 font-medium">
          Your centralized command center for school management is ready.
        </p>
      </Card>
    </div>
  );
}
