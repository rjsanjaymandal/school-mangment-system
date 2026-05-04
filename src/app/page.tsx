import { createClient } from "@/lib/supabase/server";
import { RoleSelection } from "@/components/shared/RoleSelection";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  
  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    console.error("Auth check failed on landing page:", error);
  }

  if (user) {
    redirect("/launcher");
  }

  return <RoleSelection />;
}
