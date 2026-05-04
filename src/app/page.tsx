import { createClient } from "@/lib/supabase/server";
import { RoleSelection } from "@/components/shared/RoleSelection";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/launcher");
    }
  } catch (error) {
    console.error("Auth check failed on landing page:", error);
    // Continue to show role selection if auth check fails
  }

  return <RoleSelection />;
}
