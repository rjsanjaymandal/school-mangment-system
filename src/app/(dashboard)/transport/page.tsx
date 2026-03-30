import { createClient } from "@/lib/supabase/server";
import { TransportDashboard } from "@/components/transport/TransportDashboard";
import { getSessionRole } from "@/lib/auth-utils";

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
    <TransportDashboard
      routes={routes || []}
      stops={stops || []}
      assignments={assignments || []}
      userRole={role}
    />
  );
}

