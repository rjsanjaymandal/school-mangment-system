import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth-context";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GlobalErrorHandler } from "@/components/error/GlobalErrorHandler";

function LoadingFallback() {
  return (
    <div className="flex-1 p-6 space-y-6 animate-pulse">
      <Skeleton className="h-8 w-48 bg-slate-200" />
      <div className="space-y-4">
        <Skeleton className="h-32 w-full bg-slate-100" />
        <Skeleton className="h-32 w-full bg-slate-100" />
        <Skeleton className="h-32 w-full bg-slate-100" />
      </div>
    </div>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authContext = await getAuthContext();
  
  const { 
    realUser, 
    effectiveUser, 
    effectiveRole, 
    isImpersonating 
  } = authContext;

  if (!realUser) {
    return redirect("/login");
  }

  const impersonationData = isImpersonating ? {
    name: effectiveUser?.full_name || "Unknown",
    role: effectiveRole || "unknown"
  } : null;

  return (
    <GlobalErrorHandler>
      <div className="h-full flex">
              {/* Persistent Sidebar - Never re-renders on navigation */}
              <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50">
                <Sidebar 
                  initialProfile={effectiveUser} 
                  userRole={effectiveRole}
                />
              </aside>
              
              {/* Main Content Area */}
              <div className="flex-1 md:pl-64 flex flex-col min-h-screen bg-slate-50">
                {/* Persistent Navbar */}
                <Navbar user={realUser} userRole={effectiveRole} />
                
                {/* Page Content with Suspense for streaming */}
                <Suspense fallback={<LoadingFallback />}>
                  <main className="flex-1 p-4 md:p-6">
                    {children}
                  </main>
                </Suspense>
              </div>
      </div>
    </GlobalErrorHandler>
  );
}