import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth-utils";
import ActivitiesDashboard from "@/components/activities/ActivitiesDashboard";
import { Activity, Teacher } from "@/types/database";

export default async function ActivitiesPage() {
  const supabase = await createClient();
  const role = await getSessionRole();

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: teachers } = await supabase
    .from("teachers")
    .select("id, profile:profiles(first_name, last_name)")
    .order("id");

  return (
    <ActivitiesDashboard 
      initialActivities={(activities as Activity[]) || []} 
      teachers={(teachers as unknown as Teacher[]) || []} 
      userRole={role}
      isStudent={role === "student"}
    />
  );
}
