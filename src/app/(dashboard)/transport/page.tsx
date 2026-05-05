export const revalidate = 30;

import { createClient } from "@/lib/supabase/server";
import { TransportDashboard } from "@/components/transport/TransportDashboard";
import { getSessionRole } from "@/lib/auth-utils";
import { Bus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ERPCard } from "@/components/ui/erp-card";

export default async function TransportPage() {
  const supabase = await createClient();

  const role = await getSessionRole();
  const { data: { user } } = await supabase.auth.getUser();
  const isStudent = role === "student";

  const { data: routes } = await supabase
    .from("bus_routes")
    .select("*")
    .order("name");

  const { data: stops } = await supabase
    .from("bus_stops")
    .select("*, route:bus_routes(*)")
    .order("stop_order");

  let assignmentQuery = supabase
    .from("student_transport")
    .select("*, student:students(*, profile:profiles(*)), route:bus_routes(*), stop:bus_stops(*)")
    .order("created_at", { ascending: false });

  if (isStudent && user) {
    const { data: studentData } = await supabase
      .from("students")
      .select("id")
      .eq("id", user.id)
      .single();
    if (studentData) {
      assignmentQuery = assignmentQuery.eq("student_id", studentData.id);
    } else {
      assignmentQuery = assignmentQuery.eq("student_id", "00000000-0000-0000-0000-000000000000");
    }
  }

  const { data: assignments } = await assignmentQuery;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-md">
            <Bus className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Transport</h1>
            <p className="text-sm text-slate-500">Manage routes and transportation</p>
          </div>
        </div>
        <Button className="rounded-md bg-emerald-600 hover:bg-emerald-700 gap-2">
          <Plus className="h-4 w-4" />
          Add Route
        </Button>
      </div>

      <ERPCard
        title="Bus Routes"
        description="Manage routes and students"
        icon={<Bus className="h-5 w-5" />}
        color="amber"
      >
        <TransportDashboard
          routes={routes || []}
          stops={stops || []}
          assignments={assignments || []}
          userRole={role}
        />
      </ERPCard>
    </div>
  );
}

