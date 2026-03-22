import { createClient } from "@/lib/supabase/server";
import { TransportDashboard } from "@/components/transport/TransportDashboard";

export default async function TransportPage() {
  const supabase = await createClient();

  const { data: routes } = await supabase
    .from("bus_routes")
    .select("*")
    .order("name");

  const { data: stops } = await supabase
    .from("bus_stops")
    .select("*, route:bus_routes(*)")
    .order("stop_order");

  const { data: assignments } = await supabase
    .from("student_transport")
    .select("*, student:students(*, profile:profiles(*)), route:bus_routes(*), stop:bus_stops(*)")
    .order("created_at", { ascending: false });

  return (
    <TransportDashboard
      routes={routes || []}
      stops={stops || []}
      assignments={assignments || []}
    />
  );
}

