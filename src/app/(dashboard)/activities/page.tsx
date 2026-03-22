import { createClient } from "@/lib/supabase/server";
import ActivitiesDashboard from "@/components/activities/ActivitiesDashboard";
import { Activity } from "@/types/database";

export default async function ActivitiesPage() {
  const supabase = await createClient();

  const { data: activities, error } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching activities:", error);
  }

  return <ActivitiesDashboard initialActivities={(activities as Activity[]) || []} />;
}

