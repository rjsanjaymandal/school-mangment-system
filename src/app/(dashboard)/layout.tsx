import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth-context";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { ImpersonationBanner } from "@/components/shared/ImpersonationBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { 
    realUser, 
    effectiveUser, 
    effectiveRole, 
    isImpersonating 
  } = await getAuthContext();

  if (!realUser) {
    return redirect("/login");
  }

  const impersonationData = isImpersonating ? {
    name: effectiveUser?.full_name || "Unknown",
    role: effectiveRole || "unknown"
  } : null;

  return (
    <div className="h-full flex">
      {/* Fixed Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        <Sidebar initialProfile={effectiveUser} />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen bg-slate-50">
        <Navbar user={realUser} />
        
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

