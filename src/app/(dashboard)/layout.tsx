import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/shared/Sidebar";
import { Navbar } from "@/components/shared/Navbar";

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

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 bg-white">
        <Sidebar />
      </div>
      <main className="md:pl-64 flex flex-col min-h-screen bg-slate-50/50">
        <Navbar user={user} />
        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  );
}
