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

  // Handle Shadow Mode Logic
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
    <div className="h-full flex">
      {/* Fixed Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        <Sidebar initialProfile={activeProfile} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen bg-slate-50">
        <Navbar user={user} />
        
        {/* Shadow Mode Banner */}
        {impersonationData && (
          <ImpersonationBanner
            targetName={impersonationData.name}
            targetRole={impersonationData.role}
          />
        )}
        
        {/* Page Content - using p-6 as per ERP standard */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

