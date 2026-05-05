export const revalidate = 30;
export const dynamic = 'force-static';

import { createClient } from "@/lib/supabase/server";
import { GuardianDashboard } from "@/components/guardian/GuardianDashboard";

export default async function GuardianPage() {
  const supabase = await createClient();

  const { data: guardianLinks } = await supabase
    .from("guardian_students")
    .select("*, guardian:profiles!guardian_id(*), student:students(*, profile:profiles(*), class:classes(*))")
    .order("created_at", { ascending: false });

  // Get some aggregate data for the dashboard
  const { data: recentConduct } = await supabase
    .from("student_conduct")
    .select("*, student:students(*, profile:profiles(*))")
    .order("incident_date", { ascending: false })
    .limit(10);

  const { data: recentAttendance } = await supabase
    .from("attendance")
    .select("*, student:students(*, profile:profiles(*))")
    .order("date", { ascending: false })
    .limit(20);

  return (
    <GuardianDashboard
      guardianLinks={guardianLinks || []}
      recentConduct={recentConduct || []}
      recentAttendance={recentAttendance || []}
    />
  );
}

