import { createClient } from "@/lib/supabase/server";
import HeritageDashboard from "@/components/heritage/HeritageDashboard";
import { Alumni } from "@/types/database";

export default async function HeritagePage() {
  const supabase = await createClient();

  const { data: alumni, error } = await supabase
    .from("alumni")
    .select("*")
    .order("graduation_year", { ascending: false });

  if (error) {
    console.error("Error fetching alumni:", error);
  }

  return <HeritageDashboard initialAlumni={(alumni as Alumni[]) || []} />;
}
