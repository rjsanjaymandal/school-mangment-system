export const revalidate = 30;
export const dynamic = 'force-dynamic';

import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth-utils";
import HeritageDashboard from "@/components/heritage/HeritageDashboard";
import { Alumni, Student } from "@/types/database";

export default async function HeritagePage() {
  const supabase = await createClient();
  const role = await getSessionRole();

  // Fetch Alumni
  const { data: alumni } = await supabase
    .from("alumni")
    .select("*")
    .order("graduation_year", { ascending: false });

  // Fetch active students for the graduation modal
  const { data: students } = await supabase
    .from("students")
    .select("id, admission_number, profile:profiles(first_name, last_name)")
    .order('admission_number');

  return (
    <HeritageDashboard 
      initialAlumni={(alumni as Alumni[]) || []} 
      students={(students as unknown as Student[]) || []} 
      userRole={role}
    />
  );
}
