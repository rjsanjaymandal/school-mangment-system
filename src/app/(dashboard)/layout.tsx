import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { ImpersonationBanner } from "@/components/shared/ImpersonationBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Handle Impersonation Logic
  const cookieStore = await cookies();
  const impersonationId = cookieStore.get("impersonation_user_id")?.value;
  
  const [targetProfileRes, activeProfileRes] = await Promise.all([
    impersonationId 
      ? supabase.from("profiles").select("full_name, role").eq("id", impersonationId).single()
      : Promise.resolve({ data: null }),
    supabase.from("profiles").select("*").eq("id", impersonationId || user.id).single()
  ]);

  const targetProfile = targetProfileRes.data;
  const activeProfile = activeProfileRes.data;

  let impersonationData = null;
  if (targetProfile) {
    impersonationData = {
      name: targetProfile.full_name,
      role: targetProfile.role,
    };
  }

  return (
    <div className="h-full relative">
      {impersonationData && (
        <ImpersonationBanner
          targetName={impersonationData.name}
          targetRole={impersonationData.role}
        />
      )}
      <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 bg-card">
        <Sidebar initialProfile={activeProfile} />
      </div>
      <main className="md:pl-64 flex flex-col min-h-screen bg-background">
        <Navbar user={user} />
        <div className="flex-1 p-8 reveal-1">{children}</div>
      </main>
    </div>
  );
}

