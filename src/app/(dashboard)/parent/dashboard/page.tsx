import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Baby, TrendingUp, Clock, IndianRupee, MessageSquare } from "lucide-react";
import { ERPCard } from "@/components/ui/erp-card";

export default async function ParentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: childrenLinks } = await supabase
    .from("guardian_students")
    .select("student_id, student:students(*, grade:grades(name))")
    .eq("guardian_id", user?.id);

  const children = childrenLinks?.map(link => link.student) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Parent Dashboard</h1>
          <p className="text-sm text-slate-500">Monitor your children's progress</p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
          Guardian Verified
        </Badge>
      </div>

      {children.length === 0 ? (
        <div className="text-center py-12">
          <Baby className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600">No Children Linked</h3>
          <p className="text-sm text-slate-400 mt-2">Please contact the school to link your children.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {children.map((child: any) => (
            <div key={child.id} className="space-y-4">
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-md p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-md bg-purple-50 flex items-center justify-center">
                    <Baby className="h-8 w-8 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{child.full_name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="outline" className="text-xs">Grade {child.grade?.name || "N/A"}</Badge>
                      <span className="text-xs text-slate-500">ID: {child.admission_number}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="rounded-md">
                  View Details
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <ERPCard title="Attendance" description="This month" color="purple">
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-semibold text-slate-900">94%</span>
                      <Badge className="bg-emerald-50 text-emerald-600 text-xs">Stable</Badge>
                    </div>
                    <p className="text-xs text-slate-500">Last: Yesterday</p>
                  </div>
                </ERPCard>

                <ERPCard title="Academic" description="Current GPA" color="purple">
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-semibold text-slate-900">3.8</span>
                      <span className="text-lg text-slate-500">GPA</span>
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-xs text-slate-500">Top 5%</p>
                  </div>
                </ERPCard>

                <ERPCard title="Fees" description="Pending" color="purple">
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-slate-900">₹12,500</span>
                    </div>
                    <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 rounded-md">
                      Pay Now
                    </Button>
                  </div>
                </ERPCard>

                <ERPCard title="Messages" description="From school" color="purple">
                  <div className="space-y-2">
                    <div className="flex -space-x-2">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center border-2 border-white">
                        <GraduationCap className="h-4 w-4 text-purple-500" />
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full rounded-md">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </ERPCard>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}