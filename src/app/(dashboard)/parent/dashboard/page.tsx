import { GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParentDashboard() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-foreground uppercase">
            Parent Insight Hub
          </h2>
          <p className="text-muted-foreground font-medium tracking-tight">
            Child Welfare & Academic Progress Monitoring
          </p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-2xl">
          <GraduationCap className="h-6 w-6" />
        </div>
      </div>

      <Card className="border-none glass bg-white/50 backdrop-blur-xl p-12 text-center">
        <h3 className="text-2xl font-black text-foreground mb-2">
          Parental Dashboard
        </h3>
        <p className="text-muted-foreground font-medium">
          Stay updated with your child's education and school events.
        </p>
      </Card>
    </div>
  );
}

